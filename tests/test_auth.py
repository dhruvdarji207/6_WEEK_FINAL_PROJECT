def test_login_success(client):
    res = client.post("/api/auth/login", json={
        "email": "admin@waste2worth.org",
        "password": "AdminPassword123!"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["role"] == "admin"

def test_login_invalid_password(client):
    res = client.post("/api/auth/login", json={
        "email": "admin@waste2worth.org",
        "password": "WrongPassword999!"
    })
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]

def test_register_and_get_me(client):
    new_email = "new_partner@recycling.org"
    res = client.post("/api/auth/register", json={
        "email": new_email,
        "password": "SecurePassword123!",
        "full_name": "Test Partner",
        "organization_name": "Circular Materials Inc",
        "role": "buyer",
        "city": "Surat"
    })
    assert res.status_code == 201
    token = res.json()["access_token"]

    # Verify /me endpoint
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == new_email
    assert me_data["role"] == "buyer"
