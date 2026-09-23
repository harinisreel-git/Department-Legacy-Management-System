import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

// Supabase client instance (lazy initialized from environment variables)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

export let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log("[DB] Supabase client initialized with URL:", supabaseUrl);
  } catch (err) {
    console.error("[DB] Failed to initialize Supabase client:", err.message);
  }
}

// In-memory fallback dataset (exact original seed data)
const memoryData = {
  users: [
    {
      id: 1,
      username: "admin",
      password_hash: bcrypt.hashSync("admin123", 10),
      full_name: "Dr. R. Thangarajan",
      role: "staff",
    },
  ],
  students: [
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
  ],
  projects: [
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
  ],
  milestones: [
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
  ],
  faculty: [
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
  ],
  labs: [
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
  ],
  placements: [
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
  ],
  feedback: [
    {
      id: 1,
      name: "Parent Visitor",
      email: "parent@example.com",
      kind: "inquiry",
      subject: "Placement statistics for 2025",
      message: "Could you share recent recruiter roles for the IT department?",
      created_at: new Date().toISOString(),
    },
  ],
};

let memoryNextId = {
  users: 2,
  students: 6,
  projects: 4,
  milestones: 5,
  faculty: 5,
  labs: 5,
  placements: 7,
  feedback: 2,
};

// Automatic data migration to Supabase when connected
export async function migrateDataToSupabase() {
  if (!supabase) return;
  try {
    // Check if students already exist in Supabase
    const { data: existingStudents, error } = await supabase
      .from("students")
      .select("id")
      .limit(1);

    if (error) {
      console.warn("[DB] Supabase query check warning:", error.message);
      return;
    }

    // If table is empty, seed it with the legacy data
    if (!existingStudents || existingStudents.length === 0) {
      console.log("[DB] Migrating initial legacy records to Supabase...");
      await supabase.from("users").upsert(memoryData.users, { onConflict: "username" });
      await supabase.from("students").upsert(memoryData.students, { onConflict: "roll_no" });
      await supabase.from("projects").upsert(memoryData.projects, { onConflict: "id" });
      await supabase.from("milestones").upsert(memoryData.milestones, { onConflict: "id" });
      await supabase.from("faculty").upsert(memoryData.faculty, { onConflict: "id" });
      await supabase.from("labs").upsert(memoryData.labs, { onConflict: "id" });
      await supabase.from("placements").upsert(memoryData.placements, { onConflict: "id" });
      await supabase.from("feedback").upsert(memoryData.feedback, { onConflict: "id" });
      console.log("[DB] Successfully migrated initial records to Supabase.");
    }
  } catch (err) {
    console.warn("[DB] Supabase automatic seed notice:", err.message);
  }
}

// ----------------------------------------------------------------------------
// USERS & AUTH
// ----------------------------------------------------------------------------
export async function findUserByUsername(username) {
  const cleanUsername = username.trim().toLowerCase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .ilike("username", cleanUsername)
        .maybeSingle();
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase findUser fallback:", err.message);
    }
  }
  return memoryData.users.find((u) => u.username.toLowerCase() === cleanUsername) || null;
}

// ----------------------------------------------------------------------------
// STUDENTS (FR-01)
// ----------------------------------------------------------------------------
export async function getStudents({ q, batch_year } = {}) {
  if (supabase) {
    try {
      let query = supabase.from("students").select("*");
      if (batch_year) {
        query = query.eq("batch_year", parseInt(batch_year, 10));
      }
      if (q) {
        const term = q.trim();
        query = query.or(
          `name.ilike.%${term}%,roll_no.ilike.%${term}%,current_company.ilike.%${term}%,job_role.ilike.%${term}%,career_notes.ilike.%${term}%`
        );
      }
      query = query.order("batch_year", { ascending: false }).order("name", { ascending: true });
      const { data, error } = await query;
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase getStudents fallback:", err.message);
    }
  }

  // Memory fallback
  let result = [...memoryData.students];
  if (q) {
    const term = q.trim().toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.roll_no.toLowerCase().includes(term) ||
        (s.current_company && s.current_company.toLowerCase().includes(term)) ||
        (s.job_role && s.job_role.toLowerCase().includes(term)) ||
        (s.career_notes && s.career_notes.toLowerCase().includes(term))
    );
  }
  if (batch_year) {
    const by = parseInt(batch_year, 10);
    result = result.filter((s) => s.batch_year === by);
  }
  return result.sort((a, b) => b.batch_year - a.batch_year || a.name.localeCompare(b.name));
}

export async function getStudentById(id) {
  const numId = parseInt(id, 10);
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", numId)
        .maybeSingle();
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase getStudentById fallback:", err.message);
    }
  }
  return memoryData.students.find((s) => s.id === numId) || null;
}

export async function createStudent(payload) {
  const rollTrim = payload.roll_no.trim();

  // Check unique roll_no
  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from("students")
        .select("id")
        .ilike("roll_no", rollTrim)
        .maybeSingle();
      if (existing) {
        const error = new Error("Roll number already exists");
        error.status = 409;
        throw error;
      }

      const { data, error } = await supabase
        .from("students")
        .insert({
          roll_no: rollTrim,
          name: payload.name.trim(),
          batch_year: parseInt(payload.batch_year, 10),
          email: payload.email.trim(),
          phone: (payload.phone || "").trim(),
          current_company: (payload.current_company || "").trim(),
          job_role: (payload.job_role || "").trim(),
          career_notes: (payload.career_notes || "").trim(),
          status: payload.status === "student" ? "student" : "alumni",
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          const err = new Error("Roll number already exists");
          err.status = 409;
          throw err;
        }
        throw error;
      }
      return data;
    } catch (err) {
      if (err.status === 409) throw err;
      console.warn("[DB] Supabase createStudent fallback:", err.message);
    }
  }

  // Memory fallback
  if (memoryData.students.some((s) => s.roll_no.toLowerCase() === rollTrim.toLowerCase())) {
    const error = new Error("Roll number already exists");
    error.status = 409;
    throw error;
  }

  const newStudent = {
    id: memoryNextId.students++,
    roll_no: rollTrim,
    name: payload.name.trim(),
    batch_year: parseInt(payload.batch_year, 10),
    email: payload.email.trim(),
    phone: (payload.phone || "").trim(),
    current_company: (payload.current_company || "").trim(),
    job_role: (payload.job_role || "").trim(),
    career_notes: (payload.career_notes || "").trim(),
    status: payload.status === "student" ? "student" : "alumni",
  };
  memoryData.students.push(newStudent);
  return newStudent;
}

export async function updateStudent(id, payload) {
  const numId = parseInt(id, 10);
  if (supabase) {
    try {
      const updateData = {};
      if (payload.roll_no !== undefined) updateData.roll_no = payload.roll_no.trim();
      if (payload.name !== undefined) updateData.name = payload.name.trim();
      if (payload.batch_year !== undefined) updateData.batch_year = parseInt(payload.batch_year, 10);
      if (payload.email !== undefined) updateData.email = payload.email.trim();
      if (payload.phone !== undefined) updateData.phone = payload.phone.trim();
      if (payload.current_company !== undefined) updateData.current_company = payload.current_company.trim();
      if (payload.job_role !== undefined) updateData.job_role = payload.job_role.trim();
      if (payload.career_notes !== undefined) updateData.career_notes = payload.career_notes.trim();
      if (payload.status !== undefined) updateData.status = payload.status === "student" ? "student" : "alumni";

      // Check conflict if roll_no is changing
      if (updateData.roll_no) {
        const { data: conflict } = await supabase
          .from("students")
          .select("id")
          .ilike("roll_no", updateData.roll_no)
          .neq("id", numId)
          .maybeSingle();
        if (conflict) {
          const err = new Error("Roll number already exists");
          err.status = 409;
          throw err;
        }
      }

      const { data, error } = await supabase
        .from("students")
        .update(updateData)
        .eq("id", numId)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          const err = new Error("Roll number already exists");
          err.status = 409;
          throw err;
        }
        throw error;
      }
      return data;
    } catch (err) {
      if (err.status === 409) throw err;
      console.warn("[DB] Supabase updateStudent fallback:", err.message);
    }
  }

  // Memory fallback
  const student = memoryData.students.find((s) => s.id === numId);
  if (!student) return null;

  const rollTrim = payload.roll_no ? payload.roll_no.trim() : student.roll_no;
  if (memoryData.students.some((s) => s.id !== numId && s.roll_no.toLowerCase() === rollTrim.toLowerCase())) {
    const err = new Error("Roll number already exists");
    err.status = 409;
    throw err;
  }

  student.roll_no = rollTrim;
  if (payload.name !== undefined) student.name = payload.name.trim();
  if (payload.batch_year !== undefined) student.batch_year = parseInt(payload.batch_year, 10);
  if (payload.email !== undefined) student.email = payload.email.trim();
  if (payload.phone !== undefined) student.phone = payload.phone.trim();
  if (payload.current_company !== undefined) student.current_company = payload.current_company.trim();
  if (payload.job_role !== undefined) student.job_role = payload.job_role.trim();
  if (payload.career_notes !== undefined) student.career_notes = payload.career_notes.trim();
  if (payload.status !== undefined) student.status = payload.status === "student" ? "student" : "alumni";

  return student;
}

export async function deleteStudent(id) {
  const numId = parseInt(id, 10);
  if (supabase) {
    try {
      const { error } = await supabase.from("students").delete().eq("id", numId);
      if (!error) return true;
    } catch (err) {
      console.warn("[DB] Supabase deleteStudent fallback:", err.message);
    }
  }

  const idx = memoryData.students.findIndex((s) => s.id === numId);
  if (idx === -1) return false;
  memoryData.students.splice(idx, 1);
  return true;
}

// ----------------------------------------------------------------------------
// PROJECTS (FR-02)
// ----------------------------------------------------------------------------
export async function getProjects({ q } = {}) {
  if (supabase) {
    try {
      let query = supabase.from("projects").select("*");
      if (q) {
        const term = q.trim();
        query = query.or(
          `title.ilike.%${term}%,authors.ilike.%${term}%,technologies.ilike.%${term}%,description.ilike.%${term}%`
        );
      }
      query = query.order("year", { ascending: false }).order("title", { ascending: true });
      const { data, error } = await query;
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase getProjects fallback:", err.message);
    }
  }

  let result = [...memoryData.projects];
  if (q) {
    const term = q.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.authors.toLowerCase().includes(term) ||
        (p.technologies && p.technologies.toLowerCase().includes(term)) ||
        p.description.toLowerCase().includes(term)
    );
  }
  return result.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}

export async function createProject(payload) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          title: (payload.title || "").trim(),
          year: parseInt(payload.year, 10) || new Date().getFullYear(),
          category: payload.category || "project",
          authors: (payload.authors || "").trim(),
          technologies: (payload.technologies || "").trim(),
          description: (payload.description || "").trim(),
        })
        .select()
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase createProject fallback:", err.message);
    }
  }

  const newProject = {
    id: memoryNextId.projects++,
    title: (payload.title || "").trim(),
    year: parseInt(payload.year, 10) || new Date().getFullYear(),
    category: payload.category || "project",
    authors: (payload.authors || "").trim(),
    technologies: (payload.technologies || "").trim(),
    description: (payload.description || "").trim(),
  };
  memoryData.projects.push(newProject);
  return newProject;
}

export async function updateProject(id, payload) {
  const numId = parseInt(id, 10);
  if (supabase) {
    try {
      const updateData = {};
      if (payload.title !== undefined) updateData.title = payload.title.trim();
      if (payload.year !== undefined) updateData.year = parseInt(payload.year, 10);
      if (payload.category !== undefined) updateData.category = payload.category;
      if (payload.authors !== undefined) updateData.authors = payload.authors.trim();
      if (payload.technologies !== undefined) updateData.technologies = payload.technologies.trim();
      if (payload.description !== undefined) updateData.description = payload.description.trim();

      const { data, error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", numId)
        .select()
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase updateProject fallback:", err.message);
    }
  }

  const item = memoryData.projects.find((p) => p.id === numId);
  if (!item) return null;
  if (payload.title !== undefined) item.title = payload.title.trim();
  if (payload.year !== undefined) item.year = parseInt(payload.year, 10);
  if (payload.category !== undefined) item.category = payload.category;
  if (payload.authors !== undefined) item.authors = payload.authors.trim();
  if (payload.technologies !== undefined) item.technologies = payload.technologies.trim();
  if (payload.description !== undefined) item.description = payload.description.trim();
  return item;
}

export async function deleteProject(id) {
  const numId = parseInt(id, 10);
  if (supabase) {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", numId);
      if (!error) return true;
    } catch (err) {
      console.warn("[DB] Supabase deleteProject fallback:", err.message);
    }
  }

  const idx = memoryData.projects.findIndex((p) => p.id === numId);
  if (idx === -1) return false;
  memoryData.projects.splice(idx, 1);
  return true;
}

// ----------------------------------------------------------------------------
// MILESTONES (FR-03)
// ----------------------------------------------------------------------------
export async function getMilestones() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .order("year", { ascending: true });
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase getMilestones fallback:", err.message);
    }
  }
  return [...memoryData.milestones].sort((a, b) => a.year - b.year);
}

export async function createMilestone(payload) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("milestones")
        .insert({
          year: parseInt(payload.year, 10) || new Date().getFullYear(),
          title: (payload.title || "").trim(),
          category: payload.category || "history",
          description: (payload.description || "").trim(),
        })
        .select()
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase createMilestone fallback:", err.message);
    }
  }

  const newMilestone = {
    id: memoryNextId.milestones++,
    year: parseInt(payload.year, 10) || new Date().getFullYear(),
    title: (payload.title || "").trim(),
    category: payload.category || "history",
    description: (payload.description || "").trim(),
  };
  memoryData.milestones.push(newMilestone);
  return newMilestone;
}

export async function updateMilestone(id, payload) {
  const numId = parseInt(id, 10);
  if (supabase) {
    try {
      const updateData = {};
      if (payload.year !== undefined) updateData.year = parseInt(payload.year, 10);
      if (payload.title !== undefined) updateData.title = payload.title.trim();
      if (payload.category !== undefined) updateData.category = payload.category;
      if (payload.description !== undefined) updateData.description = payload.description.trim();

      const { data, error } = await supabase
        .from("milestones")
        .update(updateData)
        .eq("id", numId)
        .select()
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase updateMilestone fallback:", err.message);
    }
  }

  const item = memoryData.milestones.find((m) => m.id === numId);
  if (!item) return null;
  if (payload.year !== undefined) item.year = parseInt(payload.year, 10);
  if (payload.title !== undefined) item.title = payload.title.trim();
  if (payload.category !== undefined) item.category = payload.category;
  if (payload.description !== undefined) item.description = payload.description.trim();
  return item;
}

export async function deleteMilestone(id) {
  const numId = parseInt(id, 10);
  if (supabase) {
    try {
      const { error } = await supabase.from("milestones").delete().eq("id", numId);
      if (!error) return true;
    } catch (err) {
      console.warn("[DB] Supabase deleteMilestone fallback:", err.message);
    }
  }

  const idx = memoryData.milestones.findIndex((m) => m.id === numId);
  if (idx === -1) return false;
  memoryData.milestones.splice(idx, 1);
  return true;
}

// ----------------------------------------------------------------------------
// FACULTY & LABS (FR-04)
// ----------------------------------------------------------------------------
export async function getFaculty({ q } = {}) {
  if (supabase) {
    try {
      let query = supabase.from("faculty").select("*");
      if (q) {
        const term = q.trim();
        query = query.or(`name.ilike.%${term}%,specialization.ilike.%${term}%,designation.ilike.%${term}%`);
      }
      query = query.order("name", { ascending: true });
      const { data, error } = await query;
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase getFaculty fallback:", err.message);
    }
  }

  let result = [...memoryData.faculty];
  if (q) {
    const term = q.trim().toLowerCase();
    result = result.filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        f.specialization.toLowerCase().includes(term) ||
        f.designation.toLowerCase().includes(term)
    );
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createFaculty(payload) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("faculty")
        .insert({
          name: (payload.name || "").trim(),
          designation: (payload.designation || "").trim(),
          specialization: (payload.specialization || "").trim(),
          publications: parseInt(payload.publications, 10) || 0,
          experience_years: parseInt(payload.experience_years, 10) || 0,
          photo_url: (payload.photo_url || "").trim(),
        })
        .select()
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase createFaculty fallback:", err.message);
    }
  }

  const newFaculty = {
    id: memoryNextId.faculty++,
    name: (payload.name || "").trim(),
    designation: (payload.designation || "").trim(),
    specialization: (payload.specialization || "").trim(),
    publications: parseInt(payload.publications, 10) || 0,
    experience_years: parseInt(payload.experience_years, 10) || 0,
    photo_url: (payload.photo_url || "").trim(),
  };
  memoryData.faculty.push(newFaculty);
  return newFaculty;
}

export async function updateFaculty(id, payload) {
  const numId = parseInt(id, 10);
  if (supabase) {
    try {
      const updateData = {};
      if (payload.name !== undefined) updateData.name = payload.name.trim();
      if (payload.designation !== undefined) updateData.designation = payload.designation.trim();
      if (payload.specialization !== undefined) updateData.specialization = payload.specialization.trim();
      if (payload.publications !== undefined) updateData.publications = parseInt(payload.publications, 10) || 0;
      if (payload.experience_years !== undefined) updateData.experience_years = parseInt(payload.experience_years, 10) || 0;
      if (payload.photo_url !== undefined) updateData.photo_url = payload.photo_url.trim();

      const { data, error } = await supabase
        .from("faculty")
        .update(updateData)
        .eq("id", numId)
        .select()
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase updateFaculty fallback:", err.message);
    }
  }

  const item = memoryData.faculty.find((f) => f.id === numId);
  if (!item) return null;
  if (payload.name !== undefined) item.name = payload.name.trim();
  if (payload.designation !== undefined) item.designation = payload.designation.trim();
  if (payload.specialization !== undefined) item.specialization = payload.specialization.trim();
  if (payload.publications !== undefined) item.publications = parseInt(payload.publications, 10) || 0;
  if (payload.experience_years !== undefined) item.experience_years = parseInt(payload.experience_years, 10) || 0;
  if (payload.photo_url !== undefined) item.photo_url = payload.photo_url.trim();
  return item;
}

export async function deleteFaculty(id) {
  const numId = parseInt(id, 10);
  if (supabase) {
    try {
      const { error } = await supabase.from("faculty").delete().eq("id", numId);
      if (!error) return true;
    } catch (err) {
      console.warn("[DB] Supabase deleteFaculty fallback:", err.message);
    }
  }

  const idx = memoryData.faculty.findIndex((f) => f.id === numId);
  if (idx === -1) return false;
  memoryData.faculty.splice(idx, 1);
  return true;
}

export async function getLabs() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("labs").select("*").order("name", { ascending: true });
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase getLabs fallback:", err.message);
    }
  }
  return [...memoryData.labs].sort((a, b) => a.name.localeCompare(b.name));
}

export async function createLab(payload) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("labs")
        .insert({
          name: (payload.name || "").trim(),
          description: (payload.description || "").trim(),
          photo_url: (payload.photo_url || "").trim(),
        })
        .select()
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase createLab fallback:", err.message);
    }
  }

  const newLab = {
    id: memoryNextId.labs++,
    name: (payload.name || "").trim(),
    description: (payload.description || "").trim(),
    photo_url: (payload.photo_url || "").trim(),
  };
  memoryData.labs.push(newLab);
  return newLab;
}

export async function updateLab(id, payload) {
  const numId = parseInt(id, 10);
  if (supabase) {
    try {
      const updateData = {};
      if (payload.name !== undefined) updateData.name = payload.name.trim();
      if (payload.description !== undefined) updateData.description = payload.description.trim();
      if (payload.photo_url !== undefined) updateData.photo_url = payload.photo_url.trim();

      const { data, error } = await supabase
        .from("labs")
        .update(updateData)
        .eq("id", numId)
        .select()
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase updateLab fallback:", err.message);
    }
  }

  const item = memoryData.labs.find((l) => l.id === numId);
  if (!item) return null;
  if (payload.name !== undefined) item.name = payload.name.trim();
  if (payload.description !== undefined) item.description = payload.description.trim();
  if (payload.photo_url !== undefined) item.photo_url = payload.photo_url.trim();
  return item;
}

export async function deleteLab(id) {
  const numId = parseInt(id, 10);
  if (supabase) {
    try {
      const { error } = await supabase.from("labs").delete().eq("id", numId);
      if (!error) return true;
    } catch (err) {
      console.warn("[DB] Supabase deleteLab fallback:", err.message);
    }
  }

  const idx = memoryData.labs.findIndex((l) => l.id === numId);
  if (idx === -1) return false;
  memoryData.labs.splice(idx, 1);
  return true;
}

// ----------------------------------------------------------------------------
// PLACEMENTS (FR-05)
// ----------------------------------------------------------------------------
export async function getPlacements({ q } = {}) {
  if (supabase) {
    try {
      let query = supabase.from("placements").select("*");
      if (q) {
        const term = q.trim();
        query = query.or(`company.ilike.%${term}%,job_role.ilike.%${term}%`);
      }
      query = query.order("year", { ascending: false }).order("package_lpa", { ascending: false });
      const { data, error } = await query;
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase getPlacements fallback:", err.message);
    }
  }

  let result = [...memoryData.placements];
  if (q) {
    const term = q.trim().toLowerCase();
    result = result.filter(
      (p) => p.company.toLowerCase().includes(term) || p.job_role.toLowerCase().includes(term)
    );
  }
  return result.sort((a, b) => b.year - a.year || b.package_lpa - a.package_lpa);
}

export async function createPlacement(payload) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("placements")
        .insert({
          company: (payload.company || "").trim(),
          job_role: (payload.job_role || "").trim(),
          year: parseInt(payload.year, 10) || new Date().getFullYear(),
          offers_count: parseInt(payload.offers_count, 10) || 0,
          package_lpa: parseFloat(payload.package_lpa) || 0.0,
        })
        .select()
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase createPlacement fallback:", err.message);
    }
  }

  const newPlacement = {
    id: memoryNextId.placements++,
    company: (payload.company || "").trim(),
    job_role: (payload.job_role || "").trim(),
    year: parseInt(payload.year, 10) || new Date().getFullYear(),
    offers_count: parseInt(payload.offers_count, 10) || 0,
    package_lpa: parseFloat(payload.package_lpa) || 0.0,
  };
  memoryData.placements.push(newPlacement);
  return newPlacement;
}

export async function updatePlacement(id, payload) {
  const numId = parseInt(id, 10);
  if (supabase) {
    try {
      const updateData = {};
      if (payload.company !== undefined) updateData.company = payload.company.trim();
      if (payload.job_role !== undefined) updateData.job_role = payload.job_role.trim();
      if (payload.year !== undefined) updateData.year = parseInt(payload.year, 10);
      if (payload.offers_count !== undefined) updateData.offers_count = parseInt(payload.offers_count, 10) || 0;
      if (payload.package_lpa !== undefined) updateData.package_lpa = parseFloat(payload.package_lpa) || 0.0;

      const { data, error } = await supabase
        .from("placements")
        .update(updateData)
        .eq("id", numId)
        .select()
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase updatePlacement fallback:", err.message);
    }
  }

  const item = memoryData.placements.find((p) => p.id === numId);
  if (!item) return null;
  if (payload.company !== undefined) item.company = payload.company.trim();
  if (payload.job_role !== undefined) item.job_role = payload.job_role.trim();
  if (payload.year !== undefined) item.year = parseInt(payload.year, 10);
  if (payload.offers_count !== undefined) item.offers_count = parseInt(payload.offers_count, 10) || 0;
  if (payload.package_lpa !== undefined) item.package_lpa = parseFloat(payload.package_lpa) || 0.0;
  return item;
}

export async function deletePlacement(id) {
  const numId = parseInt(id, 10);
  if (supabase) {
    try {
      const { error } = await supabase.from("placements").delete().eq("id", numId);
      if (!error) return true;
    } catch (err) {
      console.warn("[DB] Supabase deletePlacement fallback:", err.message);
    }
  }

  const idx = memoryData.placements.findIndex((p) => p.id === numId);
  if (idx === -1) return false;
  memoryData.placements.splice(idx, 1);
  return true;
}

// ----------------------------------------------------------------------------
// FEEDBACK & INQUIRIES (FR-06)
// ----------------------------------------------------------------------------
export async function createFeedback(payload) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .insert({
          name: payload.name.trim(),
          email: payload.email.trim(),
          kind: payload.kind,
          subject: payload.subject.trim(),
          message: payload.message.trim(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase createFeedback fallback:", err.message);
    }
  }

  const item = {
    id: memoryNextId.feedback++,
    name: payload.name.trim(),
    email: payload.email.trim(),
    kind: payload.kind,
    subject: payload.subject.trim(),
    message: payload.message.trim(),
    created_at: new Date().toISOString(),
  };
  memoryData.feedback.push(item);
  return item;
}

export async function getFeedback() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data;
    } catch (err) {
      console.warn("[DB] Supabase getFeedback fallback:", err.message);
    }
  }
  return [...memoryData.feedback].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// ----------------------------------------------------------------------------
// UNIFIED SEARCH (FR-06 & NFR-01)
// ----------------------------------------------------------------------------
export async function searchAll(q) {
  const [sList, pList, mList, fList, plList] = await Promise.all([
    getStudents({ q }),
    getProjects({ q }),
    getMilestones(),
    getFaculty({ q }),
    getPlacements({ q }),
  ]);

  const term = q.trim().toLowerCase();
  const filteredMilestones = mList.filter(
    (m) =>
      m.title.toLowerCase().includes(term) ||
      m.description.toLowerCase().includes(term) ||
      m.category.toLowerCase().includes(term)
  );

  return {
    students: sList.slice(0, 20),
    projects: pList.slice(0, 20),
    milestones: filteredMilestones.slice(0, 20),
    faculty: fList.slice(0, 20),
    placements: plList.slice(0, 20),
  };
}

// ----------------------------------------------------------------------------
// DASHBOARD & REPORTS (Staff)
// ----------------------------------------------------------------------------
export async function getDashboardStats() {
  const [sList, pList, mList, fList, lList, plList, fbList] = await Promise.all([
    getStudents(),
    getProjects(),
    getMilestones(),
    getFaculty(),
    getLabs(),
    getPlacements(),
    getFeedback(),
  ]);

  const totalOffers = plList.reduce((sum, p) => sum + (p.offers_count || 0), 0);
  const highestPackage = plList.reduce((max, p) => Math.max(max, Number(p.package_lpa) || 0), 0.0);

  const recentStudents = [...sList].sort((a, b) => b.id - a.id).slice(0, 5);
  const recentFeedback = [...fbList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  return {
    students: sList.length,
    alumni: sList.filter((s) => s.status === "alumni").length,
    projects: pList.length,
    milestones: mList.length,
    faculty: fList.length,
    labs: lList.length,
    placements: plList.length,
    feedback: fbList.length,
    total_offers: totalOffers,
    highest_package: highestPackage,
    recent_students: recentStudents,
    recent_feedback: recentFeedback,
  };
}

export async function getReports() {
  const [plList, sList] = await Promise.all([getPlacements(), getStudents()]);

  // Placements by year
  const placementYearMap = new Map();
  plList.forEach((p) => {
    if (!placementYearMap.has(p.year)) {
      placementYearMap.set(p.year, []);
    }
    placementYearMap.get(p.year).push(p);
  });

  const placements_by_year = Array.from(placementYearMap.entries())
    .map(([year, items]) => {
      const companies = items.length;
      const offers = items.reduce((sum, item) => sum + (item.offers_count || 0), 0);
      const highest_package = items.reduce((max, item) => Math.max(max, Number(item.package_lpa) || 0), 0);
      const avg = items.reduce((sum, item) => sum + (Number(item.package_lpa) || 0), 0) / (items.length || 1);
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
  sList.forEach((s) => {
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
  const top_recruiters = [...plList]
    .sort((a, b) => (Number(b.package_lpa) || 0) - (Number(a.package_lpa) || 0) || (b.offers_count || 0) - (a.offers_count || 0))
    .slice(0, 8);

  return {
    placements_by_year,
    students_by_batch,
    top_recruiters,
  };
}
