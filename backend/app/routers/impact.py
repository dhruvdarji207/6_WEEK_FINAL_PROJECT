from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.exchange import ExchangeTransaction
from backend.app.schemas.impact import GlobalImpactSummary, CategoryImpactStat
from ml.environmental_impact import calculate_environmental_impact

router = APIRouter(prefix="/impact", tags=["Environmental Impact & Circularity"])

@router.get("/summary", response_model=GlobalImpactSummary)
def get_global_impact_summary(db: Session = Depends(get_db)):
    """
    Computes cumulative circularity and environmental impact from all completed transactions.
    Distinguishes demo data vs user-verified pilot transactions.
    """
    transactions = db.query(ExchangeTransaction).filter(ExchangeTransaction.match_completed == True).all()

    total_exchanged = 0.0
    total_diverted = 0.0
    total_co2e = 0.0
    verified_count = 0

    category_buckets: dict[str, dict] = {}

    for tx in transactions:
        qty = tx.quantity_tonnes or 0.0
        yield_frac = tx.estimated_reuse_yield_fraction or 0.75
        cat = tx.material_category or "general"

        impact = calculate_environmental_impact(
            material_category=cat,
            quantity_tonnes=qty,
            reuse_yield_fraction=yield_frac,
            distance_km=tx.distance_km or 100.0
        )

        div_t = impact["waste_diverted_tonnes"]
        co2_t = impact["avoided_co2e_tonnes"]

        total_exchanged += qty
        total_diverted += div_t
        total_co2e += co2_t
        if tx.verified_by_admin:
            verified_count += 1

        if cat not in category_buckets:
            category_buckets[cat] = {
                "exchanged": 0.0,
                "diverted": 0.0,
                "co2e": 0.0,
                "count": 0
            }
        category_buckets[cat]["exchanged"] += qty
        category_buckets[cat]["diverted"] += div_t
        category_buckets[cat]["co2e"] += co2_t
        category_buckets[cat]["count"] += 1

    breakdown: list[CategoryImpactStat] = []
    for cat, data in category_buckets.items():
        breakdown.append(
            CategoryImpactStat(
                material_category=cat,
                exchanged_tonnes=round(data["exchanged"], 2),
                diverted_tonnes=round(data["diverted"], 2),
                avoided_co2e_tonnes=round(data["co2e"], 2),
                completed_transactions=data["count"]
            )
        )
    breakdown.sort(key=lambda x: x.diverted_tonnes, reverse=True)

    has_synthetic = any(tx.demo_data_flag for tx in transactions)

    return GlobalImpactSummary(
        total_exchanged_tonnes=round(total_exchanged, 2),
        total_diverted_tonnes=round(total_diverted, 2),
        total_avoided_co2e_tonnes=round(total_co2e, 2),
        total_completed_exchanges=len(transactions),
        verified_transactions_count=verified_count,
        category_breakdown=breakdown,
        demo_data_flag=has_synthetic,
        methodology_summary=(
            "Calculated based on ISO 14040/44 Life Cycle Assessment displacement framework. "
            "Avoided CO2e is derived from virgin material displacement factors (DEFRA UK & IPCC) "
            "minus secondary freight logistics emissions."
        )
    )
