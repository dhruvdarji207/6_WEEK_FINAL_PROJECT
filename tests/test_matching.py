def test_recommend_matches_rule_based(client):
    res = client.post("/api/matching/recommend", json={
        "required_material_category": "polyester",
        "buyer_sector": "Textile",
        "minimum_quality_score": 70.0,
        "maximum_contamination_pct": 30.0,
        "quantity_tonnes": 30.0,
        "max_budget_inr_per_kg": 1.5,
        "city": "Bharuch",
        "mode": "rule_based"
    })
    assert res.status_code == 200
    data = res.json()
    assert "matches" in data
    assert len(data["matches"]) > 0

    top_match = data["matches"][0]
    assert "overall_score" in top_match
    assert "sub_scores" in top_match
    assert "explanation" in top_match
    assert len(top_match["explanation"]) > 0
    assert "category_compatibility" in top_match["sub_scores"]

def test_recommend_matches_hard_constraints(client):
    # Match with impossibly tight contamination limit
    res = client.post("/api/matching/recommend", json={
        "required_material_category": "polyester",
        "buyer_sector": "Textile",
        "minimum_quality_score": 99.0,
        "maximum_contamination_pct": 0.01,
        "quantity_tonnes": 30.0,
        "max_budget_inr_per_kg": 0.01,
        "city": "Bharuch",
        "mode": "rule_based"
    })
    assert res.status_code == 200
    data = res.json()
    # At least some matches must fail constraints
    has_failed_constraints = any(len(m["failed_constraints"]) > 0 for m in data["matches"])
    assert has_failed_constraints

def test_ml_benchmark_endpoint(client):
    res = client.get("/api/matching/benchmark")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "trained"
    assert "benchmark" in data
    assert "gradient_boosting_ranker" in data["benchmark"]
