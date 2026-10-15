import os
from pathlib import Path
import pandas as pd

DATASETS_DIR = Path(__file__).resolve().parent.parent / "datasets"

# Fallback in-memory reference matrix in case CSV is unreadable
DEFAULT_COMPATIBILITY = {
    "cotton": {"use": "Textile recycling; recovered fibre products", "feasibility": "Medium", "verification": "Check dye, finishes and fibre blend"},
    "polyester": {"use": "Textile recycling; recovered fibre products", "feasibility": "Medium", "verification": "Check polymer composition and finishes"},
    "PET": {"use": "Recycled plastic products", "feasibility": "High", "verification": "Confirm resin grade and contamination"},
    "HDPE": {"use": "Recycled plastic products", "feasibility": "High", "verification": "Confirm resin grade and contamination"},
    "paper_fiber": {"use": "Recycled paper/cardboard products", "feasibility": "High", "verification": "Avoid wet or chemically contaminated material"},
    "wood_fiber": {"use": "Panel products or biomass uses where permitted", "feasibility": "Medium", "verification": "Check coatings, preservatives and moisture"},
    "biomass": {"use": "Qualified biomass processing pathways", "feasibility": "Medium", "verification": "Check moisture, contaminants and local rules"},
    "organic_biomass": {"use": "Composting or approved bio-processing pathways", "feasibility": "Medium", "verification": "Check segregation, spoilage and permitted use"},
    "mineral_aggregate": {"use": "Approved construction aggregate/recycled construction uses", "feasibility": "Medium", "verification": "Test composition and meet construction specifications"},
    "ferrous_metal": {"use": "Metal recycling and remelting", "feasibility": "High", "verification": "Check alloy and contamination"},
    "aluminium": {"use": "Metal recycling and remelting", "feasibility": "High", "verification": "Check alloy and contamination"},
    "glass": {"use": "Glass recycling and cullet applications", "feasibility": "High", "verification": "Check colour, ceramics and contamination"},
}

def load_compatibility_matrix() -> dict[str, dict]:
    """Load reference compatibility matrix from CSV or fallback."""
    csv_path = DATASETS_DIR / "material_compatibility_reference.csv"
    if csv_path.exists():
        try:
            df = pd.read_csv(csv_path)
            res = {}
            for _, row in df.iterrows():
                cat = str(row.get("material_category", "")).strip()
                if cat:
                    res[cat] = {
                        "use": str(row.get("illustrative_potential_use", "")),
                        "feasibility": str(row.get("general_feasibility_note", "Medium")),
                        "verification": str(row.get("verification_requirements", "")),
                        "demo_reference_only": True
                    }
            return res
        except Exception:
            return DEFAULT_COMPATIBILITY
    return DEFAULT_COMPATIBILITY

COMPATIBILITY_MATRIX = load_compatibility_matrix()

def check_category_compatibility(supplier_category: str, buyer_category: str) -> tuple[bool, float, str]:
    """
    Check if supplier material category matches buyer's required material category.
    Returns (is_compatible, compatibility_score_0_100, reason)
    """
    s_cat = supplier_category.strip().lower()
    b_cat = buyer_category.strip().lower()

    if s_cat == b_cat:
        ref = COMPATIBILITY_MATRIX.get(s_cat, {})
        note = ref.get("verification", "Requires standard material testing.")
        return True, 100.0, f"Direct material match ({s_cat}). Feasibility: {ref.get('feasibility', 'Medium')}. Note: {note}"
    
    # Check related categories (e.g., biomass vs organic_biomass, PET vs HDPE)
    related_groups = [
        {"biomass", "organic_biomass"},
        {"cotton", "polyester"},
        {"pet", "hdpe"},
        {"ferrous_metal", "aluminium"}
    ]
    for group in related_groups:
        if s_cat in group and b_cat in group:
            return True, 60.0, f"Cross-compatible secondary stream ({s_cat} with {b_cat}). Requires blend verification."
            
    return False, 0.0, f"Incompatible material streams: Supplier has '{supplier_category}', Buyer requires '{buyer_category}'."
