from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.api.deps import get_current_user, require_role
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.buyer_requirement import BuyerRequirement
from backend.app.models.audit_log import AuditLog
from backend.app.schemas.buyer_requirement import (
    BuyerRequirementCreate, BuyerRequirementUpdate, BuyerRequirementOut, BuyerRequirementListResponse
)

router = APIRouter(prefix="/requirements", tags=["Buyer Requirements"])

@router.get("", response_model=BuyerRequirementListResponse)
def list_requirements(
    db: Session = Depends(get_db),
    category: Optional[str] = None,
    sector: Optional[str] = None,
    city: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100)
):
    query = db.query(BuyerRequirement)

    if category:
        query = query.filter(BuyerRequirement.required_material_category.ilike(f"%{category}%"))
    if sector:
        query = query.filter(BuyerRequirement.buyer_sector.ilike(f"%{sector}%"))
    if city:
        query = query.filter(BuyerRequirement.city.ilike(f"%{city}%"))
    if status_filter:
        query = query.filter(BuyerRequirement.status == status_filter)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (BuyerRequirement.preferred_material_name.ilike(s)) |
            (BuyerRequirement.buyer_name.ilike(s)) |
            (BuyerRequirement.required_material_category.ilike(s)) |
            (BuyerRequirement.city.ilike(s))
        )

    query = query.order_by(BuyerRequirement.created_at.desc())
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return BuyerRequirementListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[BuyerRequirementOut.model_validate(it) for it in items]
    )

@router.get("/{req_id}", response_model=BuyerRequirementOut)
def get_requirement(req_id: int, db: Session = Depends(get_db)):
    req = db.query(BuyerRequirement).filter(BuyerRequirement.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Buyer requirement not found.")
    return req

@router.post("", response_model=BuyerRequirementOut, status_code=status.HTTP_201_CREATED)
def create_requirement(
    req_in: BuyerRequirementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["buyer", "admin"]))
):
    count = db.query(BuyerRequirement).count() + 1
    code = f"B{count:04d}"

    req = BuyerRequirement(
        buyer_need_code=code,
        buyer_id=current_user.id,
        buyer_name=req_in.buyer_name or current_user.organization_name or current_user.full_name,
        buyer_type=req_in.buyer_type or "Recycler",
        buyer_sector=req_in.buyer_sector,
        required_material_category=req_in.required_material_category,
        preferred_material_name=req_in.preferred_material_name or req_in.required_material_category,
        minimum_quality_score=req_in.minimum_quality_score,
        maximum_contamination_pct=req_in.maximum_contamination_pct,
        minimum_quantity_tonnes=req_in.minimum_quantity_tonnes,
        maximum_quantity_tonnes=req_in.maximum_quantity_tonnes,
        max_budget_inr_per_kg=req_in.max_budget_inr_per_kg,
        city=req_in.city,
        latitude=req_in.latitude or 22.3072,
        longitude=req_in.longitude or 73.1812,
        required_condition=req_in.required_condition,
        status="Active",
        demo_data_flag=False,
        created_at=datetime.now(timezone.utc)
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="CREATE_REQUIREMENT",
        entity_type="requirement",
        entity_id=req.id,
        details=f"Created buyer requirement for '{req.required_material_category}' ({req.minimum_quantity_tonnes}-{req.maximum_quantity_tonnes} t)."
    )
    db.add(audit)
    db.commit()

    return req

@router.put("/{req_id}", response_model=BuyerRequirementOut)
def update_requirement(
    req_id: int,
    req_in: BuyerRequirementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(BuyerRequirement).filter(BuyerRequirement.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Buyer requirement not found.")

    if current_user.role != "admin" and req.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to modify this requirement.")

    update_data = req_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(req, field, val)

    req.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(req)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="UPDATE_REQUIREMENT",
        entity_type="requirement",
        entity_id=req.id,
        details=f"Updated requirement ID {req_id}."
    )
    db.add(audit)
    db.commit()

    return req

@router.delete("/{req_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_requirement(
    req_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(BuyerRequirement).filter(BuyerRequirement.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Buyer requirement not found.")

    if current_user.role != "admin" and req.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this requirement.")

    db.delete(req)
    
    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="DELETE_REQUIREMENT",
        entity_type="requirement",
        entity_id=req_id,
        details=f"Deleted requirement ID {req_id}."
    )
    db.add(audit)
    db.commit()
    return None
