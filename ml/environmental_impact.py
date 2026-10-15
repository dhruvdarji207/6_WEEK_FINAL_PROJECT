"""
Environmental Impact Calculation Engine for Waste2Worth AI
Provides transparent, defensible calculations for waste diversion and avoided greenhouse gas emissions.
All factors are referenced against industrial LCA standards (DEFRA / IPCC).
"""

from typing import Any

# Standard LCA displacement factors (kg CO2e avoided per kg of secondary material utilized)
# Source: UK DEFRA GHG Conversion Factors & IPCC Guidelines for Industrial Materials
EMISSION_FACTORS = {
    "aluminium": {
        "factor_kg_co2e_per_kg": 8.14,
        "baseline": "Virgin bauxite electrolytic smelting displacement",
        "reference": "DEFRA GHG Conversion Factors (Recycled vs Virgin Aluminium)"
    },
    "ferrous_metal": {
        "factor_kg_co2e_per_kg": 1.52,
        "baseline": "Basic oxygen furnace (virgin iron ore) displacement",
        "reference": "WorldSteel LCA / DEFRA Scrap Steel Baseline"
    },
    "PET": {
        "factor_kg_co2e_per_kg": 1.78,
        "baseline": "Virgin fossil petrochemical naphtha polymer displacement",
        "reference": "PlasticsEurope Eco-profile (Virgin vs Mechanical Recycled PET)"
    },
    "HDPE": {
        "factor_kg_co2e_per_kg": 1.65,
        "baseline": "Virgin fossil ethylene polymerization displacement",
        "reference": "PlasticsEurope Eco-profile (Recycled HDPE Regrind)"
    },
    "cotton": {
        "factor_kg_co2e_per_kg": 2.45,
        "baseline": "Virgin agricultural cotton cultivation, ginning and processing displacement",
        "reference": "Textile Exchange LCA Standards & DEFRA Textile Reuse"
    },
    "polyester": {
        "factor_kg_co2e_per_kg": 2.10,
        "baseline": "Virgin PET fiber melt spinning displacement",
        "reference": "Textile Exchange Preferred Fiber Matrix"
    },
    "paper_fiber": {
        "factor_kg_co2e_per_kg": 0.88,
        "baseline": "Virgin wood pulp chemical digesting and bleaching displacement",
        "reference": "FEFCO European Corrugated Packaging LCA"
    },
    "wood_fiber": {
        "factor_kg_co2e_per_kg": 0.65,
        "baseline": "Virgin forestry timber harvesting and milling displacement",
        "reference": "DEFRA Wood Waste & Biomass Guidelines"
    },
    "biomass": {
        "factor_kg_co2e_per_kg": 0.45,
        "baseline": "Landfill anaerobic decomposition and open field burning prevention",
        "reference": "IPCC Waste Sector Methane Emission Mitigation Model"
    },
    "organic_biomass": {
        "factor_kg_co2e_per_kg": 0.50,
        "baseline": "Anaerobic municipal landfill methane generation avoidance",
        "reference": "IPCC 2006 Guidelines for National GHG Inventories (Waste)"
    },
    "glass": {
        "factor_kg_co2e_per_kg": 0.38,
        "baseline": "Virgin silica sand, soda ash, and high-temp furnace melting displacement",
        "reference": "FEVE European Container Glass Federation LCA"
    },
    "mineral_aggregate": {
        "factor_kg_co2e_per_kg": 0.06,
        "baseline": "Virgin stone quarrying, crushing and hauling displacement",
        "reference": "WRAP UK Recycled Aggregates Environmental LCA"
    },
}

DEFAULT_FACTOR = {
    "factor_kg_co2e_per_kg": 0.50,
    "baseline": "General industrial solid waste diversion from open dumping",
    "reference": "UNEP Global Waste Management Outlook (Conservative General Baseline)"
}

def calculate_environmental_impact(
    material_category: str,
    quantity_tonnes: float,
    reuse_yield_fraction: float = 0.75,
    distance_km: float = 100.0
) -> dict[str, Any]:
    """
    Calculate transparent environmental savings:
    - Waste Diverted (tonnes) = Quantity * Yield Fraction
    - Avoided CO2e (tonnes) = Waste Diverted * (Factor in kg/kg) - Transport Emissions
    """
    cat = material_category.strip()
    factor_info = EMISSION_FACTORS.get(cat, DEFAULT_FACTOR)
    factor = factor_info["factor_kg_co2e_per_kg"]

    # Waste diverted
    diverted_tonnes = round(quantity_tonnes * reuse_yield_fraction, 2)

    # Avoided production emissions (tonnes CO2e) = tonnes diverted * kg CO2e / kg
    gross_avoided_co2e = diverted_tonnes * factor

    # Transport emission penalty (Heavy Goods Vehicle diesel ~ 0.08 kg CO2e per tonne-km)
    transport_emission_tonnes = (diverted_tonnes * distance_km * 0.00008)
    net_avoided_co2e = max(0.0, round(gross_avoided_co2e - transport_emission_tonnes, 2))

    return {
        "material_category": cat,
        "input_quantity_tonnes": round(quantity_tonnes, 2),
        "reuse_yield_fraction": reuse_yield_fraction,
        "waste_diverted_tonnes": diverted_tonnes,
        "avoided_co2e_tonnes": net_avoided_co2e,
        "emission_factor_kg_co2e_per_kg": factor,
        "baseline_disposal_method": factor_info["baseline"],
        "factor_source_reference": factor_info["reference"],
        "assumptions": [
            f"Net reuse yield calculated at {reuse_yield_fraction * 100:.0f}% after sorting and preprocessing.",
            "Avoided carbon calculated by displacing equivalent virgin industrial raw materials.",
            f"Accounted for secondary haulage logistics penalty ({distance_km:.0f} km at 0.08 kg CO2e/t-km).",
            "Values represent indicative engineering estimates, not certified carbon offsets."
        ],
        "sdg_alignment": [
            "SDG 12.5: Substantially reduce waste generation through recycling and reuse",
            "SDG 11.6: Reduce environmental impact of cities through municipal and industrial waste management",
            "SDG 9.4: Upgrade infrastructure and retrofit industries to make them sustainable"
        ]
    }
