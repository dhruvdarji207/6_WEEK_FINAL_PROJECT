from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

class BuyerRequirement(Base):
    __tablename__ = "buyer_requirements"

    id = Column(Integer, primary_key=True, index=True)
    buyer_need_code = Column(String(50), unique=True, index=True, nullable=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    buyer_name = Column(String(255), nullable=False)
    buyer_type = Column(String(100), nullable=True)
    buyer_sector = Column(String(100), nullable=False)
    required_material_category = Column(String(100), index=True, nullable=False)
    preferred_material_name = Column(String(255), nullable=True)
    minimum_quality_score = Column(Float, nullable=False)
    maximum_contamination_pct = Column(Float, nullable=False)
    minimum_quantity_tonnes = Column(Float, nullable=False)
    maximum_quantity_tonnes = Column(Float, nullable=False)
    max_budget_inr_per_kg = Column(Float, nullable=False)
    city = Column(String(100), index=True, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    required_condition = Column(String(100), nullable=False)
    status = Column(String(50), default="Active", index=True)  # Active, Fulfilled, Cancelled
    demo_data_flag = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    buyer = relationship("User", back_populates="buyer_requirements")
    exchange_requests = relationship("ExchangeRequest", back_populates="buyer_requirement")
