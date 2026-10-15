from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from backend.app.api.deps import require_role
from backend.app.db.session import get_db
from backend.app.db.seed_db import init_db
from backend.app.models.user import User
from backend.app.models.waste_listing import WasteListing
from backend.app.models.buyer_requirement import BuyerRequirement
from backend.app.models.exchange import ExchangeRequest, ExchangeTransaction
from backend.app.models.verification import VerificationRecord
from backend.app.models.audit_log import AuditLog
from backend.app.schemas.waste_listing import WasteListingOut
from backend.app.schemas.user import UserOut

router = APIRouter(prefix="/admin", tags=["Administrator Operations"])

class ModerationAction(BaseModel):
    action: str  # 'approve', 'reject', 'request_revision'
    notes: Optional[str] = None

class AdminStats(BaseModel):
    total_users: int
    total_listings: int
    pending_moderation_listings: int
    total_requirements: int
    total_exchange_requests: int
    completed_transactions: int
    active_disputes: int
    audit_logs_count: int

class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    user_email: Optional[str]
    action: str
    entity_type: str
    entity_id: Optional[int]
    details: Optional[str]
    timestamp: datetime

@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    total_users = db.query(User).count()
    total_listings = db.query(WasteListing).count()
    pending_mod = db.query(WasteListing).filter(WasteListing.listing_status == "Under Review").count()
    total_reqs = db.query(BuyerRequirement).count()
    total_exchanges = db.query(ExchangeRequest).count()
    completed_tx = db.query(ExchangeTransaction).count()
    active_disputes = db.query(ExchangeRequest).filter(ExchangeRequest.status == "Disputed").count()
    audit_count = db.query(AuditLog).count()

    return AdminStats(
        total_users=total_users,
        total_listings=total_listings,
        pending_moderation_listings=pending_mod,
        total_requirements=total_reqs,
        total_exchange_requests=total_exchanges,
        completed_transactions=completed_tx,
        active_disputes=active_disputes,
        audit_logs_count=audit_count
    )

@router.get("/moderation/listings", response_model=list[WasteListingOut])
def get_pending_listings(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    return db.query(WasteListing).filter(WasteListing.listing_status == "Under Review").all()

@router.post("/moderation/listings/{listing_id}")
def moderate_listing(
    listing_id: int,
    action_in: ModerationAction,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    listing = db.query(WasteListing).filter(WasteListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Waste listing not found.")

    if action_in.action == "approve":
        listing.listing_status = "Available"
        verif_status = "Verified"
    elif action_in.action == "reject":
        listing.listing_status = "Rejected"
        verif_status = "Rejected"
    else:
        listing.listing_status = "Under Review"
        verif_status = "Needs Revision"

    listing.updated_at = datetime.now(timezone.utc)

    # Create verification record
    v_record = VerificationRecord(
        listing_id=listing.id,
        verified_by_user_id=admin.id,
        verification_status=verif_status,
        inspection_notes=action_in.notes or f"Moderated by Admin {admin.full_name}",
        verified_at=datetime.now(timezone.utc)
    )
    db.add(v_record)

    # Create audit entry
    audit = AuditLog(
        user_id=admin.id,
        user_email=admin.email,
        action="MODERATE_LISTING",
        entity_type="listing",
        entity_id=listing.id,
        details=f"Listing {action_in.action.upper()} by Admin: {action_in.notes or 'No notes provided.'}"
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "listing_id": listing.id,
        "new_status": listing.listing_status,
        "verification": verif_status
    }

@router.get("/audit-logs", response_model=list[AuditLogOut])
def get_audit_logs(
    db: Session = Depends(get_db),
    action: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(require_role(["admin"]))
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    return query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

@router.get("/users", response_model=list[UserOut])
def get_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.post("/reseed-demo-data")
def reseed_demo_data(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    # Reset existing records and reseed
    stats = init_db(db)
    return {"status": "success", "message": "Demo datasets re-synchronized successfully.", "stats": stats}
