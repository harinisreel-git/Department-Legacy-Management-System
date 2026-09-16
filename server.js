import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.DLMS_SECRET_KEY || "dlms-local-dev-secret-change-in-production";

app.use(cors());
app.use(express.json());

// --- IN-MEMORY DATABASE WITH INITIAL SEED DATA ---
let nextId = {
  users: 2,
  students: 6,
  projects: 4,
  milestones: 5,
  faculty: 5,
  labs: 5,
  placements: 7,
  feedback: 2,
};

const users = [
  {
    id: 1,
    username: "admin",
    passwordHash: bcrypt.hashSync("admin123", 10),
    full_name: "Dr. R. Thangarajan",
    role: "staff",
  },
];

const students = [
  {
    id: 1,
    roll_no: "20IT001",
    name: "Aakash S",
    batch_year: 2024,
    email: "aakash.s@alumni.kongu.edu",
    phone: "9876500001",
    current_company: "Zoho Corporation",
    job_role: "Software Engineer",
    career_notes: "Working on product engineering for cloud applications.",
    status: "alumni",
  },
  {
    id: 2,
    roll_no: "20IT042",
    name: "Bhavana M",
    batch_year: 2024,
    email: "bhavana.m@alumni.kongu.edu",
    phone: "9876500002",
    current_company: "Amazon AWS",
    job_role: "Cloud Associate",
    career_notes: "Supports DevOps tooling and cloud migrations.",
    status: "alumni",
  },
  {
    id: 3,
    roll_no: "21IT089",
    name: "Dinesh Kumar K",
    batch_year: 2025,
    email: "dinesh.k@kongu.edu",
    phone: "9876500003",
    current_company: "",
    job_role: "Intern, TCS Digital",
    career_notes: "Final-year intern exploring full-stack and AI services.",
    status: "student",
  },
  {
    id: 4,
    roll_no: "21IT120",
    name: "Kavya R",
    batch_year: 2025,
    email: "kavya.r@kongu.edu",
    phone: "9876500004",
    current_company: "Kaar Technologies",
    job_role: "SAP Associate (offer)",
    career_notes: "Placed in SAP enterprise solutions.",
    status: "student",
  },
  {
    id: 5,
    roll_no: "19IT077",
    name: "Harini V",
    batch_year: 2023,
    email: "harini.v@alumni.kongu.edu",
    phone: "9876500005",
    current_company: "Accenture",
    job_role: "Security Analyst",
    career_notes: "Cybersecurity track with publications in student symposiums.",
    status: "alumni",
  },
];

const projects = [
  {
    id: 1,
    title: "Smart Campus Navigation using Indoor Mapping",
    year: 2024,
    category: "project",
    authors: "Aakash S, Bhavana M",
    technologies: "Flutter, Firebase, BLE beacons",
    description: "Capstone project that helps visitors locate labs and seminar halls across the IT block.",
  },
  {
    id: 2,
    title: "Lightweight Anomaly Detection for Campus Networks",
    year: 2023,
    category: "research",
    authors: "Harini V, Dr. P. Natesan",
    technologies: "Python, scikit-learn, packet capture",
    description: "Research paper on detecting unusual traffic patterns in departmental lab networks.",
  },
  {
    id: 3,
    title: "Accessible Feedback Kiosk for Department Guests",
    year: 2025,
    category: "innovation",
    authors: "Dinesh Kumar K, Kavya R",
    technologies: "HTML, FastAPI, SQLite",
    description: "Prototype kiosk for parents and recruiters to search alumni records and leave feedback.",
  },
];

const milestones = [
  {
    id: 1,
    year: 1998,
    title: "Department inception",
    category: "history",
    description: "B.Tech Information Technology established with an initial intake of 60 students.",
  },
  {
    id: 2,
    year: 2007,
    title: "Autonomous accreditation",
    category: "accreditation",
    description: "UGC autonomous status and NBA accreditation for curriculum quality.",
  },
  {
    id: 3,
    year: 2015,
    title: "Anna University research centre",
    category: "achievement",
    description: "Recognized as a Ph.D. research centre for AI, cloud, and security work.",
  },
  {
    id: 4,
    year: 2021,
    title: "Intake expansion and AI labs",
    category: "award",
    description: "Intake increased to 180 seats with GPU-accelerated computing facilities.",
  },
];

const faculty = [
  {
    id: 1,
    name: "Dr. R. Thangarajan",
    designation: "Professor & Head of Department",
    specialization: "Cloud computing, high performance networks, IoT",
    publications: 85,
    experience_years: 24,
    photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 2,
    name: "Dr. S. Varadhaganapathy",
    designation: "Professor",
    specialization: "Big data analytics, deep learning, AI systems",
    publications: 60,
    experience_years: 21,
    photo_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 3,
    name: "Dr. P. Natesan",
    designation: "Associate Professor",
    specialization: "Cyber security, cryptography, information security",
    publications: 45,
    experience_years: 18,
    photo_url: "https://images.unsplash.com/photo-1580894732413-a72359d99326?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 4,
    name: "Dr. K. Sangeetha",
    designation: "Associate Professor",
    specialization: "Natural language processing and data mining",
    publications: 38,
    experience_years: 16,
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  },
];

const labs = [
  {
    id: 1,
    name: "High Performance AI & Cloud Lab",
    description: "NVIDIA workstations, high-speed LAN, and dedicated cloud servers for student projects.",
    photo_url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Collaborative Software Incubator",
    description: "Open workspace for hackathons, open-source work, and student startup prototypes.",
    photo_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Smart Seminar Hall",
    description: "Department hall with dual projectors and video conferencing for guest lectures.",
    photo_url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "IT Department Library",
    description: "Reference volumes, IEEE digital access, and research journals for faculty and students.",
    photo_url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
  },
];

const placements = [
  {
    id: 1,
    company: "Zoho Corporation",
    job_role: "Software Product Engineer",
    year: 2025,
    offers_count: 24,
    package_lpa: 12.0,
  },
  {
    id: 2,
    company: "Amazon AWS",
    job_role: "Cloud Solutions Associate",
    year: 2025,
    offers_count: 6,
    package_lpa: 14.0,
  },
  {
    id: 3,
    company: "TCS Digital",
    job_role: "Full Stack Developer",
    year: 2025,
    offers_count: 42,
    package_lpa: 7.5,
  },
  {
    id: 4,
    company: "Cognizant",
    job_role: "Enterprise Software Engineer",
    year: 2024,
    offers_count: 38,
    package_lpa: 6.8,
  },
  {
    id: 5,
    company: "Kaar Technologies",
    job_role: "SAP Associate",
    year: 2024,
    offers_count: 15,
    package_lpa: 8.0,
  },
  {
    id: 6,
    company: "Accenture",
    job_role: "Cloud & Security Engineer",
    year: 2024,
    offers_count: 28,
    package_lpa: 6.5,
  },
];

const feedback = [
  {
    id: 1,
    name: "Parent Visitor",
    email: "parent@example.com",
    kind: "inquiry",
    subject: "Placement statistics for 2025",
    message: "Could you share recent recruiter roles for the IT department?",
    created_at: new Date().toISOString(),
  },
];

// --- AUTH MIDDLEWARE ---
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ detail: "Authentication required" });
  }

  const token = authHeader.slice(7).trim();
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = users.find((u) => u.username === decoded.sub);
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
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(401).json({ detail: "Invalid username or password" });
  }

  const user = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ detail: "Invalid username or password" });
  }

  const token = jwt.sign({ sub: user.username }, SECRET_KEY, { expiresIn: "8h" });
  res.json({
    access_token: token,
    token_type: "bearer",
    full_name: user.full_name,
    username: user.username,
  });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  const { id, username, full_name, role } = req.user;
  res.json({ id, username, full_name, role });
});

// Students & Alumni
app.get("/api/students", (req, res) => {
  let result = [...students];
  const { q, batch_year } = req.query;

  if (q) {
    const queryStr = q.trim().toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(queryStr) ||
        s.roll_no.toLowerCase().includes(queryStr) ||
        (s.current_company && s.current_company.toLowerCase().includes(queryStr)) ||
        (s.job_role && s.job_role.toLowerCase().includes(queryStr)) ||
        (s.career_notes && s.career_notes.toLowerCase().includes(queryStr))
    );
  }

  if (batch_year) {
    const by = parseInt(batch_year, 10);
    result = result.filter((s) => s.batch_year === by);
  }

  result.sort((a, b) => b.batch_year - a.batch_year || a.name.localeCompare(b.name));
  res.json(result);
});

app.get("/api/students/:id", (req, res) => {
  const student = students.find((s) => s.id === parseInt(req.params.id, 10));
  if (!student) return res.status(404).json({ detail: "Student not found" });
  res.json(student);
});

app.post("/api/students", requireAuth, (req, res) => {
  const data = req.body || {};
  if (!data.roll_no || !data.name || !data.batch_year || !data.email) {
    return res.status(422).json({ detail: "Missing required fields" });
  }

  const rollTrim = data.roll_no.trim();
  if (students.some((s) => s.roll_no.toLowerCase() === rollTrim.toLowerCase())) {
    return res.status(409).json({ detail: "Roll number already exists" });
  }

  const newStudent = {
    id: nextId.students++,
    roll_no: rollTrim,
    name: data.name.trim(),
    batch_year: parseInt(data.batch_year, 10),
    email: data.email.trim(),
    phone: (data.phone || "").trim(),
    current_company: (data.current_company || "").trim(),
    job_role: (data.job_role || "").trim(),
    career_notes: (data.career_notes || "").trim(),
    status: data.status === "student" ? "student" : "alumni",
  };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.put("/api/students/:id", requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const student = students.find((s) => s.id === id);
  if (!student) return res.status(404).json({ detail: "Student not found" });

  const data = req.body || {};
  const rollTrim = (data.roll_no || student.roll_no).trim();

  if (students.some((s) => s.id !== id && s.roll_no.toLowerCase() === rollTrim.toLowerCase())) {
    return res.status(409).json({ detail: "Roll number already exists" });
  }

  student.roll_no = rollTrim;
  if (data.name !== undefined) student.name = data.name.trim();
  if (data.batch_year !== undefined) student.batch_year = parseInt(data.batch_year, 10);
  if (data.email !== undefined) student.email = data.email.trim();
  if (data.phone !== undefined) student.phone = data.phone.trim();
  if (data.current_company !== undefined) student.current_company = data.current_company.trim();
  if (data.job_role !== undefined) student.job_role = data.job_role.trim();
  if (data.career_notes !== undefined) student.career_notes = data.career_notes.trim();
  if (data.status !== undefined) student.status = data.status === "student" ? "student" : "alumni";

  res.json(student);
});

app.delete("/api/students/:id", requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) return res.status(404).json({ detail: "Student not found" });
  students.splice(index, 1);
  res.status(204).send();
});

// Projects & Research
app.get("/api/projects", (req, res) => {
  let result = [...projects];
  const { q } = req.query;

  if (q) {
    const queryStr = q.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(queryStr) ||
        p.authors.toLowerCase().includes(queryStr) ||
        (p.technologies && p.technologies.toLowerCase().includes(queryStr)) ||
        p.description.toLowerCase().includes(queryStr)
    );
  }

  result.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  res.json(result);
});

app.post("/api/projects", requireAuth, (req, res) => {
  const data = req.body || {};
  const newProject = {
    id: nextId.projects++,
    title: (data.title || "").trim(),
    year: parseInt(data.year, 10) || new Date().getFullYear(),
    category: data.category || "project",
    authors: (data.authors || "").trim(),
    technologies: (data.technologies || "").trim(),
    description: (data.description || "").trim(),
  };
  projects.push(newProject);
  res.status(201).json(newProject);
});

app.put("/api/projects/:id", requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = projects.find((p) => p.id === id);
  if (!item) return res.status(404).json({ detail: "Project not found" });

  const data = req.body || {};
  if (data.title !== undefined) item.title = data.title.trim();
  if (data.year !== undefined) item.year = parseInt(data.year, 10);
  if (data.category !== undefined) item.category = data.category;
  if (data.authors !== undefined) item.authors = data.authors.trim();
  if (data.technologies !== undefined) item.technologies = data.technologies.trim();
  if (data.description !== undefined) item.description = data.description.trim();

  res.json(item);
});

app.delete("/api/projects/:id", requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ detail: "Project not found" });
  projects.splice(index, 1);
  res.status(204).send();
});

// Milestones
app.get("/api/milestones", (req, res) => {
  const result = [...milestones].sort((a, b) => a.year - b.year);
  res.json(result);
});

app.post("/api/milestones", requireAuth, (req, res) => {
  const data = req.body || {};
  const newMilestone = {
    id: nextId.milestones++,
    year: parseInt(data.year, 10) || new Date().getFullYear(),
    title: (data.title || "").trim(),
    category: data.category || "history",
    description: (data.description || "").trim(),
  };
  milestones.push(newMilestone);
  res.status(201).json(newMilestone);
});

app.put("/api/milestones/:id", requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = milestones.find((m) => m.id === id);
  if (!item) return res.status(404).json({ detail: "Milestone not found" });

  const data = req.body || {};
  if (data.year !== undefined) item.year = parseInt(data.year, 10);
  if (data.title !== undefined) item.title = data.title.trim();
  if (data.category !== undefined) item.category = data.category;
  if (data.description !== undefined) item.description = data.description.trim();

  res.json(item);
});

app.delete("/api/milestones/:id", requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = milestones.findIndex((m) => m.id === id);
  if (index === -1) return res.status(404).json({ detail: "Milestone not found" });
  milestones.splice(index, 1);
  res.status(204).send();
});

// Faculty
app.get("/api/faculty", (req, res) => {
  let result = [...faculty];
  const { q } = req.query;

  if (q) {
    const queryStr = q.trim().toLowerCase();
    result = result.filter(
      (f) =>
        f.name.toLowerCase().includes(queryStr) ||
        f.specialization.toLowerCase().includes(queryStr) ||
        f.designation.toLowerCase().includes(queryStr)
    );
  }

  result.sort((a, b) => a.name.localeCompare(b.name));
  res.json(result);
});

app.post("/api/faculty", requireAuth, (req, res) => {
  const data = req.body || {};
  const newFaculty = {
    id: nextId.faculty++,
    name: (data.name || "").trim(),
    designation: (data.designation || "").trim(),
    specialization: (data.specialization || "").trim(),
    publications: parseInt(data.publications, 10) || 0,
    experience_years: parseInt(data.experience_years, 10) || 0,
    photo_url: (data.photo_url || "").trim(),
  };
  faculty.push(newFaculty);
  res.status(201).json(newFaculty);
});

app.put("/api/faculty/:id", requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = faculty.find((f) => f.id === id);
  if (!item) return res.status(404).json({ detail: "Faculty not found" });

  const data = req.body || {};
  if (data.name !== undefined) item.name = data.name.trim();
  if (data.designation !== undefined) item.designation = data.designation.trim();
  if (data.specialization !== undefined) item.specialization = data.specialization.trim();
  if (data.publications !== undefined) item.publications = parseInt(data.publications, 10) || 0;
  if (data.experience_years !== undefined) item.experience_years = parseInt(data.experience_years, 10) || 0;
  if (data.photo_url !== undefined) item.photo_url = data.photo_url.trim();

  res.json(item);
});

app.delete("/api/faculty/:id", requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = faculty.findIndex((f) => f.id === id);
  if (index === -1) return res.status(404).json({ detail: "Faculty not found" });
  faculty.splice(index, 1);
  res.status(204).send();
});

// Labs
app.get("/api/labs", (req, res) => {
  const result = [...labs].sort((a, b) => a.name.localeCompare(b.name));
  res.json(result);
});

app.post("/api/labs", requireAuth, (req, res) => {
  const data = req.body || {};
  const newLab = {
    id: nextId.labs++,
    name: (data.name || "").trim(),
    description: (data.description || "").trim(),
    photo_url: (data.photo_url || "").trim(),
  };
  labs.push(newLab);
  res.status(201).json(newLab);
});

app.put("/api/labs/:id", requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = labs.find((l) => l.id === id);
  if (!item) return res.status(404).json({ detail: "Lab not found" });

  const data = req.body || {};
  if (data.name !== undefined) item.name = data.name.trim();
  if (data.description !== undefined) item.description = data.description.trim();
  if (data.photo_url !== undefined) item.photo_url = data.photo_url.trim();

  res.json(item);
});

app.delete("/api/labs/:id", requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = labs.findIndex((l) => l.id === id);
  if (index === -1) return res.status(404).json({ detail: "Lab not found" });
  labs.splice(index, 1);
  res.status(204).send();
});

// Placements
app.get("/api/placements", (req, res) => {
  let result = [...placements];
  const { q } = req.query;

  if (q) {
    const queryStr = q.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.company.toLowerCase().includes(queryStr) ||
        p.job_role.toLowerCase().includes(queryStr)
    );
  }

  result.sort((a, b) => b.year - a.year || b.package_lpa - a.package_lpa);
  res.json(result);
});

app.post("/api/placements", requireAuth, (req, res) => {
  const data = req.body || {};
  const newPlacement = {
    id: nextId.placements++,
    company: (data.company || "").trim(),
    job_role: (data.job_role || "").trim(),
    year: parseInt(data.year, 10) || new Date().getFullYear(),
    offers_count: parseInt(data.offers_count, 10) || 0,
    package_lpa: parseFloat(data.package_lpa) || 0.0,
  };
  placements.push(newPlacement);
  res.status(201).json(newPlacement);
});

app.put("/api/placements/:id", requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = placements.find((p) => p.id === id);
  if (!item) return res.status(404).json({ detail: "Placement not found" });

  const data = req.body || {};
  if (data.company !== undefined) item.company = data.company.trim();
  if (data.job_role !== undefined) item.job_role = data.job_role.trim();
  if (data.year !== undefined) item.year = parseInt(data.year, 10);
  if (data.offers_count !== undefined) item.offers_count = parseInt(data.offers_count, 10) || 0;
  if (data.package_lpa !== undefined) item.package_lpa = parseFloat(data.package_lpa) || 0.0;

  res.json(item);
});

app.delete("/api/placements/:id", requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = placements.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ detail: "Placement not found" });
  placements.splice(index, 1);
  res.status(204).send();
});

// Feedback & Inquiry
app.post("/api/feedback", (req, res) => {
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

  const item = {
    id: nextId.feedback++,
    name: name.trim(),
    email: email.trim(),
    kind,
    subject: subject.trim(),
    message: message.trim(),
    created_at: new Date().toISOString(),
  };
  feedback.push(item);
  res.status(201).json(item);
});

app.get("/api/feedback", requireAuth, (req, res) => {
  const result = [...feedback].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(result);
});

// Unified Search
app.get("/api/search", (req, res) => {
  const q = req.query.q;
  if (!q || !q.trim()) {
    return res.status(422).json({ detail: "Query parameter 'q' is required" });
  }

  const term = q.trim().toLowerCase();

  const searchStudents = students
    .filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.roll_no.toLowerCase().includes(term) ||
        (s.current_company && s.current_company.toLowerCase().includes(term)) ||
        (s.job_role && s.job_role.toLowerCase().includes(term)) ||
        (s.career_notes && s.career_notes.toLowerCase().includes(term))
    )
    .slice(0, 20);

  const searchProjects = projects
    .filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.authors.toLowerCase().includes(term) ||
        (p.technologies && p.technologies.toLowerCase().includes(term)) ||
        p.description.toLowerCase().includes(term)
    )
    .slice(0, 20);

  const searchMilestones = milestones
    .filter(
      (m) =>
        m.title.toLowerCase().includes(term) ||
        m.description.toLowerCase().includes(term) ||
        m.category.toLowerCase().includes(term)
    )
    .slice(0, 20);

  const searchFaculty = faculty
    .filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        f.specialization.toLowerCase().includes(term) ||
        f.designation.toLowerCase().includes(term)
    )
    .slice(0, 20);

  const searchPlacements = placements
    .filter(
      (p) =>
        p.company.toLowerCase().includes(term) ||
        p.job_role.toLowerCase().includes(term)
    )
    .slice(0, 20);

  res.json({
    students: searchStudents,
    projects: searchProjects,
    milestones: searchMilestones,
    faculty: searchFaculty,
    placements: searchPlacements,
  });
});

// Dashboard
app.get("/api/dashboard", requireAuth, (req, res) => {
  const totalOffers = placements.reduce((sum, p) => sum + (p.offers_count || 0), 0);
  const highestPackage = placements.reduce((max, p) => Math.max(max, p.package_lpa || 0), 0.0);

  const recentStudents = [...students].sort((a, b) => b.id - a.id).slice(0, 5);
  const recentFeedback = [...feedback].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  res.json({
    students: students.length,
    alumni: students.filter((s) => s.status === "alumni").length,
    projects: projects.length,
    milestones: milestones.length,
    faculty: faculty.length,
    labs: labs.length,
    placements: placements.length,
    feedback: feedback.length,
    total_offers: totalOffers,
    highest_package: highestPackage,
    recent_students: recentStudents,
    recent_feedback: recentFeedback,
  });
});

// Reports
app.get("/api/reports", requireAuth, (req, res) => {
  // Placement by year
  const placementYearMap = new Map();
  placements.forEach((p) => {
    if (!placementYearMap.has(p.year)) {
      placementYearMap.set(p.year, []);
    }
    placementYearMap.get(p.year).push(p);
  });

  const placements_by_year = Array.from(placementYearMap.entries())
    .map(([year, items]) => {
      const companies = items.length;
      const offers = items.reduce((sum, item) => sum + (item.offers_count || 0), 0);
      const highest_package = items.reduce((max, item) => Math.max(max, item.package_lpa || 0), 0);
      const avg = items.reduce((sum, item) => sum + (item.package_lpa || 0), 0) / (items.length || 1);
      return {
        year,
        companies,
        offers,
        highest_package,
        average_package: parseFloat(avg.toFixed(2)),
      };
    })
    .sort((a, b) => b.year - a.year);

  // Students by batch
  const studentBatchMap = new Map();
  students.forEach((s) => {
    if (!studentBatchMap.has(s.batch_year)) {
      studentBatchMap.set(s.batch_year, []);
    }
    studentBatchMap.get(s.batch_year).push(s);
  });

  const students_by_batch = Array.from(studentBatchMap.entries())
    .map(([batch_year, items]) => {
      const total = items.length;
      const alumni = items.filter((item) => item.status === "alumni").length;
      const studentCount = items.filter((item) => item.status === "student").length;
      return {
        batch_year,
        total,
        alumni,
        students: studentCount,
      };
    })
    .sort((a, b) => b.batch_year - a.batch_year);

  // Top recruiters
  const top_recruiters = [...placements]
    .sort((a, b) => b.package_lpa - a.package_lpa || b.offers_count - a.offers_count)
    .slice(0, 8);

  res.json({
    placements_by_year,
    students_by_batch,
    top_recruiters,
  });
});

// Static files from Frontend/
const frontendDir = path.join(__dirname, "Frontend");
app.use(express.static(frontendDir));

// Fallback to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Department Legacy Management System running on http://0.0.0.0:${PORT}`);
});
