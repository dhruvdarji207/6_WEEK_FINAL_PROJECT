"""
Explainable Matching Engine for Waste2Worth AI
Implements transparent multi-criteria rule-based matching and ML-based ranking.
"""

import math
from typing import Any, Optional
from ml.compatibility import check_category_compatibility

def calculate_haversine_distance(lat1: Optional[float], lon1: Optional[float], lat2: Optional[float], lon2: Optional[float]) -> float:
    """Calculate distance in kilometers between two lat/lon points using Haversine formula."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 120.0  # Default regional distance fallback
    
    R = 6371.0  # Earth radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 1)

class ExplainableMatchingEngine:
    """
    Evaluates Waste Listings against Buyer Requirements with transparent,
    explainable factor scores and strict constraint guardrails.
    """

    WEIGHTS = {
        "category": 25.0,
        "quality": 20.0,
        "contamination": 15.0,
        "quantity": 15.0,
        "price": 15.0,
        "distance": 10.0,
    }

    @classmethod
    def evaluate_pair(
        cls,
        listing: dict[str, Any],
        requirement: dict[str, Any],
        mode: str = "rule_based"
    ) -> dict[str, Any]:
        """
        Evaluate a single listing against a buyer requirement.
        Returns score (0-100), sub-scores, explanations, and constraint status.
        """
        failed_constraints: list[str] = []
        explanations: list[str] = []

        # 1. Safety & Status Constraints
        if listing.get("hazardous_flag", False):
            failed_constraints.append("Safety Guardrail: Material is flagged as hazardous and requires specialized licensed transport.")
        
        status = listing.get("listing_status", "Available")
        if status != "Available":
            failed_constraints.append(f"Availability constraint: Listing status is currently '{status}'.")

        # 2. Material Category Compatibility (25 pts max)
        listing_cat = str(listing.get("material_category", "")).strip()
        req_cat = str(requirement.get("required_material_category", "")).strip()
        
        is_cat_compat, cat_factor, cat_reason = check_category_compatibility(listing_cat, req_cat)
        if not is_cat_compat:
            failed_constraints.append(f"Category mismatch: {cat_reason}")
            cat_score = 0.0
        else:
            cat_score = (cat_factor / 100.0) * cls.WEIGHTS["category"]
            explanations.append(cat_reason)

        # 3. Quality Score Fit (20 pts max)
        min_quality = float(requirement.get("minimum_quality_score", 60.0))
        list_quality = float(listing.get("quality_score_0_100", 70.0))
        
        if list_quality < min_quality:
            penalty_gap = min_quality - list_quality
            if penalty_gap > 15:
                failed_constraints.append(f"Quality below threshold: Material quality is {list_quality:.0f}/100, but buyer requires at least {min_quality:.0f}/100.")
                quality_score = 0.0
            else:
                quality_score = max(0.0, (cls.WEIGHTS["quality"] * (list_quality / min_quality) * 0.7))
                explanations.append(f"Sub-optimal quality: {list_quality:.0f}/100 (below target {min_quality:.0f}).")
        else:
            quality_ratio = min(1.2, list_quality / max(min_quality, 1.0))
            quality_score = min(cls.WEIGHTS["quality"], cls.WEIGHTS["quality"] * (quality_ratio / 1.1))
            explanations.append(f"Quality verified: {list_quality:.0f}/100 meets requirement (min {min_quality:.0f}).")

        # 4. Contamination Limit (15 pts max)
        max_contam = float(requirement.get("maximum_contamination_pct", 15.0))
        list_contam = float(listing.get("contamination_est_pct", 10.0))
        
        if list_contam > max_contam:
            excess = list_contam - max_contam
            if excess > 10:
                failed_constraints.append(f"Contamination limit exceeded: Est. {list_contam:.1f}% exceeds max allowed {max_contam:.1f}%.")
                contam_score = 0.0
            else:
                contam_score = max(0.0, cls.WEIGHTS["contamination"] * 0.5 * (1.0 - (excess / 10.0)))
                explanations.append(f"Elevated contamination: Est. {list_contam:.1f}% slightly exceeds target {max_contam:.1f}%.")
        else:
            contam_margin = (max_contam - list_contam) / max(max_contam, 1.0)
            contam_score = cls.WEIGHTS["contamination"] * (0.6 + 0.4 * contam_margin)
            explanations.append(f"Cleanliness verified: Est. {list_contam:.1f}% is well within limit (max {max_contam:.1f}%).")

        # 5. Quantity Fit (15 pts max)
        req_min_qty = float(requirement.get("minimum_quantity_tonnes", 1.0))
        req_max_qty = float(requirement.get("maximum_quantity_tonnes", 50.0))
        list_qty = float(listing.get("quantity_tonnes", 10.0))

        if list_qty < req_min_qty:
            qty_ratio = list_qty / max(req_min_qty, 0.1)
            qty_score = cls.WEIGHTS["quantity"] * max(0.2, qty_ratio * 0.7)
            explanations.append(f"Partial batch: {list_qty:.1f} tonnes available (buyer seeks {req_min_qty:.1f}-{req_max_qty:.1f} tonnes).")
        elif list_qty > req_max_qty * 1.5:
            qty_score = cls.WEIGHTS["quantity"] * 0.8
            explanations.append(f"Surplus volume: {list_qty:.1f} tonnes exceeds maximum requirement {req_max_qty:.1f} tonnes; multiple deliveries possible.")
        else:
            qty_score = cls.WEIGHTS["quantity"]
            explanations.append(f"Optimal quantity match: {list_qty:.1f} tonnes fits buyer window ({req_min_qty:.1f} - {req_max_qty:.1f} t).")

        # 6. Price & Budget Fit (15 pts max)
        max_budget = float(requirement.get("max_budget_inr_per_kg", 1.0))
        list_price = float(listing.get("indicative_price_inr_per_kg", 0.5))

        if list_price > max_budget:
            budget_over = list_price - max_budget
            if budget_over > max_budget * 0.5:
                failed_constraints.append(f"Budget exceeded: Price ₹{list_price:.2f}/kg significantly exceeds max budget ₹{max_budget:.2f}/kg.")
                price_score = 0.0
            else:
                price_score = cls.WEIGHTS["price"] * max(0.0, 1.0 - (budget_over / max_budget))
                explanations.append(f"Slightly above budget: ₹{list_price:.2f}/kg vs budget ₹{max_budget:.2f}/kg.")
        else:
            savings_pct = (max_budget - list_price) / max(max_budget, 0.01)
            price_score = cls.WEIGHTS["price"] * min(1.0, 0.7 + 0.3 * savings_pct)
            explanations.append(f"Within budget: ₹{list_price:.2f}/kg offers cost advantage against buyer cap ₹{max_budget:.2f}/kg.")

        # 7. Geographic Distance (10 pts max)
        dist_km = calculate_haversine_distance(
            listing.get("latitude"), listing.get("longitude"),
            requirement.get("latitude"), requirement.get("longitude")
        )
        if dist_km <= 50.0:
            dist_score = cls.WEIGHTS["distance"]
            explanations.append(f"Local proximity: {dist_km:.1f} km minimizes freight haulage and transport CO2.")
        elif dist_km <= 200.0:
            dist_score = cls.WEIGHTS["distance"] * (1.0 - (dist_km - 50.0) / 250.0)
            explanations.append(f"Regional distance: {dist_km:.1f} km transit radius.")
        else:
            dist_score = cls.WEIGHTS["distance"] * 0.3
            explanations.append(f"Long-haul logistics: {dist_km:.1f} km transit; consider freight costs.")

        # Calculate Total Score
        raw_total = cat_score + quality_score + contam_score + qty_score + price_score + dist_score

        # If any hard constraints failed, cap score and mark incompatible
        is_compatible = len(failed_constraints) == 0
        if not is_compatible:
            final_score = min(raw_total * 0.3, 35.0)
            rec_level = "Incompatible"
        elif raw_total >= 78.0:
            final_score = min(100.0, raw_total)
            rec_level = "High Match"
        elif raw_total >= 55.0:
            final_score = raw_total
            rec_level = "Moderate Match"
        else:
            final_score = raw_total
            rec_level = "Low Match"

        return {
            "overall_score": round(final_score, 1),
            "recommendation_level": rec_level,
            "is_compatible": is_compatible,
            "sub_scores": {
                "category_compatibility": round((cat_score / cls.WEIGHTS["category"]) * 100, 1),
                "quality_score": round((quality_score / cls.WEIGHTS["quality"]) * 100, 1),
                "contamination_score": round((contam_score / cls.WEIGHTS["contamination"]) * 100, 1),
                "quantity_fit_score": round((qty_score / cls.WEIGHTS["quantity"]) * 100, 1),
                "budget_fit_score": round((price_score / cls.WEIGHTS["price"]) * 100, 1),
                "distance_score": round((dist_score / cls.WEIGHTS["distance"]) * 100, 1),
                "distance_km": dist_km,
            },
            "explanation": explanations,
            "failed_constraints": failed_constraints,
            "scoring_mode": mode
        }
