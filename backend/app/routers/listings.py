from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.api.deps import get_current_user, get_optional_current_user, require_role
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.waste_listing import WasteListing
from backend.app.models.audit_log import AuditLog
from backend.app.schemas.waste_listing import (
    WasteListingCreate, WasteListingUpdate, WasteListingOut, WasteListingListResponse
)

router = APIRouter(prefix="/listings", tags=["Waste Listings"])

@router.get("", response_model=WasteListingListResponse)
def list_listings(
    db: Session = Depends(get_db),
    category: Optional[str] = None,
    sector: Optional[str] = None,
    condition: Optional[str] = None,
    city: Optional[str] = None,
    listing_status: Optional[str] = None,
    min_quality: Optional[float] = None,
    max_contamination: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: str = Query("created_at", pattern="^(created_at|price_asc|price_desc|quality_desc|quantity_desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100)
):
    query = db.query(WasteListing)

    if category:
        query = query.filter(WasteListing.material_category.ilike(f"%{category}%"))
    if sector:
        query = query.filter(WasteListing.source_sector.ilike(f"%{sector}%"))
    if condition:
        query = query.filter(WasteListing.condition.ilike(f"%{condition}%"))
    if city:
        query = query.filter(WasteListing.city.ilike(f"%{city}%"))
    if listing_status:
        query = query.filter(WasteListing.listing_status == listing_status)
    if min_quality is not None:
        query = query.filter(WasteListing.quality_score_0_100 >= min_quality)
    if max_contamination is not None:
        query = query.filter(WasteListing.contamination_est_pct <= max_contamination)
    if max_price is not None:
        query = query.filter(WasteListing.indicative_price_inr_per_kg <= max_price)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (WasteListing.material_name.ilike(s)) |
            (WasteListing.supplier_name.ilike(s)) |
            (WasteListing.material_category.ilike(s)) |
            (WasteListing.city.ilike(s))
        )

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(WasteListing.indicative_price_inr_per_kg.asc())
    elif sort_by == "price_desc":
        query = query.order_by(WasteListing.indicative_price_inr_per_kg.desc())
    elif sort_by == "quality_desc":
        query = query.order_by(WasteListing.quality_score_0_100.desc())
    elif sort_by == "quantity_desc":
        query = query.order_by(WasteListing.quantity_tonnes.desc())
    else:
        query = query.order_by(WasteListing.created_at.desc())

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return WasteListingListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[WasteListingOut.model_validate(it) for it in items]
    )

@router.get("/{listing_id}", response_model=WasteListingOut)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(WasteListing).filter(WasteListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Waste listing not found.")
    return listing

@router.post("", response_model=WasteListingOut, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_in: WasteListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["supplier", "admin"]))
):
    code_count = db.query(WasteListing).count() + 1
    generated_code = f"L{code_count:04d}"

    # New listings default to 'Under Review' until moderated by admin
    initial_status = "Available" if current_user.role == "admin" else "Under Review"

    listing = WasteListing(
        listing_code=generated_code,
        supplier_id=current_user.id,
        supplier_name=listing_in.supplier_name or current_user.organization_name or current_user.full_name,
        supplier_type=listing_in.supplier_type or "Manufacturer",
        source_sector=listing_in.source_sector,
        material_name=listing_in.material_name,
        material_category=listing_in.material_category,
        condition=listing_in.condition,
        quantity_tonnes=listing_in.quantity_tonnes,
        quality_score_0_100=listing_in.quality_score_0_100,
        contamination_est_pct=listing_in.contamination_est_pct,
        indicative_price_inr_per_kg=listing_in.indicative_price_inr_per_kg,
        city=listing_in.city,
        latitude=listing_in.latitude or 23.0225,
        longitude=listing_in.longitude or 72.5714,
        listing_status=initial_status,
        hazardous_flag=listing_in.hazardous_flag,
        demo_data_flag=False,
        created_at=datetime.now(timezone.utc)
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="CREATE_LISTING",
        entity_type="listing",
        entity_id=listing.id,
        details=f"Created waste listing '{listing.material_name}' (Status: {listing.listing_status})."
    )
    db.add(audit)
    db.commit()

    return listing

@router.put("/{listing_id}", response_model=WasteListingOut)
def update_listing(
    listing_id: int,
    listing_in: WasteListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = db.query(WasteListing).filter(WasteListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Waste listing not found.")

    if current_user.role != "admin" and listing.supplier_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to modify this listing.")

    update_data = listing_in.model_dump(exclude_unset=True)
    # Only admins can update status directly via this endpoint
    if "listing_status" in update_data and current_user.role != "admin":
        update_data.pop("listing_status")

    for field, val in update_data.items():
        setattr(listing, field, val)

    listing.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(listing)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="UPDATE_LISTING",
        entity_type="listing",
        entity_id=listing.id,
        details=f"Updated listing details: {list(update_data.keys())}."
    )
    db.add(audit)
    db.commit()

    return listing

@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = db.query(WasteListing).filter(WasteListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Waste listing not found.")

    if current_user.role != "admin" and listing.supplier_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this listing.")

    db.delete(listing)
    
    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="DELETE_LISTING",
        entity_type="listing",
        entity_id=listing_id,
        details=f"Deleted listing ID {listing_id}."
    )
    db.add(audit)
    db.commit()
    return None
