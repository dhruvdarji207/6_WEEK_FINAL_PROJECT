from typing import Optional, Any
from pydantic import BaseModel, Field

class PricePredictionRequest(BaseModel):
    material_category: str
    source_sector: str = "Manufacturing"
    quality_score_0_100: float = Field(..., ge=0, le=100)
    contamination_pct: float = Field(..., ge=0, le=100)
    quantity_tonnes: float = Field(..., gt=0)
    distance_km: Optional[float] = 100.0

class PricePredictionResponse(BaseModel):
    predicted_price_inr_per_kg: float
    price_range_low: float
    price_range_high: float
    model_used: str
    model_mae: float
    model_r2: float
    disclaimer: str = (
        "Indicative price prediction based on synthetic training data. "
        "Not an official market quote or binding commercial offer."
    )

class HistoricalObservation(BaseModel):
    date: str
    quantity_tonnes: float

class QuantityForecastRequest(BaseModel):
    material_category: str
    source_sector: Optional[str] = "Manufacturing"
    historical_observations: list[HistoricalObservation] = []

class QuantityForecastResponse(BaseModel):
    status: str  # 'sufficient' or 'insufficient_data'
    message: str
    provided_points_count: int
    minimum_required_points: int = 6
    forecasted_quantity_tonnes: Optional[float] = None
    trend_direction: Optional[str] = None  # Increasing, Stable, Decreasing
    confidence_interval: Optional[dict[str, float]] = None
    data_limitation_note: str

class DemandCategoryStat(BaseModel):
    material_category: str
    active_requirements_count: int
    total_requested_tonnes: float
    average_budget_inr_per_kg: float

class DemandTrendsResponse(BaseModel):
    total_requirements: int
    category_breakdown: list[DemandCategoryStat]
    top_demanded_categories: list[str]
    demo_data_notice: str = (
        "Calculated from synthetic starter dataset. "
        "Do not interpret as actual industrial macroeconomic demand."
    )
