# AI Coding Agent Prompt — Waste2Worth AI

Build a polished, responsive full-stack web application called **Waste2Worth AI**, an AI-assisted industrial waste marketplace aligned primarily with **SDG 12: Responsible Consumption and Production** and secondarily with **SDG 11: Sustainable Cities and Communities**.

## Project goal
Connect industries that generate by-products with manufacturers, recyclers, and processors that may be able to reuse those materials as secondary raw materials. Start with a small pilot involving 2–3 selected industries and non-hazardous, clearly specified material streams. The broader sectors are textile, chemical, food processing, agriculture, construction, plastics, and manufacturing.

## Mandatory first step: inspect the attached starter datasets
Use the CSV files in `datasets/`:
- `demo_waste_listings.csv`
- `demo_buyer_requirements.csv`
- `synthetic_demo_transactions.csv`
- `material_compatibility_reference.csv`
- `ml_feature_data_requirements.csv`
Read `README_DATASET.md` before using them. All demo records are synthetic; label them clearly as demo data in the UI and never imply that they represent real businesses, market prices, or verified environmental outcomes.

## Suggested stack
- Frontend: React + Vite + TypeScript, responsive modern UI, Tailwind CSS (or equivalent).
- Backend: Python FastAPI.
- Database: SQLite for easy local setup, with SQLAlchemy models and a clear migration/seed process.
- ML/data: pandas, scikit-learn, joblib. Keep models modular and reproducible.
- Charts: Recharts or Chart.js.
- Authentication: secure hashed passwords and role-based access for Admin, Supplier, and Buyer. If a full authentication setup is too large, implement a clear MVP login flow with server-side authorization; never hard-code real credentials or secrets.

If the environment mandates a different stack, explain the reason and preserve the same features and data integrity.

## Required pages
1. **Landing page** — clear value proposition, circular-economy flow, SDG 12/11 alignment, CTA buttons, and transparent “demo dataset” notice.
2. **Dashboard** — summary cards for available listings, buyer needs, suggested matches, and demo-only material reuse metrics.
3. **Marketplace / Waste listings** — searchable and filterable listing table/cards with material, category, source sector, quantity, quality, contamination, indicative price, city, condition, availability and status.
4. **Add listing** — validated form for a supplier to submit a material listing. Mark new entries as user-submitted, not verified by default.
5. **Buyer requirements** — browse and create requirements including material category, quality threshold, contamination limit, quantity range, budget and preferred location.
6. **AI Match Recommendations** — show ranked potential matches and explain the factors used (category compatibility, quality, contamination, quantity, price and distance). Include a “why this match?” breakdown. Clearly state that a recommendation is not a safety or legal certification.
7. **Predictions & Insights** — separate tabs for waste quantity, demand/price and environmental indicators. If no suitable real data exists, display demo-only exploratory outputs or “insufficient verified data”; do not make false claims about model accuracy.
8. **Impact dashboard** — show verified quantity reused only when supported by actual completed exchanges; otherwise label all figures “synthetic demo data.” Show formulas, assumptions and uncertainty for any impact estimate.
9. **Admin review** — review listings, flag inaccurate records, manage users, and mark listings as verified only after a documented review.
10. **About / SDG impact** — explain circular economy, SDG 12 primary and SDG 11 supporting, limitations and safety safeguards.

## Matching logic
Implement a transparent baseline first:
- Exclude listings not available or flagged for review.
- Compare material categories and condition.
- Check buyer minimum quality and maximum contamination.
- Check listing quantity against buyer quantity range.
- Compare indicative price with budget where both are present.
- Estimate distance from coordinates using a proper geographic distance formula.
- Rank candidates using a documented weighted score; expose score components in the UI.
- Do not treat the compatibility reference as definitive. Require human verification and material testing as appropriate.
- Do not recommend hazardous or regulated material streams for the initial pilot.

## Machine-learning requirements
Implement model interfaces and honest fallbacks:
- **Waste-to-industry matching:** start with rule-based ranking. Only train a classifier/ranker if labeled real match outcomes become available.
- **Waste quantity prediction:** needs periodic historical data by material/sector; if unavailable, show “insufficient historical data” or a clearly labeled synthetic demonstration.
- **Demand prediction:** needs dated searches, requests or transactions; do not infer actual market demand from the synthetic transaction file.
- **Price prediction:** use only verified real transaction prices for operational claims. Synthetic prices may be used for UI/testing and must remain labelled.
- **Environmental impact estimation:** prefer transparent calculations from verified reuse quantity and defensible published factors. Do not claim carbon savings without a suitable baseline and factor source.
- Provide train/evaluate scripts, reproducible random seeds, data validation, train/test split, and metrics only when the dataset supports them. Never invent accuracy values.

## Database models
At minimum: User, WasteListing, BuyerRequirement, MatchRecommendation, ExchangeRequest, Transaction/ExchangeOutcome, VerificationRecord, ImpactRecord, AuditLog. Include timestamps, status fields, and source/provenance flags (synthetic_demo, user_submitted, verified).

## UX and design
- Professional sustainability/industrial style, accessible contrast, responsive desktop and mobile layouts.
- Consistent navigation, helpful empty states, loading/error handling, form validation, and readable charts.
- Use realistic seeded data from the provided CSVs, but add visible “Synthetic demo data — not real market information” labels wherever these records appear.
- Avoid decorative clutter, broken links, fake customer testimonials, fabricated partners, and made-up impact statistics.

## Security and data quality
- Validate and sanitize inputs on the backend.
- Hash passwords; protect privileged endpoints; keep secrets in environment variables.
- Use role-based access control and audit important changes.
- Add pagination and filtering; avoid exposing private user contact information unnecessarily.
- Verify CSV columns and types during import; handle missing/invalid rows gracefully.
- Keep a clear distinction between listed, reviewed, verified, matched, and completed states.

## Required deliverables from the agent
1. Complete working source code with clear folder structure.
2. All pages and backend endpoints implemented.
3. CSV import/seed script that loads the provided demo datasets.
4. Database schema/models and sample environment file (no secrets).
5. Matching algorithm with explainable scores.
6. ML prototype scripts and honest data sufficiency checks.
7. Automated tests for core matching, validation, and permissions.
8. `README.md` with exact setup commands for Windows and Linux/macOS, how to run frontend/backend, how to seed the database, and how to run tests.
9. `requirements.txt` or equivalent lock/config files.
10. A `LIMITATIONS.md` explaining synthetic data, safety, data gaps, and what must be verified before real deployment.

## Acceptance criteria
- The app runs locally using the documented steps.
- CSV data imports without column errors.
- Users can search listings and buyer requirements.
- Matching returns explainable recommendations and respects constraints.
- Synthetic demo data is visibly labelled everywhere it is used.
- No unsupported environmental, financial, or model-accuracy claims.
- New user-submitted listings are not automatically marked verified.
- All primary navigation and forms work; no dead buttons or placeholder pages.
- The UI is responsive and accessible.
- The README explains how to replace demo data with consented, verified pilot data.

First inspect the dataset files, then implement the application end-to-end. Do not stop after generating a mockup or frontend-only shell.
