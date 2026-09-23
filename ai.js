import { GoogleGenAI } from "@google/genai";
import * as db from "./db.js";

let aiClient = null;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

/**
 * Retrieve a structured snapshot of all departmental records for real-time grounding.
 */
export async function getDepartmentContext() {
  const [students, projects, milestones, faculty, labs, placements] = await Promise.all([
    db.getStudents(),
    db.getProjects(),
    db.getMilestones(),
    db.getFaculty(),
    db.getLabs(),
    db.getPlacements(),
  ]);

  return {
    department: "Department of Information Technology",
    institution: "Kongu Engineering College, Perundurai, Erode - 638060",
    inquiry_portal: {
      submission_url: "/#feedback",
      supported_types: ["inquiry", "feedback"],
      description: "Guests, parents, and recruiters can submit inquiries and feedback via the Guest Inquiry portal.",
    },
    students_and_alumni: students.map((s) => ({
      roll_no: s.roll_no,
      name: s.name,
      batch_year: s.batch_year,
      status: s.status,
      email: s.email,
      current_company: s.current_company || "None listed",
      job_role: s.job_role || "None listed",
      career_notes: s.career_notes || "None listed",
    })),
    projects_and_research: projects.map((p) => ({
      title: p.title,
      year: p.year,
      category: p.category,
      authors: p.authors,
      technologies: p.technologies || "N/A",
      description: p.description,
    })),
    history_and_milestones: milestones.map((m) => ({
      year: m.year,
      title: m.title,
      category: m.category,
      description: m.description,
    })),
    faculty_profiles: faculty.map((f) => ({
      name: f.name,
      designation: f.designation,
      specialization: f.specialization,
      publications: f.publications,
      experience_years: f.experience_years,
    })),
    laboratories: labs.map((l) => ({
      name: l.name,
      description: l.description,
    })),
    placements_and_recruiters: placements.map((pl) => ({
      company: pl.company,
      job_role: pl.job_role,
      year: pl.year,
      offers_count: pl.offers_count,
      package_lpa: Number(pl.package_lpa),
    })),
  };
}

/**
 * Intelligent local grounded response synthesizer when Gemini API key is not yet set
 * or during offline/test fallback. Strictly adheres to factual database records.
 */
function generateLocalGroundedResponse(query, context) {
  const q = query.toLowerCase();

  // 1. Head of Department / Faculty queries
  if (q.includes("hod") || q.includes("head of department") || q.includes("head") || q.includes("faculty") || q.includes("professor") || q.includes("teacher")) {
    const hod = context.faculty_profiles.find(
      (f) => f.designation.toLowerCase().includes("head") || f.name.toLowerCase().includes("thangarajan")
    );
    if (q.includes("hod") || q.includes("head of department") || q.includes("head")) {
      if (hod) {
        return {
          reply: `**Head of Department:** ${hod.name} (${hod.designation})\n- **Specialization:** ${hod.specialization}\n- **Experience:** ${hod.experience_years} years\n- **Publications:** ${hod.publications} papers published.`,
          model: "local-grounded-fallback",
          source: "database",
        };
      }
    }
    const facultyList = context.faculty_profiles
      .map((f) => `• **${f.name}** – ${f.designation} (${f.specialization}, ${f.experience_years} yrs exp, ${f.publications} publications)`)
      .join("\n");
    return {
      reply: `Here are the distinguished faculty members in the IT Department:\n\n${facultyList}`,
      model: "local-grounded-fallback",
      source: "database",
    };
  }

  // 2. Placements & Recruiters queries
  if (q.includes("placement") || q.includes("package") || q.includes("recruiter") || q.includes("salary") || q.includes("lpa") || q.includes("offer") || q.includes("company") || q.includes("companies")) {
    const highest = [...context.placements_and_recruiters].sort((a, b) => b.package_lpa - a.package_lpa)[0];
    if (q.includes("highest") || q.includes("top package") || q.includes("maximum")) {
      return {
        reply: `The highest recorded package is **${highest.package_lpa} LPA** offered by **${highest.company}** for the role of **${highest.job_role}** (${highest.year}).`,
        model: "local-grounded-fallback",
        source: "database",
      };
    }
    const placementList = context.placements_and_recruiters
      .map((p) => `• **${p.company}**: ${p.offers_count} offers for *${p.job_role}* at **${p.package_lpa} LPA** (${p.year})`)
      .join("\n");
    return {
      reply: `**Department Placement Highlights:**\n${placementList}\n\n*Top Offer:* ${highest.company} at ${highest.package_lpa} LPA.`,
      model: "local-grounded-fallback",
      source: "database",
    };
  }

  // 3. Projects & Research queries
  if (q.includes("project") || q.includes("research") || q.includes("capstone") || q.includes("flutter") || q.includes("ble") || q.includes("kiosk") || q.includes("anomaly")) {
    const matched = context.projects_and_research.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.technologies.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        q.includes("project") ||
        q.includes("research") ||
        q.includes("capstone")
    );
    if (matched.length > 0) {
      const projectsText = matched
        .slice(0, 4)
        .map(
          (p) =>
            `• **${p.title}** (${p.year}, ${p.category})\n  - **Authors:** ${p.authors}\n  - **Tech Stack:** ${p.technologies}\n  - **Details:** ${p.description}`
        )
        .join("\n\n");
      return {
        reply: `Here are the relevant project and research archives:\n\n${projectsText}`,
        model: "local-grounded-fallback",
        source: "database",
      };
    }
  }

  // 4. Department History & Timeline
  if (q.includes("history") || q.includes("timeline") || q.includes("founded") || q.includes("established") || q.includes("inception") || q.includes("milestone") || q.includes("accreditation") || q.includes("award")) {
    const milestonesText = context.history_and_milestones
      .sort((a, b) => a.year - b.year)
      .map((m) => `• **${m.year} – ${m.title}** (${m.category}): ${m.description}`)
      .join("\n");
    return {
      reply: `**Department Historical Milestones & Accreditations:**\n\n${milestonesText}`,
      model: "local-grounded-fallback",
      source: "database",
    };
  }

  // 5. Labs & Facilities
  if (q.includes("lab") || q.includes("facility") || q.includes("infrastructure") || q.includes("library") || q.includes("seminar")) {
    const labsText = context.laboratories.map((l) => `• **${l.name}**: ${l.description}`).join("\n");
    return {
      reply: `**Department Laboratories & Infrastructure:**\n\n${labsText}`,
      model: "local-grounded-fallback",
      source: "database",
    };
  }

  // 6. Students and Alumni
  if (q.includes("student") || q.includes("alumni") || q.includes("roll") || q.includes("aakash") || q.includes("bhavana") || q.includes("dinesh") || q.includes("kavya") || q.includes("harini") || q.includes("zoho") || q.includes("amazon")) {
    const matched = context.students_and_alumni.filter(
      (s) =>
        q.includes(s.roll_no.toLowerCase()) ||
        q.includes(s.name.toLowerCase().split(" ")[0]) ||
        (s.current_company && q.includes(s.current_company.toLowerCase()))
    );
    if (matched.length > 0) {
      const studentText = matched
        .map(
          (s) =>
            `• **${s.name}** (${s.roll_no}) – Batch of ${s.batch_year} [${s.status.toUpperCase()}]\n  - **Company & Role:** ${s.current_company} (${s.job_role})\n  - **Notes:** ${s.career_notes}`
        )
        .join("\n\n");
      return {
        reply: `Found matching student / alumni records:\n\n${studentText}`,
        model: "local-grounded-fallback",
        source: "database",
      };
    }
    const sample = context.students_and_alumni
      .slice(0, 4)
      .map((s) => `• **${s.name}** (${s.roll_no}, Batch ${s.batch_year}) - ${s.status === "alumni" ? "Alumni at " + s.current_company : "Student"}`)
      .join("\n");
    return {
      reply: `The department database tracks enrolled students and distinguished alumni. Here are some records:\n\n${sample}`,
      model: "local-grounded-fallback",
      source: "database",
    };
  }

  // 7. Guest Inquiry / Feedback portal
  if (q.includes("inquiry") || q.includes("feedback") || q.includes("contact") || q.includes("message") || q.includes("submit")) {
    return {
      reply: `Guests, parents, and recruiters can submit inquiries and feedback via the **Guest Inquiry** portal in the navigation (or by visiting the Guest Inquiry section). The department office reviews inquiries regarding admissions, placements, alumni connections, and academic programs.`,
      model: "local-grounded-fallback",
      source: "database",
    };
  }

  // Explicit handling for missing information
  return {
    reply: `I could not find records regarding "${query}" in the Department Legacy Management System database. Please contact the department administrative office or submit an official inquiry through the Guest Inquiry section.`,
    model: "local-grounded-fallback",
    source: "database",
    notFound: true,
  };
}

/**
 * Handle incoming user chat message with conversation history.
 */
export async function handleChatMessage(userMessage, conversationHistory = []) {
  if (!userMessage || !userMessage.trim()) {
    throw new Error("Message cannot be empty");
  }

  const query = userMessage.trim();
  const contextData = await getDepartmentContext();
  const ai = getAiClient();

  const systemInstruction = `You are the official AI Chatbot and Assistant for the Department of Information Technology Legacy Management System (Department of IT, Kongu Engineering College, Perundurai, Erode).

You have complete real-time access to the department's verified database:
${JSON.stringify(contextData, null, 2)}

Your responsibilities:
1. Answer questions about:
   - Students and Alumni (roll numbers, batches, companies, job roles, career notes, current status).
   - Projects and Research archive (capstone projects, research publications, innovations, authors, technologies used, year).
   - Department History and Timeline (establishment in 1998, UGC autonomous accreditation in 2007, Anna University research centre recognition in 2015, GPU AI lab expansion in 2021, and all other milestones).
   - Faculty and Infrastructure (professors, HoD, designations, specializations, publication counts, experience, laboratories, high performance AI computing, smart seminar halls).
   - Placements and Recruiters (recruiting companies like Zoho, AWS, TCS Digital, Cognizant, Kaar, Accenture; packages in LPA; total offers; placement years).
   - Guest inquiries and feedback (explain how visitors, recruiters, and parents can submit inquiries or feedback via the Guest Inquiry portal, or provide public placement inquiry info).
2. Natural language understanding: Interpret conversational queries, user synonyms, abbreviations, or informal questions accurately without requiring exact keywords.
3. Strict Grounding: Provide accurate answers based ONLY on the available department database records above.
4. Missing Information Handling: If the user asks about a person, company, year, project, or topic that does NOT exist in the database, clearly and politely state that the requested information is not available in the department legacy records, and advise them to submit an inquiry through the Guest Inquiry section. Never hallucinate or invent non-existent faculty, students, or statistics.
5. Tone: Professional, courteous, helpful, and concise. Use clean markdown formatting (bullet points, bold text) for readability.`;

  if (ai) {
    try {
      const contents = [];
      if (Array.isArray(conversationHistory)) {
        for (const msg of conversationHistory.slice(-6)) {
          if (msg && msg.text && (msg.role === "user" || msg.role === "model")) {
            contents.push({
              role: msg.role === "user" ? "user" : "model",
              parts: [{ text: String(msg.text) }],
            });
          }
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: query }],
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini API call timed out")), 6000)
      );

      const generatePromise = ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);

      const reply = response.text || "No response generated.";
      return {
        reply,
        model: "gemini-3.8-flash",
        source: "database-grounded-gemini",
      };
    } catch (err) {
      console.warn("[AI] Gemini API error, falling back to local factual synthesizer:", err.message);
    }
  }

  return generateLocalGroundedResponse(query, contextData);
}
