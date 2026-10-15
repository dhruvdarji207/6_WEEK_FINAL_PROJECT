from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

class ExchangeRequest(Base):
    __tablename__ = "exchange_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_code = Column(String(50), unique=True, index=True, nullable=True)
    listing_id = Column(Integer, ForeignKey("waste_listings.id"), nullable=False)
    buyer_requirement_id = Column(Integer, ForeignKey("buyer_requirements.id"), nullable=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    requested_quantity_tonnes = Column(Float, nullable=False)
    offered_price_inr_per_kg = Column(Float, nullable=False)
    status = Column(String(50), default="Submitted", index=True) 
    # Submitted, Under Review, Accepted, Rejected, In Transit, Completed, Cancelled, Disputed
    
    notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    dispute_details = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    listing = relationship("WasteListing", back_populates="exchange_requests")
    buyer_requirement = relationship("BuyerRequirement", back_populates="exchange_requests")
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="sent_exchanges")
    supplier = relationship("User", foreign_keys=[supplier_id], back_populates="received_exchanges")
    transaction = relationship("ExchangeTransaction", uselist=False, back_populates="exchange_request")

class ExchangeTransaction(Base):
    __tablename__ = "exchange_transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_code = Column(String(50), unique=True, index=True, nullable=True)
    exchange_request_id = Column(Integer, ForeignKey("exchange_requests.id"), nullable=True)
    
    material_name = Column(String(255), nullable=False)
    material_category = Column(String(100), index=True, nullable=False)
    source_sector = Column(String(100), nullable=False)
    buyer_sector = Column(String(100), nullable=False)
    
    quantity_tonnes = Column(Float, nullable=False)
    quality_score_0_100 = Column(Float, nullable=False)
    contamination_pct = Column(Float, nullable=False)
    price_inr_per_kg = Column(Float, nullable=False)
    distance_km = Column(Float, nullable=True)
    days_to_match = Column(Integer, default=1)
    
    match_completed = Column(Boolean, default=True)
    estimated_reuse_yield_fraction = Column(Float, default=0.75)
    verified_by_admin = Column(Boolean, default=False)
    demo_data_flag = Column(Boolean, default=False, index=True)
    
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    exchange_request = relationship("ExchangeRequest", back_populates="transaction")
