import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import * as db from "./db.js";
import { handleChatMessage } from "./ai.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.DLMS_SECRET_KEY || "dlms-local-dev-secret-change-in-production";

app.use(cors());
app.use(express.json());

// --- AUTH MIDDLEWARE (NFR-02) ---
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ detail: "Authentication required" });
  }

  const token = authHeader.slice(7).trim();
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await db.findUserByUsername(decoded.sub);
    if (!user) {
      return res.status(401).json({ detail: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ detail: "Invalid or expired token" });
  }
}

// --- API ENDPOINTS ---

// Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Auth
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(401).json({ detail: "Invalid username or password" });
    }

    const user = await db.findUserByUsername(username);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ detail: "Invalid username or password" });
    }

    const token = jwt.sign({ sub: user.username }, SECRET_KEY, { expiresIn: "8h" });
    res.json({
      access_token: token,
      token_type: "bearer",
      full_name: user.full_name,
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  const { id, username, full_name, role } = req.user;
  res.json({ id, username, full_name, role });
});

// Students & Alumni (FR-01)
app.get("/api/students", async (req, res) => {
  try {
    const students = await db.getStudents(req.query);
    res.json(students);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.get("/api/students/:id", async (req, res) => {
  try {
    const student = await db.getStudentById(req.params.id);
    if (!student) return res.status(404).json({ detail: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.post("/api/students", requireAuth, async (req, res) => {
  const data = req.body || {};
  if (!data.roll_no || !data.name || !data.batch_year || !data.email) {
    return res.status(422).json({ detail: "Missing required fields" });
  }

  try {
    const created = await db.createStudent(data);
    res.status(201).json(created);
  } catch (err) {
    if (err.status === 409) {
      return res.status(409).json({ detail: err.message });
    }
    res.status(500).json({ detail: err.message });
  }
});

app.put("/api/students/:id", requireAuth, async (req, res) => {
  try {
    const updated = await db.updateStudent(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ detail: "Student not found" });
    res.json(updated);
  } catch (err) {
    if (err.status === 409) {
      return res.status(409).json({ detail: err.message });
    }
    res.status(500).json({ detail: err.message });
  }
});

app.delete("/api/students/:id", requireAuth, async (req, res) => {
  try {
    const success = await db.deleteStudent(req.params.id);
    if (!success) return res.status(404).json({ detail: "Student not found" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Projects & Research (FR-02)
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await db.getProjects(req.query);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.post("/api/projects", requireAuth, async (req, res) => {
  try {
    const newProject = await db.createProject(req.body || {});
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.put("/api/projects/:id", requireAuth, async (req, res) => {
  try {
    const updated = await db.updateProject(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ detail: "Project not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.delete("/api/projects/:id", requireAuth, async (req, res) => {
  try {
    const success = await db.deleteProject(req.params.id);
    if (!success) return res.status(404).json({ detail: "Project not found" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Milestones (FR-03)
app.get("/api/milestones", async (req, res) => {
  try {
    const milestones = await db.getMilestones();
    res.json(milestones);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.post("/api/milestones", requireAuth, async (req, res) => {
  try {
    const created = await db.createMilestone(req.body || {});
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.put("/api/milestones/:id", requireAuth, async (req, res) => {
  try {
    const updated = await db.updateMilestone(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ detail: "Milestone not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.delete("/api/milestones/:id", requireAuth, async (req, res) => {
  try {
    const success = await db.deleteMilestone(req.params.id);
    if (!success) return res.status(404).json({ detail: "Milestone not found" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Faculty & Labs (FR-04)
app.get("/api/faculty", async (req, res) => {
  try {
    const faculty = await db.getFaculty(req.query);
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.post("/api/faculty", requireAuth, async (req, res) => {
  try {
    const created = await db.createFaculty(req.body || {});
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.put("/api/faculty/:id", requireAuth, async (req, res) => {
  try {
    const updated = await db.updateFaculty(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ detail: "Faculty not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.delete("/api/faculty/:id", requireAuth, async (req, res) => {
  try {
    const success = await db.deleteFaculty(req.params.id);
    if (!success) return res.status(404).json({ detail: "Faculty not found" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.get("/api/labs", async (req, res) => {
  try {
    const labs = await db.getLabs();
    res.json(labs);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.post("/api/labs", requireAuth, async (req, res) => {
  try {
    const created = await db.createLab(req.body || {});
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.put("/api/labs/:id", requireAuth, async (req, res) => {
  try {
    const updated = await db.updateLab(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ detail: "Lab not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.delete("/api/labs/:id", requireAuth, async (req, res) => {
  try {
    const success = await db.deleteLab(req.params.id);
    if (!success) return res.status(404).json({ detail: "Lab not found" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Placements (FR-05)
app.get("/api/placements", async (req, res) => {
  try {
    const placements = await db.getPlacements(req.query);
    res.json(placements);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.post("/api/placements", requireAuth, async (req, res) => {
  try {
    const created = await db.createPlacement(req.body || {});
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.put("/api/placements/:id", requireAuth, async (req, res) => {
  try {
    const updated = await db.updatePlacement(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ detail: "Placement not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.delete("/api/placements/:id", requireAuth, async (req, res) => {
  try {
    const success = await db.deletePlacement(req.params.id);
    if (!success) return res.status(404).json({ detail: "Placement not found" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Feedback & Inquiry (FR-06)
app.post("/api/feedback", async (req, res) => {
  const { name, email, kind, subject, message } = req.body || {};

  const errors = [];
  if (!name || name.trim().length < 2) errors.push("Name must be at least 2 characters");
  if (!email || !email.includes("@") || !email.includes(".")) errors.push("Valid email required");
  if (!["inquiry", "feedback"].includes(kind)) errors.push("Kind must be inquiry or feedback");
  if (!subject || subject.trim().length < 3) errors.push("Subject must be at least 3 characters");
  if (!message || message.trim().length < 10) errors.push("Message must be at least 10 characters");

  if (errors.length > 0) {
    return res.status(422).json({ detail: errors.join(" | ") });
  }

  try {
    const created = await db.createFeedback({ name, email, kind, subject, message });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.get("/api/feedback", requireAuth, async (req, res) => {
  try {
    const feedback = await db.getFeedback();
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Unified Search (FR-06 & NFR-01)
app.get("/api/search", async (req, res) => {
  const q = req.query.q;
  if (!q || !q.trim()) {
    return res.status(422).json({ detail: "Query parameter 'q' is required" });
  }

  try {
    const results = await db.searchAll(q);
    res.json(results);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// AI Chatbot for Department Legacy Management System
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(422).json({ detail: "Message parameter is required and cannot be empty" });
    }

    const result = await handleChatMessage(message, history);
    res.json(result);
  } catch (err) {
    console.error("[Chatbot Error]:", err);
    res.status(500).json({ detail: err.message || "Failed to process chat message" });
  }
});

// Dashboard (Staff)
app.get("/api/dashboard", requireAuth, async (req, res) => {
  try {
    const stats = await db.getDashboardStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Reports (Staff)
app.get("/api/reports", requireAuth, async (req, res) => {
  try {
    const reports = await db.getReports();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Static files from Frontend/ with PWA support
const frontendDir = path.join(__dirname, "Frontend");

// Ensure service worker is served with no-cache and unrestricted root scope
app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Service-Worker-Allowed", "/");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(frontendDir, "sw.js"));
});

// Serve Web App Manifest with correct MIME type
app.get(["/manifest.webmanifest", "/manifest.json"], (req, res) => {
  res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
  res.sendFile(path.join(frontendDir, "manifest.webmanifest"));
});

app.use(express.static(frontendDir));

// Fallback to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

// Start server and trigger initial Supabase check
const server = app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Department Legacy Management System running on http://0.0.0.0:${PORT}`);
  await db.migrateDataToSupabase().catch((err) => {
    console.warn("[DB] Background migration notice:", err.message);
  });
});

export { app, server };
