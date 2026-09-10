from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_login_rejects_bad_password():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpass"})
    assert response.status_code == 401


def test_student_create_requires_auth():
    response = client.post(
        "/api/students",
        json={
            "roll_no": "99IT999",
            "name": "Test User",
            "batch_year": 2024,
            "email": "test@kongu.edu",
            "status": "alumni",
        },
    )
    assert response.status_code == 401


def _token():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    return response.json()["access_token"]


def test_student_crud_search_and_reports():
    token = _token()
    headers = {"Authorization": f"Bearer {token}"}
    created = client.post(
        "/api/students",
        headers=headers,
        json={
            "roll_no": "23IT888",
            "name": "Legacy Tester",
            "batch_year": 2023,
            "email": "legacy.tester@kongu.edu",
            "current_company": "Infosys",
            "job_role": "Systems Engineer",
            "career_notes": "Seeded by automated test.",
            "status": "alumni",
        },
    )
    assert created.status_code == 201, created.text
    student_id = created.json()["id"]

    listed = client.get("/api/students", params={"q": "Legacy Tester"})
    assert listed.status_code == 200
    assert any(row["roll_no"] == "23IT888" for row in listed.json())

    search = client.get("/api/search", params={"q": "Legacy Tester"})
    assert search.status_code == 200
    assert any(row["name"] == "Legacy Tester" for row in search.json()["students"])

    updated = client.put(
        f"/api/students/{student_id}",
        headers=headers,
        json={
            "roll_no": "23IT888",
            "name": "Legacy Tester",
            "batch_year": 2023,
            "email": "legacy.tester@kongu.edu",
            "current_company": "Wipro",
            "job_role": "Project Engineer",
            "career_notes": "Updated by automated test.",
            "status": "alumni",
        },
    )
    assert updated.status_code == 200
    assert updated.json()["current_company"] == "Wipro"

    dash = client.get("/api/dashboard", headers=headers)
    assert dash.status_code == 200
    assert dash.json()["students"] >= 1

    reports = client.get("/api/reports", headers=headers)
    assert reports.status_code == 200
    assert "students_by_batch" in reports.json()

    deleted = client.delete(f"/api/students/{student_id}", headers=headers)
    assert deleted.status_code == 204


def test_feedback_and_validation():
    bad = client.post(
        "/api/feedback",
        json={"name": "A", "email": "not-an-email", "kind": "inquiry", "subject": "Hi", "message": "Too short"},
    )
    assert bad.status_code == 422

    ok = client.post(
        "/api/feedback",
        json={
            "name": "Campus Guest",
            "email": "guest@example.com",
            "kind": "feedback",
            "subject": "Helpful archive",
            "message": "The alumni search made it easy to find a senior.",
        },
    )
    assert ok.status_code == 201


def test_nfr02_unauthorized_endpoints_restricted():
    """Verify 100% of protected staff endpoints reject unauthenticated access with 401."""
    endpoints = [
        ("post", "/api/students", {"roll_no": "X", "name": "X", "batch_year": 2024, "email": "x@k.edu"}),
        ("put", "/api/students/1", {"roll_no": "X", "name": "X", "batch_year": 2024, "email": "x@k.edu"}),
        ("delete", "/api/students/1", None),
        ("post", "/api/projects", {"title": "X", "year": 2024, "category": "project", "authors": "A", "description": "D" * 10}),
        ("put", "/api/projects/1", {"title": "X", "year": 2024, "category": "project", "authors": "A", "description": "D" * 10}),
        ("delete", "/api/projects/1", None),
        ("post", "/api/milestones", {"year": 2024, "title": "X", "category": "award", "description": "D" * 10}),
        ("put", "/api/milestones/1", {"year": 2024, "title": "X", "category": "award", "description": "D" * 10}),
        ("delete", "/api/milestones/1", None),
        ("post", "/api/faculty", {"name": "X", "designation": "D", "specialization": "S", "publications": 0, "experience_years": 0}),
        ("put", "/api/faculty/1", {"name": "X", "designation": "D", "specialization": "S", "publications": 0, "experience_years": 0}),
        ("delete", "/api/faculty/1", None),
        ("post", "/api/labs", {"name": "X", "description": "D" * 10}),
        ("put", "/api/labs/1", {"name": "X", "description": "D" * 10}),
        ("delete", "/api/labs/1", None),
        ("post", "/api/placements", {"company": "X", "job_role": "R", "year": 2024, "offers_count": 1, "package_lpa": 5.0}),
        ("put", "/api/placements/1", {"company": "X", "job_role": "R", "year": 2024, "offers_count": 1, "package_lpa": 5.0}),
        ("delete", "/api/placements/1", None),
        ("get", "/api/feedback", None),
        ("get", "/api/dashboard", None),
        ("get", "/api/reports", None),
    ]
    for method, path, body in endpoints:
        fn = getattr(client, method)
        kwargs = {"json": body} if body is not None else {}
        resp = fn(path, **kwargs)
        assert resp.status_code == 401, f"{method.upper()} {path} expected 401 but got {resp.status_code}"


def test_duplicate_roll_number_conflict():
    token = _token()
    headers = {"Authorization": f"Bearer {token}"}
    roll = "23IT_UNIQUE_TEST"
    payload = {
        "roll_no": roll,
        "name": "Unique Check 1",
        "batch_year": 2024,
        "email": "unique1@kongu.edu",
        "status": "student",
    }
    first = client.post("/api/students", headers=headers, json=payload)
    assert first.status_code == 201
    s_id = first.json()["id"]

    dup = client.post("/api/students", headers=headers, json={**payload, "name": "Unique Check 2"})
    assert dup.status_code == 409
    assert "already exists" in dup.json()["detail"].lower()

    client.delete(f"/api/students/{s_id}", headers=headers)


def test_projects_milestones_crud():
    token = _token()
    headers = {"Authorization": f"Bearer {token}"}

    # Project CRUD
    p_resp = client.post(
        "/api/projects",
        headers=headers,
        json={
            "title": "Autonomous Drone Fleet Mapping",
            "year": 2025,
            "category": "innovation",
            "authors": "Student A, Student B",
            "technologies": "Python, OpenCV, ROS",
            "description": "High resolution spatial mapping using decentralized drones.",
        },
    )
    assert p_resp.status_code == 201
    pid = p_resp.json()["id"]

    p_up = client.put(
        f"/api/projects/{pid}",
        headers=headers,
        json={
            "title": "Autonomous Drone Fleet Mapping v2",
            "year": 2025,
            "category": "project",
            "authors": "Student A, Student B, Dr. Guide",
            "technologies": "Python, OpenCV, ROS, GPS",
            "description": "High resolution spatial mapping using decentralized drones with GPS tagging.",
        },
    )
    assert p_up.status_code == 200
    assert p_up.json()["title"] == "Autonomous Drone Fleet Mapping v2"

    client.delete(f"/api/projects/{pid}", headers=headers)

    # Milestone CRUD
    m_resp = client.post(
        "/api/milestones",
        headers=headers,
        json={
            "year": 2026,
            "title": "National Innovation Excellence Award",
            "category": "award",
            "description": "Awarded first place among technical institutions for faculty innovations.",
        },
    )
    assert m_resp.status_code == 201
    mid = m_resp.json()["id"]

    m_up = client.put(
        f"/api/milestones/{mid}",
        headers=headers,
        json={
            "year": 2026,
            "title": "National Innovation Excellence Gold Award",
            "category": "award",
            "description": "Awarded first place gold among technical institutions for faculty innovations.",
        },
    )
    assert m_up.status_code == 200
    assert "Gold" in m_up.json()["title"]

    client.delete(f"/api/milestones/{mid}", headers=headers)


def test_faculty_labs_placements_crud():
    token = _token()
    headers = {"Authorization": f"Bearer {token}"}

    # Faculty CRUD
    f_resp = client.post(
        "/api/faculty",
        headers=headers,
        json={
            "name": "Dr. Test Professor",
            "designation": "Assistant Professor",
            "specialization": "Quantum Computing & Cryptography",
            "publications": 12,
            "experience_years": 8,
            "photo_url": "",
        },
    )
    assert f_resp.status_code == 201
    fid = f_resp.json()["id"]
    client.delete(f"/api/faculty/{fid}", headers=headers)

    # Lab CRUD
    l_resp = client.post(
        "/api/labs",
        headers=headers,
        json={"name": "Cyber Threat Simulation Lab", "description": "Dedicated isolated network environment.", "photo_url": ""},
    )
    assert l_resp.status_code == 201
    lid = l_resp.json()["id"]
    client.delete(f"/api/labs/{lid}", headers=headers)

    # Placement CRUD
    pl_resp = client.post(
        "/api/placements",
        headers=headers,
        json={"company": "Google Cloud", "job_role": "Customer Engineer", "year": 2025, "offers_count": 4, "package_lpa": 22.5},
    )
    assert pl_resp.status_code == 201
    plid = pl_resp.json()["id"]
    client.delete(f"/api/placements/{plid}", headers=headers)


def test_search_endpoint_covers_all_categories():
    res = client.get("/api/search", params={"q": "a"})
    assert res.status_code == 200
    data = res.json()
    assert "students" in data
    assert "projects" in data
    assert "milestones" in data
    assert "faculty" in data
    assert "placements" in data

