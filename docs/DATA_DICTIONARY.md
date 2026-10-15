# Data Dictionary & Schema Specification

This document provides the canonical schema definitions, field descriptions, units, constraints, and provenance flags for all tables and starter CSV datasets used in Waste2Worth AI.

---

## 1. Waste Listings (`demo_waste_listings.csv` / `waste_listings` table)

| Column Name | Type | Description | Allowed Values / Constraints |
| :--- | :--- | :--- | :--- |
| `listing_id` / `listing_code` | String | Unique catalog identifier | Format `L0001` - `L9999` |
| `supplier_name` | String | Commercial entity listing the material | Synthetic company pseudonym |
| `supplier_type` | String | Scale/type of generating industrial facility | Large Manufacturer, Recycler, Processor, Medium Manufacturer, Small Manufacturer |
| `source_sector` | String | Industrial sector generating the by-product | Textile, Construction, Agriculture, Food processing, Manufacturing, Chemical, Plastics |
| `material_name` | String | Technical descriptive name of scrap | e.g., "PET plastic flakes", "Brick rubble" |
| `material_category` | String | Standard material category classification | cotton, polyester, PET, HDPE, paper_fiber, wood_fiber, biomass, organic_biomass, mineral_aggregate, ferrous_metal, aluminium, glass |
| `condition` | String | Physical presentation and storage state | sorted_clean, clean_dry, dry_clean, fresh_segregated |
| `quantity_tonnes` | Float | Net available mass in metric tonnes | $> 0.0$ |
| `quality_score_0_100` | Float | Standardized technical purity assay | $0.0 - 100.0$ |
| `contamination_est_pct` | Float | Estimated percentage of foreign matter | $0.0 - 100.0$ |
| `indicative_price_inr_per_kg` | Float | Indicative asking price in Indian Rupees | $\ge 0.0$ INR per kilogram |
| `city` | String | Primary industrial city / cluster | Gujarat industrial corridors (Surat, Ahmedabad, Bharuch, etc.) |
| `latitude`, `longitude` | Float | Geographic coordinates for transit calculation | WGS84 decimal degrees |
| `listing_status` | String | Current moderation and procurement state | Available, Under Review, Reserved, Sold, Rejected |
| `hazardous_flag` | Boolean | Flags statutory hazardous substances | True / False (Defaults to False) |
| `demo_data_flag` | Boolean | Identifies synthetic simulation records | True for synthetic demo seed records |

---

## 2. Buyer Requirements (`demo_buyer_requirements.csv` / `buyer_requirements` table)

| Column Name | Type | Description | Allowed Values / Constraints |
| :--- | :--- | :--- | :--- |
| `buyer_need_id` / `buyer_need_code` | String | Unique requisition identifier | Format `B0001` - `B9999` |
| `buyer_name` | String | Purchasing corporate entity | Synthetic company pseudonym |
| `buyer_type` | String | Type of processing/manufacturing buyer | Recycler, Packaging Producer, Material Processor, Manufacturer |
| `buyer_sector` | String | Target utilization industry sector | Manufacturing, Construction, Plastics, Textile, etc. |
| `required_material_category` | String | Target secondary material stream | 12 standardized categories |
| `minimum_quality_score` | Float | Minimum acceptable lab purity assay | $0.0 - 100.0$ |
| `maximum_contamination_pct` | Float | Maximum tolerable contamination | $0.0 - 100.0$ |
| `minimum_quantity_tonnes` | Float | Smallest viable delivery batch | $\ge 0.0$ tonnes |
| `maximum_quantity_tonnes` | Float | Maximum batch absorption capacity | $> 0.0$ tonnes |
| `max_budget_inr_per_kg` | Float | Ceiling willingness-to-pay budget | INR per kilogram |
| `required_condition` | String | Required physical delivery condition | clean_dry, sorted_clean, dry_clean, etc. |
| `status` | String | Procurement status | Active, Fulfilled, Cancelled |

---

## 3. Completed Transactions (`synthetic_demo_transactions.csv` / `exchange_transactions` table)

| Column Name | Type | Description | Allowed Values / Constraints |
| :--- | :--- | :--- | :--- |
| `transaction_id` / `transaction_code` | String | Unique transaction record code | Format `T0001` - `T9999` |
| `quantity_tonnes` | Float | Agreed settled volume | Metric tonnes |
| `price_inr_per_kg` | Float | Agreed settlement price | INR per kilogram |
| `distance_km` | Float | Transit haulage distance | Calculated via Haversine formula |
| `match_completed` | Boolean | Classification target for ML ranker | True (Deal closed) / False |
| `estimated_reuse_yield_fraction` | Float | Net material recovered post-processing | Typical range $0.50 - 0.95$ |
| `verified_by_admin` | Boolean | Regulatory verification stamp | True / False |
| `demo_data_flag` | Boolean | Synthetic data provenance flag | True for synthetic demo records |
