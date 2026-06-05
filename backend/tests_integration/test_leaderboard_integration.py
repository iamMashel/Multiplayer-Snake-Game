def _signup(client, username, email="x@test.com", password="password123"):
    """Sign up a user and return their auth token + headers."""
    resp = client.post("/api/auth/signup", json={
        "username": username, "email": email, "password": password,
    })
    assert resp.status_code == 200, resp.text
    token = resp.json()["data"]["token"]
    return token, {"Authorization": f"Bearer {token}"}


def test_leaderboard_flow(client):
    _, headers = _signup(client, "gamer1", "gamer1@test.com")

    # Submit score (authenticated). Username is derived from the token, not the body.
    response = client.post("/api/leaderboard/", json={"score": 100, "mode": "walls"}, headers=headers)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["success"] is True
    assert data["data"]["score"] == 100
    assert data["data"]["username"] == "gamer1"

    response = client.get("/api/leaderboard/")
    assert response.status_code == 200
    lb_data = response.json()["data"]
    assert len(lb_data) == 1
    assert lb_data[0]["username"] == "gamer1"
    assert lb_data[0]["score"] == 100


def test_submit_requires_auth(client):
    # No Authorization header → rejected (can't submit anonymously / as anyone).
    response = client.post("/api/leaderboard/", json={"score": 500, "mode": "walls"})
    assert response.status_code == 401

    # A bogus token is also rejected.
    response = client.post(
        "/api/leaderboard/", json={"score": 500, "mode": "walls"},
        headers={"Authorization": "Bearer not.a.realtoken"},
    )
    assert response.status_code == 401


def test_score_is_attributed_to_token_user_not_body(client):
    # Impersonation guard: even if the body names someone else, the score is
    # recorded for the authenticated (token) user.
    _signup(client, "victim", "victim@test.com")
    _, attacker = _signup(client, "attacker", "attacker@test.com")

    resp = client.post(
        "/api/leaderboard/",
        json={"score": 300, "mode": "pass-through", "username": "victim"},
        headers=attacker,
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["data"]["username"] == "attacker"


def test_implausible_scores_rejected(client):
    _, headers = _signup(client, "cheater", "cheater@test.com")
    for bad in (999999, -10, 13):  # too big, negative, not a step of 5
        resp = client.post("/api/leaderboard/", json={"score": bad, "mode": "walls"}, headers=headers)
        assert resp.status_code == 400, f"{bad} should be rejected, got {resp.status_code}"


def test_leaderboard_sorting_and_filtering(client):
    _, algo = _signup(client, "algo", "a@t.com")
    _, bob = _signup(client, "bob", "b@t.com")

    submissions = [
        (algo, {"score": 100, "mode": "walls"}),
        (bob,  {"score": 200, "mode": "walls"}),
        (algo, {"score": 50,  "mode": "pass-through"}),
        (bob,  {"score": 300, "mode": "pass-through"}),
    ]
    for headers, body in submissions:
        r = client.post("/api/leaderboard/", json=body, headers=headers)
        assert r.status_code == 200, r.text

    # Global sorting (desc)
    data = client.get("/api/leaderboard/").json()["data"]
    assert [d["score"] for d in data] == [300, 200, 100, 50]
    assert data[0]["username"] == "bob"
    assert data[0]["rank"] == 1

    # Filter by walls
    data = client.get("/api/leaderboard/?mode=walls").json()["data"]
    assert [d["score"] for d in data] == [200, 100]
    assert all(d["mode"] == "walls" for d in data)

    # Filter by pass-through
    data = client.get("/api/leaderboard/?mode=pass-through").json()["data"]
    assert [d["score"] for d in data] == [300, 50]
