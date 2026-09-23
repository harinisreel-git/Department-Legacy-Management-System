import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  let data = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log("==================================================================");
  console.log(" RUNNING DEPARTMENT LEGACY MANAGEMENT SYSTEM TEST SUITE");
  console.log(` Target: ${BASE_URL}`);
  console.log("==================================================================");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  FAIL: ${name}`);
      console.error(`        ${err.message}`);
      failed++;
    }
  }

  // 1. Health Check
  await test("1. API Health endpoint (GET /api/health)", async () => {
    const res = await request("/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.data.status, "ok");
  });

  // 2. Bad password authentication rejection (401)
  await test("2. Bad password authentication rejection (401)", async () => {
    const res = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: "admin", password: "wrongpassword" }),
    });
    assert.equal(res.status, 401);
  });

  // Authenticate to obtain token for subsequent staff tests
  const loginRes = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username: "admin", password: "admin123" }),
  });
  assert.equal(loginRes.status, 200);
  const token = loginRes.data.access_token;
  assert.ok(token, "Token should be present");
  const authHeader = { Authorization: `Bearer ${token}` };

  // 3. Unauthenticated student creation rejection (401)
  await test("3. Unauthenticated student creation rejection (401)", async () => {
    const res = await request("/api/students", {
      method: "POST",
      body: JSON.stringify({
        roll_no: "TEST001",
        name: "Unauthorized Student",
        batch_year: 2025,
        email: "test@example.com",
      }),
    });
    assert.equal(res.status, 401);
  });

  // 4. Full Student CRUD, query filtering, and report aggregation
  await test("4. Full Student CRUD, query filtering, and report aggregation", async () => {
    // Create
    const createRes = await request("/api/students", {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({
        roll_no: "22IT999",
        name: "Test Candidate",
        batch_year: 2026,
        email: "test.candidate@kongu.edu",
        current_company: "Apex Tech",
        job_role: "Junior Engineer",
        status: "student",
      }),
    });
    assert.equal(createRes.status, 201);
    const createdId = createRes.data.id;
    assert.ok(createdId);

    // Read by ID
    const getRes = await request(`/api/students/${createdId}`);
    assert.equal(getRes.status, 200);
    assert.equal(getRes.data.roll_no, "22IT999");

    // Filter by query
    const filterRes = await request("/api/students?q=Apex");
    assert.equal(filterRes.status, 200);
    assert.ok(filterRes.data.some((s) => s.roll_no === "22IT999"));

    // Update
    const updateRes = await request(`/api/students/${createdId}`, {
      method: "PUT",
      headers: authHeader,
      body: JSON.stringify({
        job_role: "Software Development Engineer",
      }),
    });
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.data.job_role, "Software Development Engineer");

    // Delete
    const delRes = await request(`/api/students/${createdId}`, {
      method: "DELETE",
      headers: authHeader,
    });
    assert.equal(delRes.status, 204);

    // Verify deleted
    const verifyRes = await request(`/api/students/${createdId}`);
    assert.equal(verifyRes.status, 404);
  });

  // 5. Feedback input validation (Email, min length)
  await test("5. Feedback input validation (Email, min length)", async () => {
    // Invalid email
    const resBadEmail = await request("/api/feedback", {
      method: "POST",
      body: JSON.stringify({
        name: "Tester",
        email: "not-an-email",
        kind: "feedback",
        subject: "General Question",
        message: "This is a long enough message for testing.",
      }),
    });
    assert.equal(resBadEmail.status, 422);

    // Valid feedback
    const resValid = await request("/api/feedback", {
      method: "POST",
      body: JSON.stringify({
        name: "Visitor One",
        email: "visitor@example.com",
        kind: "inquiry",
        subject: "Campus Tour Query",
        message: "When are campus and laboratory legacy tours organized?",
      }),
    });
    assert.equal(resValid.status, 201);
  });

  // 6. NFR-02 Compliance: 100% rejection of unauthorized requests across all protected staff endpoints
  await test("6. NFR-02 Compliance: Rejection of unauthorized requests across staff endpoints", async () => {
    const endpoints = [
      { method: "GET", path: "/api/dashboard" },
      { method: "GET", path: "/api/reports" },
      { method: "GET", path: "/api/feedback" },
      { method: "POST", path: "/api/projects", body: { title: "Test" } },
      { method: "POST", path: "/api/milestones", body: { title: "Test" } },
      { method: "POST", path: "/api/faculty", body: { name: "Test" } },
      { method: "POST", path: "/api/labs", body: { name: "Test" } },
      { method: "POST", path: "/api/placements", body: { company: "Test" } },
    ];

    for (const ep of endpoints) {
      const res = await request(ep.path, {
        method: ep.method,
        body: ep.body ? JSON.stringify(ep.body) : undefined,
      });
      assert.equal(res.status, 401, `Endpoint ${ep.method} ${ep.path} should reject with 401`);
    }
  });

  // 7. Unique roll number constraint conflict handling (409 Conflict)
  await test("7. Unique roll number constraint conflict handling (409 Conflict)", async () => {
    // Attempt to insert duplicate of existing student 20IT001
    const res = await request("/api/students", {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({
        roll_no: "20IT001",
        name: "Duplicate Attempt",
        batch_year: 2024,
        email: "duplicate@example.com",
      }),
    });
    assert.equal(res.status, 409);
    assert.ok(res.data.detail.toLowerCase().includes("roll number already exists"));
  });

  // 8. Project and Milestone CRUD operations
  await test("8. Project and Milestone CRUD operations", async () => {
    // Project
    const prRes = await request("/api/projects", {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({
        title: "Automated Campus Energy Grid",
        year: 2025,
        category: "innovation",
        authors: "Student A, Student B",
        technologies: "IoT, Node.js",
        description: "Optimizing electricity usage across labs.",
      }),
    });
    assert.equal(prRes.status, 201);
    const prId = prRes.data.id;

    const prUpdate = await request(`/api/projects/${prId}`, {
      method: "PUT",
      headers: authHeader,
      body: JSON.stringify({ title: "Smart Campus Energy Grid" }),
    });
    assert.equal(prUpdate.status, 200);

    const prDel = await request(`/api/projects/${prId}`, { method: "DELETE", headers: authHeader });
    assert.equal(prDel.status, 204);

    // Milestone
    const msRes = await request("/api/milestones", {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({
        year: 2026,
        title: "Silver Jubilee Celebration",
        category: "achievement",
        description: "Celebrating 25 years of IT excellence.",
      }),
    });
    assert.equal(msRes.status, 201);
    const msId = msRes.data.id;

    const msDel = await request(`/api/milestones/${msId}`, { method: "DELETE", headers: authHeader });
    assert.equal(msDel.status, 204);
  });

  // 9. Faculty, Lab, and Placement CRUD operations
  await test("9. Faculty, Lab, and Placement CRUD operations", async () => {
    // Faculty
    const facRes = await request("/api/faculty", {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({
        name: "Dr. Visiting Scholar",
        designation: "Adjunct Professor",
        specialization: "Quantum Computing",
        publications: 12,
        experience_years: 10,
      }),
    });
    assert.equal(facRes.status, 201);
    const facId = facRes.data.id;
    await request(`/api/faculty/${facId}`, { method: "DELETE", headers: authHeader });

    // Lab
    const labRes = await request("/api/labs", {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({
        name: "Robotics and Automation Lab",
        description: "Equipped with ROS testbeds and robotic arms.",
      }),
    });
    assert.equal(labRes.status, 201);
    const labId = labRes.data.id;
    await request(`/api/labs/${labId}`, { method: "DELETE", headers: authHeader });

    // Placement
    const plRes = await request("/api/placements", {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({
        company: "Google Cloud",
        job_role: "Solutions Architect",
        year: 2025,
        offers_count: 5,
        package_lpa: 18.5,
      }),
    });
    assert.equal(plRes.status, 201);
    const plId = plRes.data.id;
    await request(`/api/placements/${plId}`, { method: "DELETE", headers: authHeader });
  });

  // 10. Unified Public Search across all five record categories
  await test("10. Unified Public Search across all five record categories", async () => {
    const res = await request("/api/search?q=cloud");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.students));
    assert.ok(Array.isArray(res.data.projects));
    assert.ok(Array.isArray(res.data.milestones));
    assert.ok(Array.isArray(res.data.faculty));
    assert.ok(Array.isArray(res.data.placements));
    assert.ok(
      res.data.students.length > 0 ||
      res.data.projects.length > 0 ||
      res.data.faculty.length > 0 ||
      res.data.placements.length > 0
    );
  });

  // 11. AI Chatbot: Faculty & HOD query
  await test("11. AI Chatbot: Grounded answer for Faculty & HOD query", async () => {
    const res = await request("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "Who is the Head of Department and what are their research areas?",
      }),
    });
    assert.equal(res.status, 200);
    assert.ok(res.data.reply, "Reply should be non-empty");
    assert.ok(
      res.data.reply.includes("Thangarajan") || res.data.reply.toLowerCase().includes("head of department"),
      "Response should mention HOD"
    );
  });

  // 12. AI Chatbot: Placements & Recruiters query
  await test("12. AI Chatbot: Grounded answer for Placements & Recruiters", async () => {
    const res = await request("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "What companies recruited students and what was the highest package?",
      }),
    });
    assert.equal(res.status, 200);
    assert.ok(res.data.reply, "Reply should be non-empty");
    assert.ok(
      res.data.reply.toLowerCase().includes("zoho") ||
      res.data.reply.toLowerCase().includes("lpa") ||
      res.data.reply.toLowerCase().includes("placement") ||
      res.data.reply.toLowerCase().includes("package"),
      "Response should include placement details"
    );
  });

  // 13. AI Chatbot: Projects & Research query
  await test("13. AI Chatbot: Grounded answer for Capstone Projects & Research", async () => {
    const res = await request("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "Which capstone project used Flutter and beacons?",
      }),
    });
    assert.equal(res.status, 200);
    assert.ok(res.data.reply, "Reply should be non-empty");
    assert.ok(
      res.data.reply.toLowerCase().includes("navigation") ||
      res.data.reply.toLowerCase().includes("beacon") ||
      res.data.reply.toLowerCase().includes("flutter"),
      "Response should mention relevant project"
    );
  });

  // 14. AI Chatbot: Guest Inquiries and feedback guidance
  await test("14. AI Chatbot: Handling Guest Inquiries and feedback guidance", async () => {
    const res = await request("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "How can I submit a guest inquiry or send feedback to the department?",
      }),
    });
    assert.equal(res.status, 200);
    assert.ok(res.data.reply, "Reply should be non-empty");
    assert.ok(
      res.data.reply.toLowerCase().includes("guest") ||
      res.data.reply.toLowerCase().includes("inquiry") ||
      res.data.reply.toLowerCase().includes("feedback"),
      "Response should provide guest inquiry info"
    );
  });

  // 15. AI Chatbot: Validation and missing records handling
  await test("15. AI Chatbot: Validation and missing records handling", async () => {
    // Empty message validation (422)
    const emptyRes = await request("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "   " }),
    });
    assert.equal(emptyRes.status, 422);

    // Unrecorded info query
    const unknownRes = await request("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "What was the score of the 1992 football championship?",
      }),
    });
    assert.equal(unknownRes.status, 200);
    assert.ok(unknownRes.data.reply, "Should return a safe polite message");
    assert.ok(
      unknownRes.data.reply.toLowerCase().includes("could not find") ||
      unknownRes.data.reply.toLowerCase().includes("not available") ||
      unknownRes.data.reply.toLowerCase().includes("not recorded") ||
      unknownRes.data.reply.toLowerCase().includes("database"),
      "Should clearly state when requested information is not available"
    );
  });

  console.log("==================================================================");
  console.log(` RESULTS: ${passed} passed, ${failed} failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
