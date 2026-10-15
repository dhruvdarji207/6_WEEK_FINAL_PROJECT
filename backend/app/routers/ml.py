from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.buyer_requirement import BuyerRequirement
from backend.app.schemas.ml import (
    PricePredictionRequest, PricePredictionResponse,
    QuantityForecastRequest, QuantityForecastResponse,
    DemandTrendsResponse, DemandCategoryStat
)
from backend.app.schemas.impact import ImpactCalculationRequest, ImpactCalculationResponse
from ml.price_predictor import price_predictor
from ml.quantity_forecaster import forecast_waste_quantity
from ml.environmental_impact import calculate_environmental_impact

router = APIRouter(prefix="/ml", tags=["Machine Learning Modules"])

@router.post("/predict-price", response_model=PricePredictionResponse)
def predict_price(req: PricePredictionRequest):
    """
    Returns indicative secondary material price prediction based on
    cross-validated model trained on completed transaction records.
    """
    res = price_predictor.predict(
        material_category=req.material_category,
        quality_score_0_100=req.quality_score_0_100,
        contamination_pct=req.contamination_pct,
        quantity_tonnes=req.quantity_tonnes,
        distance_km=req.distance_km or 100.0
    )
    return PricePredictionResponse(**res)

@router.post("/predict-quantity", response_model=QuantityForecastResponse)
def predict_quantity(req: QuantityForecastRequest):
    """
    Evaluates data sufficiency and forecasts future waste generation volumes.
    Enforces minimum 6 dated observation threshold before generating projections.
    """
    obs_dicts = [o.model_dump() for o in req.historical_observations]
    res = forecast_waste_quantity(
        historical_observations=obs_dicts,
        material_category=req.material_category,
        source_sector=req.source_sector or "Manufacturing"
    )
    return QuantityForecastResponse(**res)

@router.get("/demand-trends", response_model=DemandTrendsResponse)
def get_demand_trends(db: Session = Depends(get_db)):
    """
    Aggregates buyer requirements by material category to analyze market demand,
    total requested volume, and average buyer budget.
    """
    results = db.query(
        BuyerRequirement.required_material_category,
        func.count(BuyerRequirement.id).label("count"),
        func.sum(BuyerRequirement.maximum_quantity_tonnes).label("total_tonnes"),
        func.avg(BuyerRequirement.max_budget_inr_per_kg).label("avg_budget")
    ).group_by(BuyerRequirement.required_material_category).all()

    category_stats: list[DemandCategoryStat] = []
    total_reqs = 0

    for cat, count, total_t, avg_b in results:
        total_reqs += count
        category_stats.append(
            DemandCategoryStat(
                material_category=cat,
                active_requirements_count=count,
                total_requested_tonnes=round(float(total_t or 0), 2),
                average_budget_inr_per_kg=round(float(avg_b or 0), 2)
            )
        )

    category_stats.sort(key=lambda x: x.total_requested_tonnes, reverse=True)
    top_cats = [c.material_category for c in category_stats[:3]]

    return DemandTrendsResponse(
        total_requirements=total_reqs,
        category_breakdown=category_stats,
        top_demanded_categories=top_cats
    )

@router.post("/impact-estimate", response_model=ImpactCalculationResponse)
def estimate_impact(req: ImpactCalculationRequest):
    """
    Transparent environmental impact estimation based on DEFRA and IPCC LCA standards.
    """
    res = calculate_environmental_impact(
        material_category=req.material_category,
        quantity_tonnes=req.quantity_tonnes,
        reuse_yield_fraction=req.reuse_yield_fraction or 0.75,
        distance_km=req.distance_km or 100.0
    )
    return ImpactCalculationResponse(**res)
