from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from backend.app.schemas.waste_listing import WasteListingOut
from backend.app.schemas.user import UserOut

class ExchangeRequestCreate(BaseModel):
    listing_id: int
    buyer_requirement_id: Optional[int] = None
    requested_quantity_tonnes: float = Field(..., gt=0)
    offered_price_inr_per_kg: float = Field(..., ge=0)
    notes: Optional[str] = None

class ExchangeRequestStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(Submitted|Under Review|Accepted|Rejected|In Transit|Completed|Cancelled|Disputed)$")
    rejection_reason: Optional[str] = None
    dispute_details: Optional[str] = None
    agreed_quantity_tonnes: Optional[float] = None
    agreed_price_inr_per_kg: Optional[float] = None

class ExchangeTransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    transaction_code: Optional[str]
    material_name: str
    material_category: str
    source_sector: str
    buyer_sector: str
    quantity_tonnes: float
    quality_score_0_100: float
    contamination_pct: float
    price_inr_per_kg: float
    distance_km: Optional[float]
    match_completed: bool
    estimated_reuse_yield_fraction: float
    verified_by_admin: bool
    demo_data_flag: bool
    completed_at: datetime

class ExchangeRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    request_code: Optional[str]
    listing_id: int
    buyer_requirement_id: Optional[int]
    buyer_id: int
    supplier_id: int
    requested_quantity_tonnes: float
    offered_price_inr_per_kg: float
    status: str
    notes: Optional[str]
    rejection_reason: Optional[str]
    dispute_details: Optional[str]
    created_at: datetime
    updated_at: datetime
    listing: Optional[WasteListingOut] = None
    buyer: Optional[UserOut] = None
    supplier: Optional[UserOut] = None
    transaction: Optional[ExchangeTransactionOut] = None
