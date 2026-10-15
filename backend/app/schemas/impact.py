from typing import Optional
from pydantic import BaseModel, Field

class ImpactCalculationRequest(BaseModel):
    material_category: str
    quantity_tonnes: float = Field(..., gt=0)
    reuse_yield_fraction: Optional[float] = Field(0.75, ge=0.1, le=1.0)
    distance_km: Optional[float] = Field(100.0, ge=0)

class ImpactCalculationResponse(BaseModel):
    material_category: str
    input_quantity_tonnes: float
    reuse_yield_fraction: float
    waste_diverted_tonnes: float
    avoided_co2e_tonnes: float
    emission_factor_kg_co2e_per_kg: float
    baseline_disposal_method: str
    factor_source_reference: str
    assumptions: list[str]
    sdg_alignment: list[str]
    disclaimer: str = (
        "Calculated using standard industrial LCA displacement baselines. "
        "Verified pilot lifecycle measurements are required for certified carbon credit reporting."
    )

class CategoryImpactStat(BaseModel):
    material_category: str
    exchanged_tonnes: float
    diverted_tonnes: float
    avoided_co2e_tonnes: float
    completed_transactions: int

class GlobalImpactSummary(BaseModel):
    total_exchanged_tonnes: float
    total_diverted_tonnes: float
    total_avoided_co2e_tonnes: float
    total_completed_exchanges: int
    verified_transactions_count: int
    category_breakdown: list[CategoryImpactStat]
    demo_data_flag: bool = True
    methodology_summary: str
