# Waste2Worth AI Starter Dataset Pack

## Important data note
All supplier names, buyer names, listings, buyer requirements, transactions, prices, quantities, match outcomes, and dates in the generated CSVs are **synthetic demo data** created for prototyping and testing. They are not real companies, real market prices, real transactions, or verified industrial measurements. Do not present them as real-world evidence or use them to make operational safety decisions.

## Files
- `demo_waste_listings.csv`: 180 sample waste-material listings.
- `demo_buyer_requirements.csv`: 140 sample buyer requirements.
- `synthetic_demo_transactions.csv`: 360 synthetic transaction-like rows for UI/demo and pipeline testing only.
- `material_compatibility_reference.csv`: illustrative material categories and potential reuse pathways. All pathways require expert, quality, safety, and regulatory verification.
- `ml_feature_data_requirements.csv`: proposed data needed and limitations for each planned ML feature.

## Suggested MVP approach
1. Use the listings and buyer requirements to demonstrate filters and rule-based matching.
2. Match on material category, quality, contamination, condition, quantity, price and distance. Treat matches as suggestions only.
3. Use synthetic transactions only to test dashboards and ML pipeline code; clearly label any metrics and predictions as demo-only.
4. Do not train or claim a reliable production model from these synthetic files. Collect consented, verified real pilot data before evaluating predictive performance.
5. Environmental impact estimates should initially show quantity reused and any formula/assumptions. Do not claim carbon savings without defensible factors and a baseline.
6. Do not include hazardous or regulated materials in the pilot without qualified compliance partners.

## Dataset counts
- Waste listings: 180
- Buyer requirements: 140
- Synthetic transactions: 360
- Material compatibility references: 12
