"""
Database Seeding Script for Waste2Worth AI
Populates initial database with starter demo datasets, preserving synthetic provenance flags.
Idempotent and safe to run multiple times.
"""

from datetime import datetime, timezone
from pathlib import Path
import pandas as pd
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.core.security import get_password_hash
from backend.app.db.session import engine, SessionLocal, Base
from backend.app.models.user import User
from backend.app.models.waste_listing import WasteListing
from backend.app.models.buyer_requirement import BuyerRequirement
from backend.app.models.exchange import ExchangeRequest, ExchangeTransaction
from backend.app.models.audit_log import AuditLog

def init_db(db: Session) -> dict[str, int]:
    # Ensure all tables exist
    Base.metadata.create_all(bind=engine)

    stats = {
        "users": 0,
        "listings": 0,
        "buyer_requirements": 0,
        "transactions": 0
    }

    # 1. Create Default Role Users if not present
    default_users = [
        {
            "email": "admin@waste2worth.org",
            "password": "AdminPassword123!",
            "full_name": "Dr. Ananya Sharma",
            "organization_name": "Waste2Worth Regulatory & AI Audit Council",
            "role": "admin",
            "city": "Ahmedabad",
            "is_verified": True
        },
        {
            "email": "supplier@waste2worth.org",
            "password": "SupplierPassword123!",
            "full_name": "Rajesh Patel",
            "organization_name": "Gujarat Secondary Raw Materials Ltd",
            "role": "supplier",
            "city": "Surat",
            "is_verified": True
        },
        {
            "email": "buyer@waste2worth.org",
            "password": "BuyerPassword123!",
            "full_name": "Kavita Rao",
            "organization_name": "CleanTech Circular Polymers Pvt Ltd",
            "role": "buyer",
            "city": "Vadodara",
            "is_verified": True
        }
    ]

    user_map = {}
    for u in default_users:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            new_user = User(
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                full_name=u["full_name"],
                organization_name=u["organization_name"],
                role=u["role"],
                city=u["city"],
                is_active=True,
                is_verified=u["is_verified"],
                created_at=datetime.now(timezone.utc)
            )
            db.add(new_user)
            db.flush()
            user_map[u["role"]] = new_user.id
            stats["users"] += 1
        else:
            user_map[u["role"]] = existing.id

    supplier_user_id = user_map.get("supplier")
    buyer_user_id = user_map.get("buyer")

    # 2. Seed Waste Listings from CSV
    listings_csv = settings.DATASETS_DIR / "demo_waste_listings.csv"
    if listings_csv.exists() and db.query(WasteListing).count() == 0:
        df_list = pd.read_csv(listings_csv)
        for _, row in df_list.iterrows():
            code = str(row.get("listing_id", "")).strip()
            status = str(row.get("listing_status", "Available")).strip()
            
            listing = WasteListing(
                listing_code=code,
                supplier_id=supplier_user_id,
                supplier_name=str(row.get("supplier_name", "Demo Supplier")),
                supplier_type=str(row.get("supplier_type", "Manufacturer")),
                source_sector=str(row.get("source_sector", "Manufacturing")),
                material_name=str(row.get("material_name", "")),
                material_category=str(row.get("material_category", "")),
                condition=str(row.get("condition", "sorted_clean")),
                quantity_tonnes=float(row.get("quantity_tonnes", 10.0)),
                quality_score_0_100=float(row.get("quality_score_0_100", 75.0)),
                contamination_est_pct=float(row.get("contamination_est_pct", 10.0)),
                indicative_price_inr_per_kg=float(row.get("indicative_price_inr_per_kg", 0.5)),
                city=str(row.get("city", "Ahmedabad")),
                latitude=float(row.get("latitude", 23.0225)) if pd.notna(row.get("latitude")) else 23.0225,
                longitude=float(row.get("longitude", 72.5714)) if pd.notna(row.get("longitude")) else 72.5714,
                listing_status=status,
                hazardous_flag=bool(row.get("hazardous_flag", False)),
                demo_data_flag=True,
                created_at=datetime.now(timezone.utc)
            )
            db.add(listing)
            stats["listings"] += 1

    # 3. Seed Buyer Requirements from CSV
    buyer_csv = settings.DATASETS_DIR / "demo_buyer_requirements.csv"
    if buyer_csv.exists() and db.query(BuyerRequirement).count() == 0:
        df_buyer = pd.read_csv(buyer_csv)
        for _, row in df_buyer.iterrows():
            code = str(row.get("buyer_need_id", "")).strip()
            req = BuyerRequirement(
                buyer_need_code=code,
                buyer_id=buyer_user_id,
                buyer_name=str(row.get("buyer_name", "Demo Buyer")),
                buyer_type=str(row.get("buyer_type", "Recycler")),
                buyer_sector=str(row.get("buyer_sector", "Manufacturing")),
                required_material_category=str(row.get("required_material_category", "")),
                preferred_material_name=str(row.get("preferred_material_name", "")),
                minimum_quality_score=float(row.get("minimum_quality_score", 70.0)),
                maximum_contamination_pct=float(row.get("maximum_contamination_pct", 10.0)),
                minimum_quantity_tonnes=float(row.get("minimum_quantity_tonnes", 1.0)),
                maximum_quantity_tonnes=float(row.get("maximum_quantity_tonnes", 50.0)),
                max_budget_inr_per_kg=float(row.get("max_budget_inr_per_kg", 1.0)),
                city=str(row.get("city", "Vadodara")),
                latitude=float(row.get("latitude", 22.3072)) if pd.notna(row.get("latitude")) else 22.3072,
                longitude=float(row.get("longitude", 73.1812)) if pd.notna(row.get("longitude")) else 73.1812,
                required_condition=str(row.get("required_condition", "sorted_clean")),
                status="Active",
                demo_data_flag=True,
                created_at=datetime.now(timezone.utc)
            )
            db.add(req)
            stats["buyer_requirements"] += 1

    # 4. Seed Synthetic Transactions from CSV
    trans_csv = settings.DATASETS_DIR / "synthetic_demo_transactions.csv"
    if trans_csv.exists() and db.query(ExchangeTransaction).count() == 0:
        df_trans = pd.read_csv(trans_csv)
        for _, row in df_trans.iterrows():
            code = str(row.get("transaction_id", "")).strip()
            is_completed = bool(row.get("match_completed", True))
            
            tx = ExchangeTransaction(
                transaction_code=code,
                material_name=str(row.get("material_name", "")),
                material_category=str(row.get("material_category", "")),
                source_sector=str(row.get("source_sector", "Manufacturing")),
                buyer_sector=str(row.get("buyer_sector", "Recycler")),
                quantity_tonnes=float(row.get("quantity_tonnes", 10.0)),
                quality_score_0_100=float(row.get("quality_score_0_100", 75.0)),
                contamination_pct=float(row.get("contamination_pct", 10.0)),
                price_inr_per_kg=float(row.get("price_inr_per_kg", 0.5)),
                distance_km=float(row.get("distance_km", 100.0)) if pd.notna(row.get("distance_km")) else 100.0,
                days_to_match=int(row.get("days_to_match", 7)) if pd.notna(row.get("days_to_match")) else 7,
                match_completed=is_completed,
                estimated_reuse_yield_fraction=float(row.get("estimated_reuse_yield_fraction", 0.75)),
                verified_by_admin=is_completed,
                demo_data_flag=True,
                completed_at=datetime.now(timezone.utc)
            )
            db.add(tx)
            stats["transactions"] += 1

    # Record initial audit entry
    admin_id = user_map.get("admin")
    audit = AuditLog(
        user_id=admin_id,
        user_email="admin@waste2worth.org",
        action="DATABASE_SEED",
        entity_type="system",
        entity_id=0,
        details=f"Database seeded with {stats['listings']} listings, {stats['buyer_requirements']} requirements, and {stats['transactions']} synthetic transactions.",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(audit)

    db.commit()
    return stats

if __name__ == "__main__":
    db = SessionLocal()
    try:
        results = init_db(db)
        print("Database Initialization & Seeding Complete:", results)
    finally:
        db.close()
