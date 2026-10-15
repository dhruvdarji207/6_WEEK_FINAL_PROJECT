from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

class WasteListing(Base):
    __tablename__ = "waste_listings"

    id = Column(Integer, primary_key=True, index=True)
    listing_code = Column(String(50), unique=True, index=True, nullable=True)
    supplier_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    supplier_name = Column(String(255), nullable=False)
    supplier_type = Column(String(100), nullable=True)
    source_sector = Column(String(100), nullable=False)
    material_name = Column(String(255), nullable=False)
    material_category = Column(String(100), index=True, nullable=False)
    condition = Column(String(100), nullable=False)
    quantity_tonnes = Column(Float, nullable=False)
    quality_score_0_100 = Column(Float, nullable=False)
    contamination_est_pct = Column(Float, nullable=False)
    indicative_price_inr_per_kg = Column(Float, nullable=False)
    city = Column(String(100), index=True, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    available_from = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    listing_status = Column(String(50), default="Under Review", index=True)  # Available, Under Review, Reserved, Sold, Rejected
    hazardous_flag = Column(Boolean, default=False)
    demo_data_flag = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    supplier = relationship("User", back_populates="listings")
    exchange_requests = relationship("ExchangeRequest", back_populates="listing", cascade="all, delete-orphan")
    verification_records = relationship("VerificationRecord", back_populates="listing", cascade="all, delete-orphan")
