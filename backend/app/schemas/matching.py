from typing import Optional, Any
from pydantic import BaseModel, Field
from backend.app.schemas.waste_listing import WasteListingOut

class MatchRequest(BaseModel):
    buyer_requirement_id: Optional[int] = None
    # Optional override parameters if matching on the fly
    required_material_category: Optional[str] = None
    buyer_sector: Optional[str] = None
    minimum_quality_score: Optional[float] = Field(None, ge=0, le=100)
    maximum_contamination_pct: Optional[float] = Field(None, ge=0, le=100)
    quantity_tonnes: Optional[float] = Field(None, gt=0)
    max_budget_inr_per_kg: Optional[float] = Field(None, ge=0)
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    mode: str = Field(default="rule_based", pattern="^(rule_based|ml_ranking)$")

class SubScoreBreakdown(BaseModel):
    category_compatibility: float
    quality_score: float
    contamination_score: float
    quantity_fit_score: float
    budget_fit_score: float
    distance_score: float
    distance_km: Optional[float] = None

class MatchResultItem(BaseModel):
    listing: WasteListingOut
    overall_score: float
    recommendation_level: str  # High Match, Moderate Match, Low Match, Incompatible
    is_compatible: bool
    sub_scores: SubScoreBreakdown
    explanation: list[str]
    failed_constraints: list[str]
    scoring_mode: str

class MatchResponse(BaseModel):
    buyer_requirement_summary: dict[str, Any]
    total_evaluated: int
    matches: list[MatchResultItem]
    disclaimer: str = (
        "Preliminary suggestion only. Does not constitute guarantee of material suitability, "
        "operational safety, or regulatory/environmental compliance."
    )
