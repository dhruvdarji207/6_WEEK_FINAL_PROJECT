from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class WasteListingBase(BaseModel):
    material_name: str = Field(..., min_length=2, max_length=200)
    material_category: str = Field(..., min_length=2, max_length=100)
    source_sector: str = Field(..., min_length=2, max_length=100)
    condition: str = Field(..., min_length=2, max_length=100)
    quantity_tonnes: float = Field(..., gt=0)
    quality_score_0_100: float = Field(..., ge=0, le=100)
    contamination_est_pct: float = Field(..., ge=0, le=100)
    indicative_price_inr_per_kg: float = Field(..., ge=0)
    city: str = Field(..., min_length=2, max_length=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    hazardous_flag: bool = False

class WasteListingCreate(WasteListingBase):
    supplier_name: Optional[str] = None
    supplier_type: Optional[str] = "Manufacturer"

class WasteListingUpdate(BaseModel):
    material_name: Optional[str] = None
    material_category: Optional[str] = None
    source_sector: Optional[str] = None
    condition: Optional[str] = None
    quantity_tonnes: Optional[float] = Field(None, gt=0)
    quality_score_0_100: Optional[float] = Field(None, ge=0, le=100)
    contamination_est_pct: Optional[float] = Field(None, ge=0, le=100)
    indicative_price_inr_per_kg: Optional[float] = Field(None, ge=0)
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    listing_status: Optional[str] = None

class WasteListingOut(WasteListingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_code: Optional[str] = None
    supplier_id: Optional[int] = None
    supplier_name: str
    supplier_type: Optional[str] = None
    listing_status: str
    demo_data_flag: bool
    created_at: datetime
    updated_at: datetime

class WasteListingListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[WasteListingOut]
