# University Final-Year Viva Voce & Evaluation Defense Guide

This guide is structured to assist students and project presenters during academic evaluation, viva voce examinations, and technical demonstrations of **Waste2Worth AI**.

---

## 1. Project Summary & Elevator Pitch

> *"Waste2Worth AI is an AI-powered industrial symbiosis marketplace designed to operationalize the circular economy under UN SDG 12 (Responsible Consumption & Production) and SDG 11 (Sustainable Cities). By connecting industrial manufacturing facilities generating scrap with recyclers and secondary manufacturers, the platform transforms discarded by-products into high-value secondary raw materials. It features an explainable multi-criteria matching engine, machine learning completion ranker, strict data-sufficiency forecasting guardrails, role-based lifecycle management, and ISO 14040 Life Cycle Assessment (LCA) environmental accounting."*

---

## 2. Recommended Live Demonstration Script (5-Minute Walkthrough)

### Step 1: Landing Page & SDG Value Proposition (1 minute)
- Open `http://localhost:5173`.
- Highlight SDG 12, SDG 11, and SDG 9 alignment.
- Explain the **Take-Make-Waste Linear vs. Circular Symbiosis** comparison diagram.
- Point out the **Synthetic Demo Data Badge** demonstrating scientific transparency and ethical AI.

### Step 2: Industrial Marketplace & Listing Creation (1 minute)
- Click **Marketplace**.
- Filter by category (e.g., `PET`, `cotton`, `aluminium`) and demonstrate real-time quality and contamination sliders.
- Switch to **Waste Supplier** using the **Demo Roles** switcher.
- Click **List Waste Material** and submit a new lot. Show that it is saved in **Under Review** status until moderated by an administrator.

### Step 3: AI Matching Engine & Explainability (1.5 minutes)
- Navigate to **AI Matcher**.
- Select any active Buyer Requirement.
- Show the transparent breakdown bars:
  - Category Compatibility (25%)
  - Quality Specification (20%)
  - Contamination Tolerances (15%)
  - Quantity Window (15%)
  - Budget Alignment (15%)
  - Geographic Proximity (10%)
- Toggle the engine between **Rule-Based Baseline** and **ML Ranker (Gradient Boosting)**. Show how the ML model outputs an empirical probability of deal closure.
- Click **Initiate Exchange Request** from the top match.

### Step 4: Exchange State Machine & Admin Moderation (1 minute)
- Switch to **Exchanges** page to show the lifecycle: `Submitted` $\rightarrow$ `Accepted` $\rightarrow$ `In Transit` $\rightarrow$ `Completed`.
- Switch to **Demo Administrator** persona.
- Open **Admin Portal**: show pending listing approvals, dispute handling, and the immutable security audit trail.

### Step 5: Environmental Impact & ML Analytics (30 seconds)
- Open **Eco Impact**: display total diverted tonnes and avoided $\text{CO}_2\text{e}$ with DEFRA/IPCC displacement citations.
- Open **ML Analytics**: show the **Data Sufficiency Guardrail** (insufficient test with 2 points vs. sufficient projection with 6 points).

---

## 3. High-Frequency Examiner Questions & Recommended Answers

### Q1: What makes your matching engine "explainable"?
**Answer:** Instead of treating matchmaking as an opaque black box, our engine decomposes the composite score into six distinct criteria with weighted contributions. For every candidate listing, the system generates human-readable rationales explaining why a match succeeded or failed (e.g. *"Quality verified: 88/100 meets requirement (min 70)"* or *"Contamination limit exceeded: Est. 26% exceeds max allowed 10%"*). Hard safety constraints immediately disqualify hazardous or out-of-spec lots.

### Q2: Why did you compare Logistic Regression with Gradient Boosting?
**Answer:** In accordance with academic ML best practices, we established a linear baseline (Logistic Regression) before introducing an ensemble method. The linear model achieved 77.8% accuracy and 0.858 ROC-AUC, but struggled with nonlinear interactions between contamination percentages and freight distances. The Gradient Boosting classifier achieved 88.9% accuracy and 0.926 ROC-AUC, providing an 11% improvement in ranking precision.

### Q3: Why does your waste quantity forecaster refuse to predict on small datasets?
**Answer:** Time-series forecasting mathematically requires sequential longitudinal data to detect autocorrelation, trends, and seasonal variance. Making predictive claims on only 2 or 3 cross-sectional snapshots is scientifically invalid and creates hallucinations. We implemented a **Data Sufficiency Guardrail** requiring at least 6 sequential periodic observations; otherwise, the API returns a structured `insufficient_data` diagnostic.

### Q4: How is data privacy and security handled?
**Answer:** We enforce server-side Role-Based Access Control (RBAC) via FastAPI dependencies, verify passwords using salted Bcrypt (12 rounds), issue cryptographically signed JWT tokens with 24-hour expiration, and maintain an immutable audit log of all privileged system actions.
