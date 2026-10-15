def test_list_waste_listings(client):
    res = client.get("/api/listings?page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 180
    assert len(data["items"]) == 10

def test_filter_waste_listings_by_category(client):
    res = client.get("/api/listings?category=cotton")
    assert res.status_code == 200
    data = res.json()
    assert all("cotton" in item["material_category"].lower() for item in data["items"])

def test_supplier_create_listing_under_review(client, supplier_token):
    res = client.post(
        "/api/listings",
        headers={"Authorization": f"Bearer {supplier_token}"},
        json={
            "material_name": "High-Grade Cotton Scraps",
            "material_category": "cotton",
            "source_sector": "Textile",
            "condition": "clean_dry",
            "quantity_tonnes": 25.5,
            "quality_score_0_100": 88.0,
            "contamination_est_pct": 4.5,
            "indicative_price_inr_per_kg": 1.2,
            "city": "Surat",
            "latitude": 21.1702,
            "longitude": 72.8311,
            "hazardous_flag": False
        }
    )
    assert res.status_code == 201
    data = res.json()
    assert data["material_name"] == "High-Grade Cotton Scraps"
    # Mandatory requirement: new listings default to Under Review until reviewed
    assert data["listing_status"] == "Under Review"
    assert data["demo_data_flag"] is False
