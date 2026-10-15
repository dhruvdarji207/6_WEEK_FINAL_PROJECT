# Project Limitations & Disclosure Manifesto

Waste2Worth AI is an academic prototype and research demonstration application designed to evaluate algorithmic industrial symbiosis and circular matchmaking.

To maintain ethical AI standards and transparency, the following technical and operational limitations are documented:

## 1. Synthetic Demonstration Dataset Notice
- All company names (e.g., "Demo Supplier 43", "Demo Buyer 29"), locations, transaction records, prices, and quantities are **synthetically generated demo data**.
- These records are designed exclusively for prototyping software workflows, testing ML pipelines, and user interface evaluation.
- **Do not interpret synthetic demo data as actual industrial transaction histories, macroeconomic demand, or market commodity prices.**

## 2. Indicative Machine Learning Pricing Predictions
- The pricing prediction regression models (`price_regressor.joblib`) are trained on synthetic transactions.
- Predictions represent **indicative educational estimates** to illustrate how machine learning regression evaluates material grade, quantity, and contamination.
- They do **not** constitute binding commercial offers, legal bids, or certified market appraisals.

## 3. Longitudinal Time-Series Waste Forecasting Guardrails
- The starter pack contains cross-sectional snapshot listings rather than sequential multi-year industrial ERP/MRP production history.
- The quantity forecasting module implements a strict **Data Sufficiency Guardrail**: any attempt to project waste quantities with fewer than 6 sequential dated observations is rejected with an `insufficient_data` diagnostic message.
- Operational production forecasting in a live manufacturing plant requires integration with enterprise ERP logs, production schedules, and seasonal cycle data.

## 4. Restriction on Hazardous and Regulated Waste
- Materials classified under statutory Hazardous Waste Management Rules (toxic chemical sludge, bio-medical waste, radioactive contaminants, heavy metal concentrates) are **strictly prohibited** on the open marketplace.
- Safe transfer of hazardous by-products mandates specialized manifest tracking, authorized hazardous waste haulers, and Pollution Control Board clearances outside the scope of this general secondary raw materials exchange.

## 5. Environmental Savings and Carbon Displacement Claims
- Avoided greenhouse gas emissions ($\text{t CO}_2\text{e}$) displayed in the platform are derived from standard Life Cycle Assessment (LCA) virgin material displacement baselines (sourced from UK DEFRA & IPCC guidelines).
- Actual commercial carbon credit generation or certified Scope 3 emissions reporting requires formal third-party measurement, verification, and audit of factory processing energy and certified weighbridge logs.
