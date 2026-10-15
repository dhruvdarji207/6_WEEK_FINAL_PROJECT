from pathlib import Path
from typing import Any
import joblib
from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.waste_listing import WasteListing
from backend.app.models.buyer_requirement import BuyerRequirement
from backend.app.schemas.waste_listing import WasteListingOut
from backend.app.schemas.matching import MatchRequest, MatchResponse, MatchResultItem, SubScoreBreakdown
from ml.matching_engine import ExplainableMatchingEngine

router = APIRouter(prefix="/matching", tags=["AI Matching Engine"])

ARTIFACTS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "ml" / "artifacts"
RANKER_MODEL_PATH = ARTIFACTS_DIR / "match_ranker.joblib"

@router.post("/recommend", response_model=MatchResponse)
def recommend_matches(
    req: MatchRequest,
    db: Session = Depends(get_db)
):
    # Resolve buyer criteria either from database requirement or request body
    if req.buyer_requirement_id:
        db_req = db.query(BuyerRequirement).filter(BuyerRequirement.id == req.buyer_requirement_id).first()
        if not db_req:
            raise HTTPException(status_code=404, detail="Buyer requirement not found.")
        criteria = {
            "required_material_category": db_req.required_material_category,
            "buyer_sector": db_req.buyer_sector,
            "minimum_quality_score": db_req.minimum_quality_score,
            "maximum_contamination_pct": db_req.maximum_contamination_pct,
            "minimum_quantity_tonnes": db_req.minimum_quantity_tonnes,
            "maximum_quantity_tonnes": db_req.maximum_quantity_tonnes,
            "max_budget_inr_per_kg": db_req.max_budget_inr_per_kg,
            "city": db_req.city,
            "latitude": db_req.latitude,
            "longitude": db_req.longitude,
            "buyer_name": db_req.buyer_name
        }
    else:
        if not req.required_material_category:
            raise HTTPException(status_code=400, detail="Must provide required_material_category or buyer_requirement_id.")
        criteria = {
            "required_material_category": req.required_material_category,
            "buyer_sector": req.buyer_sector or "Manufacturing",
            "minimum_quality_score": req.minimum_quality_score or 65.0,
            "maximum_contamination_pct": req.maximum_contamination_pct or 20.0,
            "minimum_quantity_tonnes": (req.quantity_tonnes * 0.5) if req.quantity_tonnes else 1.0,
            "maximum_quantity_tonnes": (req.quantity_tonnes * 1.5) if req.quantity_tonnes else 50.0,
            "max_budget_inr_per_kg": req.max_budget_inr_per_kg or 2.0,
            "city": req.city or "Ahmedabad",
            "latitude": req.latitude or 23.0225,
            "longitude": req.longitude or 72.5714,
            "buyer_name": "On-demand Buyer Query"
        }

    # Query all active or available listings
    candidate_listings = db.query(WasteListing).filter(WasteListing.listing_status == "Available").all()
    total_evaluated = len(candidate_listings)

    results: list[MatchResultItem] = []

    # If ML mode requested, check if ranker model is available
    ml_ranker = None
    if req.mode == "ml_ranking" and RANKER_MODEL_PATH.exists():
        try:
            saved = joblib.load(RANKER_MODEL_PATH)
            ml_ranker = saved.get("pipeline")
        except Exception:
            ml_ranker = None

    for item in candidate_listings:
        listing_dict = {
            "id": item.id,
            "material_name": item.material_name,
            "material_category": item.material_category,
            "source_sector": item.source_sector,
            "condition": item.condition,
            "quantity_tonnes": item.quantity_tonnes,
            "quality_score_0_100": item.quality_score_0_100,
            "contamination_est_pct": item.contamination_est_pct,
            "indicative_price_inr_per_kg": item.indicative_price_inr_per_kg,
            "city": item.city,
            "latitude": item.latitude,
            "longitude": item.longitude,
            "listing_status": item.listing_status,
            "hazardous_flag": item.hazardous_flag
        }

        eval_res = ExplainableMatchingEngine.evaluate_pair(
            listing=listing_dict,
            requirement=criteria,
            mode=req.mode
        )

        overall_score = eval_res["overall_score"]

        # If ML ranking model is active and pair passes basic compatibility, combine with ML probability
        if ml_ranker is not None and eval_res["is_compatible"]:
            try:
                row_df = pd.DataFrame([{
                    "material_category": item.material_category,
                    "source_sector": item.source_sector,
                    "buyer_sector": criteria["buyer_sector"],
                    "quantity_tonnes": item.quantity_tonnes,
                    "quality_score_0_100": item.quality_score_0_100,
                    "contamination_pct": item.contamination_est_pct,
                    "price_inr_per_kg": item.indicative_price_inr_per_kg,
                    "distance_km": eval_res["sub_scores"]["distance_km"]
                }])
                prob = float(ml_ranker.predict_proba(row_df)[0][1])
                # Blended score: 60% rule-based explainability + 40% ML completion probability
                blended = round(0.6 * overall_score + 0.4 * (prob * 100), 1)
                overall_score = min(100.0, blended)
                eval_res["explanation"].append(f"ML Completion Ranker: Estimated transaction success probability is {prob * 100:.1f}%.")
            except Exception:
                pass

        results.append(
            MatchResultItem(
                listing=WasteListingOut.model_validate(item),
                overall_score=overall_score,
                recommendation_level=eval_res["recommendation_level"],
                is_compatible=eval_res["is_compatible"],
                sub_scores=SubScoreBreakdown(**eval_res["sub_scores"]),
                explanation=eval_res["explanation"],
                failed_constraints=eval_res["failed_constraints"],
                scoring_mode=req.mode
            )
        )

    # Sort candidates by overall score descending
    results.sort(key=lambda x: (x.is_compatible, x.overall_score), reverse=True)

    return MatchResponse(
        buyer_requirement_summary=criteria,
        total_evaluated=total_evaluated,
        matches=results[:20]  # Return top 20 best matches
    )

@router.get("/benchmark")
def get_ml_benchmark():
    """Returns comparative metrics between Baseline Rule-Based Model and ML Ranking Model."""
    if RANKER_MODEL_PATH.exists():
        try:
            saved = joblib.load(RANKER_MODEL_PATH)
            return {
                "status": "trained",
                "benchmark": saved.get("benchmark", {}),
                "evaluation_notice": (
                    "Trained on synthetic transaction outcomes. GradientBoostingClassifier "
                    "demonstrates higher ROC-AUC and precision over Logistic Regression baseline."
                )
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}
    return {"status": "untrained", "message": "ML ranking model artifact not yet generated."}
