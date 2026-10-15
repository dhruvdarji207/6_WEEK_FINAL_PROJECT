def test_exchange_lifecycle_workflow(client, buyer_token, supplier_token, admin_token):
    # 1. Buyer submits exchange request
    create_res = client.post(
        "/api/exchanges",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={
            "listing_id": 1,
            "requested_quantity_tonnes": 10.0,
            "offered_price_inr_per_kg": 0.85,
            "notes": "Testing standard circular exchange request."
        }
    )
    assert create_res.status_code == 201
    req_data = create_res.json()
    req_id = req_data["id"]
    assert req_data["status"] == "Submitted"

    # 2. Supplier accepts request
    accept_res = client.put(
        f"/api/exchanges/{req_id}/status",
        headers={"Authorization": f"Bearer {supplier_token}"},
        json={"status": "Accepted"}
    )
    assert accept_res.status_code == 200
    assert accept_res.json()["status"] == "Accepted"

    # 3. Transition to In Transit
    transit_res = client.put(
        f"/api/exchanges/{req_id}/status",
        headers={"Authorization": f"Bearer {supplier_token}"},
        json={"status": "In Transit"}
    )
    assert transit_res.status_code == 200
    assert transit_res.json()["status"] == "In Transit"

    # 4. Complete exchange and record transaction
    complete_res = client.put(
        f"/api/exchanges/{req_id}/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "status": "Completed",
            "agreed_quantity_tonnes": 10.0,
            "agreed_price_inr_per_kg": 0.85
        }
    )
    assert complete_res.status_code == 200
    assert complete_res.json()["status"] == "Completed"
