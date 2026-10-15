from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    organization_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="buyer")  # admin, supplier, buyer
    city = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    listings = relationship("WasteListing", back_populates="supplier", cascade="all, delete-orphan")
    buyer_requirements = relationship("BuyerRequirement", back_populates="buyer", cascade="all, delete-orphan")
    sent_exchanges = relationship("ExchangeRequest", foreign_keys="ExchangeRequest.buyer_id", back_populates="buyer")
    received_exchanges = relationship("ExchangeRequest", foreign_keys="ExchangeRequest.supplier_id", back_populates="supplier")
    audit_logs = relationship("AuditLog", back_populates="user")
