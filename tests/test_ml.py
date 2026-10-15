def test_predict_price(client):
    res = client.post("/api/ml/predict-price", json={
        "material_category": "PET",
        "source_sector": "Manufacturing",
        "quality_score_0_100": 85.0,
        "contamination_pct": 5.0,
        "quantity_tonnes": 20.0,
        "distance_km": 80.0
    })
    assert res.status_code == 200
    data = res.json()
    assert data["predicted_price_inr_per_kg"] > 0
    assert data["price_range_low"] <= data["predicted_price_inr_per_kg"] <= data["price_range_high"]
    assert "disclaimer" in data

def test_predict_quantity_insufficient_data(client):
    # Only 2 observations provided
    res = client.post("/api/ml/predict-quantity", json={
        "material_category": "cotton",
        "historical_observations": [
            {"date": "2026-01-01", "quantity_tonnes": 15.0},
            {"date": "2026-02-01", "quantity_tonnes": 18.0}
        ]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "insufficient_data"
    assert data["provided_points_count"] == 2
    assert data["forecasted_quantity_tonnes"] is None
    assert "Insufficient historical observations" in data["message"]

def test_predict_quantity_sufficient_data(client):
    # 6 sequential monthly points
    observations = [
        {"date": f"2026-0{i+1}-01", "quantity_tonnes": 20.0 + i * 2.5}
        for i in range(6)
    ]
    res = client.post("/api/ml/predict-quantity", json={
        "material_category": "cotton",
        "historical_observations": observations
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "sufficient"
    assert data["forecasted_quantity_tonnes"] is not None
    assert data["forecasted_quantity_tonnes"] > 25.0
    assert data["trend_direction"] == "Increasing"

def test_impact_estimate_calculation(client):
    res = client.post("/api/ml/impact-estimate", json={
        "material_category": "aluminium",
        "quantity_tonnes": 10.0,
        "reuse_yield_fraction": 0.8,
        "distance_km": 50.0
    })
    assert res.status_code == 200
    data = res.json()
    # 10.0 * 0.8 = 8.0 tonnes diverted
    assert data["waste_diverted_tonnes"] == 8.0
    # Avoided CO2e is approx 8.0 * 8.14 minus transport penalty
    assert data["avoided_co2e_tonnes"] > 50.0
    assert "baseline_disposal_method" in data
    assert "factor_source_reference" in data
