from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.api.deps import get_current_user, require_role
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.waste_listing import WasteListing
from backend.app.models.exchange import ExchangeRequest, ExchangeTransaction
from backend.app.models.audit_log import AuditLog
from backend.app.schemas.exchange import (
    ExchangeRequestCreate, ExchangeRequestStatusUpdate, ExchangeRequestOut
)

router = APIRouter(prefix="/exchanges", tags=["Exchange Workflow"])

@router.get("", response_model=list[ExchangeRequestOut])
def list_exchanges(
    db: Session = Depends(get_db),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ExchangeRequest)

    # Role-based scoping
    if current_user.role == "supplier":
        query = query.filter(ExchangeRequest.supplier_id == current_user.id)
    elif current_user.role == "buyer":
        query = query.filter(ExchangeRequest.buyer_id == current_user.id)
    # Admin sees all exchanges

    if status_filter:
        query = query.filter(ExchangeRequest.status == status_filter)

    query = query.order_by(ExchangeRequest.updated_at.desc())
    return query.all()

@router.get("/{request_id}", response_model=ExchangeRequestOut)
def get_exchange(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(ExchangeRequest).filter(ExchangeRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Exchange request not found.")

    if current_user.role != "admin" and req.buyer_id != current_user.id and req.supplier_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this exchange request.")

    return req

@router.post("", response_model=ExchangeRequestOut, status_code=status.HTTP_201_CREATED)
def create_exchange_request(
    req_in: ExchangeRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["buyer", "admin"]))
):
    listing = db.query(WasteListing).filter(WasteListing.id == req_in.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Waste listing not found.")
    
    if listing.listing_status not in ["Available", "Under Review"]:
        raise HTTPException(status_code=400, detail=f"Cannot request exchange on listing with status '{listing.listing_status}'.")

    if listing.supplier_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot initiate exchange on your own listing.")

    count = db.query(ExchangeRequest).count() + 1
    code = f"REQ-{count:04d}"

    supplier_user_id = listing.supplier_id
    if not supplier_user_id:
        # Fallback to demo supplier
        fallback_supp = db.query(User).filter(User.role == "supplier").first()
        supplier_user_id = fallback_supp.id if fallback_supp else current_user.id

    exchange = ExchangeRequest(
        request_code=code,
        listing_id=listing.id,
        buyer_requirement_id=req_in.buyer_requirement_id,
        buyer_id=current_user.id,
        supplier_id=supplier_user_id,
        requested_quantity_tonnes=req_in.requested_quantity_tonnes,
        offered_price_inr_per_kg=req_in.offered_price_inr_per_kg,
        notes=req_in.notes,
        status="Submitted",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(exchange)
    db.commit()
    db.refresh(exchange)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="EXCHANGE_SUBMITTED",
        entity_type="exchange",
        entity_id=exchange.id,
        details=f"Submitted request for {exchange.requested_quantity_tonnes} tonnes of '{listing.material_name}' at ₹{exchange.offered_price_inr_per_kg}/kg."
    )
    db.add(audit)
    db.commit()

    return exchange

@router.put("/{request_id}/status", response_model=ExchangeRequestOut)
def update_exchange_status(
    request_id: int,
    status_in: ExchangeRequestStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(ExchangeRequest).filter(ExchangeRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Exchange request not found.")

    is_supplier = (req.supplier_id == current_user.id)
    is_buyer = (req.buyer_id == current_user.id)
    is_admin = (current_user.role == "admin")

    if not (is_supplier or is_buyer or is_admin):
        raise HTTPException(status_code=403, detail="Not authorized to update this exchange.")

    old_status = req.status
    new_status = status_in.status

    # Validate legal transitions
    valid_transitions = {
        "Submitted": ["Under Review", "Accepted", "Rejected", "Cancelled"],
        "Under Review": ["Accepted", "Rejected", "Cancelled"],
        "Accepted": ["In Transit", "Cancelled", "Disputed"],
        "In Transit": ["Completed", "Disputed", "Cancelled"],
        "Disputed": ["Accepted", "Completed", "Cancelled"],
        "Completed": [],
        "Rejected": [],
        "Cancelled": []
    }

    if not is_admin and new_status not in valid_transitions.get(old_status, []):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status transition from '{old_status}' to '{new_status}'."
        )

    # Role specific permission rules
    if new_status in ["Accepted", "Rejected"] and not (is_supplier or is_admin):
        raise HTTPException(status_code=403, detail="Only the waste supplier or admin can accept or reject this request.")

    req.status = new_status
    if status_in.rejection_reason:
        req.rejection_reason = status_in.rejection_reason
    if status_in.dispute_details:
        req.dispute_details = status_in.dispute_details
    req.updated_at = datetime.now(timezone.utc)

    # When exchange is completed, create or finalize ExchangeTransaction
    if new_status == "Completed":
        listing = db.query(WasteListing).filter(WasteListing.id == req.listing_id).first()
        agreed_qty = status_in.agreed_quantity_tonnes or req.requested_quantity_tonnes
        agreed_price = status_in.agreed_price_inr_per_kg or req.offered_price_inr_per_kg

        trans_count = db.query(ExchangeTransaction).count() + 1
        transaction = ExchangeTransaction(
            transaction_code=f"T{trans_count:04d}",
            exchange_request_id=req.id,
            material_name=listing.material_name if listing else "Secondary Material",
            material_category=listing.material_category if listing else "general",
            source_sector=listing.source_sector if listing else "Manufacturing",
            buyer_sector="Recycler",
            quantity_tonnes=agreed_qty,
            quality_score_0_100=listing.quality_score_0_100 if listing else 80.0,
            contamination_pct=listing.contamination_est_pct if listing else 5.0,
            price_inr_per_kg=agreed_price,
            distance_km=100.0,
            days_to_match=3,
            match_completed=True,
            estimated_reuse_yield_fraction=0.82,
            verified_by_admin=True,
            demo_data_flag=False,
            completed_at=datetime.now(timezone.utc)
        )
        db.add(transaction)

        # Mark listing as Sold if all quantity exhausted
        if listing:
            if listing.quantity_tonnes <= agreed_qty:
                listing.listing_status = "Sold"
            else:
                listing.quantity_tonnes = round(listing.quantity_tonnes - agreed_qty, 2)

    db.commit()
    db.refresh(req)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="EXCHANGE_STATUS_UPDATE",
        entity_type="exchange",
        entity_id=req.id,
        details=f"Status changed from '{old_status}' to '{new_status}'."
    )
    db.add(audit)
    db.commit()

    return req
