def test_signup_flow(client):
    user_data = {
        "username": "testsnake",
        "email": "test@snake.com",
        "password": "password123"
    }
    
    # 1. Signup
    response = client.post("/api/auth/signup", json=user_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["user"]["username"] == "testsnake"
    assert "password" not in data["data"]["user"]
    assert data["data"]["token"]  # a session token is issued

    # 2. Login
    login_data = {
        "email": "test@snake.com",
        "password": "password123"
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["user"]["email"] == "test@snake.com"
    assert data["data"]["token"]

def test_duplicate_signup(client):
    user_data = {
        "username": "dupe",
        "email": "dupe@snake.com",
        "password": "pass"
    }
    client.post("/api/auth/signup", json=user_data)
    
    # Try same email
    response = client.post("/api/auth/signup", json=user_data)
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

    # Try same username
    user_data_2 = user_data.copy()
    user_data_2["email"] = "other@snake.com"
    response = client.post("/api/auth/signup", json=user_data_2)
    assert response.status_code == 400
    assert "Username already taken" in response.json()["detail"]

def test_login_failures(client):
    # Setup user
    user_data = {"username": "failtest", "email": "fail@test.com", "password": "pass"}
    client.post("/api/auth/signup", json=user_data)
    
    # 1. Wrong password
    response = client.post("/api/auth/login", json={"email": "fail@test.com", "password": "wrong"})
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]
    
    # 2. Non-existent user
    response = client.post("/api/auth/login", json={"email": "ghost@test.com", "password": "pass"})
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]

def test_session_endpoint(client):
    response = client.get("/api/auth/session")
    assert response.status_code == 200
    data = response.json()
    # Currently we mock session as null in backend
    assert data["success"] is True
    assert data["data"] is None
