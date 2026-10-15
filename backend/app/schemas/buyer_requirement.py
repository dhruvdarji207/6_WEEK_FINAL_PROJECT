from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class BuyerRequirementBase(BaseModel):
    required_material_category: str = Field(..., min_length=2, max_length=100)
    preferred_material_name: Optional[str] = None
    buyer_sector: str = Field(..., min_length=2, max_length=100)
    minimum_quality_score: float = Field(..., ge=0, le=100)
    maximum_contamination_pct: float = Field(..., ge=0, le=100)
    minimum_quantity_tonnes: float = Field(..., ge=0)
    maximum_quantity_tonnes: float = Field(..., gt=0)
    max_budget_inr_per_kg: float = Field(..., ge=0)
    city: str = Field(..., min_length=2, max_length=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    required_condition: str = Field(..., min_length=2, max_length=100)

class BuyerRequirementCreate(BuyerRequirementBase):
    buyer_name: Optional[str] = None
    buyer_type: Optional[str] = "Recycler"

class BuyerRequirementUpdate(BaseModel):
    required_material_category: Optional[str] = None
    preferred_material_name: Optional[str] = None
    buyer_sector: Optional[str] = None
    minimum_quality_score: Optional[float] = Field(None, ge=0, le=100)
    maximum_contamination_pct: Optional[float] = Field(None, ge=0, le=100)
    minimum_quantity_tonnes: Optional[float] = Field(None, ge=0)
    maximum_quantity_tonnes: Optional[float] = Field(None, gt=0)
    max_budget_inr_per_kg: Optional[float] = Field(None, ge=0)
    city: Optional[str] = None
    required_condition: Optional[str] = None
    status: Optional[str] = None

class BuyerRequirementOut(BuyerRequirementBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    buyer_need_code: Optional[str] = None
    buyer_id: Optional[int] = None
    buyer_name: str
    buyer_type: Optional[str] = None
    status: str
    demo_data_flag: bool
    created_at: datetime
    updated_at: datetime

class BuyerRequirementListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[BuyerRequirementOut]
