from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("waste_listings.id"), nullable=False)
    verified_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    verification_status = Column(String(50), nullable=False)  # Verified, Rejected, Needs Revision
    inspection_notes = Column(Text, nullable=True)
    verified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    listing = relationship("WasteListing", back_populates="verification_records")
