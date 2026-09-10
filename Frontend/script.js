const API = "/api";
const storageKey = "dlms_token";

const state = {
  token: localStorage.getItem(storageKey) || "",
  user: null,
};

const $ = (id) => document.getElementById(id);

/* ==========================================================================
   TOAST NOTIFICATIONS
   ========================================================================== */
function showToast(message, type = "info") {
  const container = $("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconSvg =
    type === "success"
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : type === "error"
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

  toast.innerHTML = `<span>${iconSvg}</span><div>${escapeHtml(message)}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-exit");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function showError(el, message) {
  if (!el) return;
  el.hidden = !message;
  el.textContent = message || "";
}

/* ==========================================================================
   API CLIENT
   ========================================================================== */
async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const response = await fetch(`${API}${path}`, { ...options, headers });
  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    let message = "Request failed";
    const detail = data.detail;
    if (Array.isArray(detail)) {
      message = detail
        .map((item) => {
          const field = item.loc && item.loc.length > 1 ? item.loc[item.loc.length - 1] : "";
          const prefix = field && field !== "body" ? `${field.replace(/_/g, " ")}: ` : "";
          return `${prefix}${item.msg || item}`;
        })
        .join(" | ");
    } else if (typeof detail === "string") {
      message = detail;
    }
    throw new Error(message);
  }
  return data;
}

/* ==========================================================================
   PAGE NAVIGATION
   ========================================================================== */
function switchPage(targetId) {
  document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.remove("active"));

  const page = document.getElementById(targetId);
  if (page) page.classList.add("active");

  const link = document.querySelector(`.nav-link[data-target="${targetId}"]`);
  if (link) link.classList.add("active");

  document.body.classList.remove("nav-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setAuthUI(isStaff) {
  document.body.classList.toggle("role-guest", !isStaff);
  document.body.classList.toggle("role-staff", isStaff);

  $("staffLoginBtn").classList.toggle("hidden", isStaff);
  $("logoutBtn").classList.toggle("hidden", !isStaff);
  $("guestViewBtn").classList.toggle("hidden", !isStaff);

  $("roleLabel").textContent = isStaff
    ? `Signed in as ${state.user?.full_name || state.user?.username}`
    : "Viewing as Guest";
}

/* ==========================================================================
   FORM RESETS & EDIT STATE CONTROLS
   ========================================================================== */
function resetStudentForm() {
  $("studentForm").reset();
  $("studentId").value = "";
  $("studentFormTitle").textContent = "Add New Student / Alumni Record";
  $("studentEditBadge").classList.add("hidden");
  $("studentSubmitBtn").textContent = "Save Record";
  $("studentReset").textContent = "Clear Form";
  showError($("studentFormError"), "");
}

function resetProjectForm() {
  $("projectForm").reset();
  $("projectId").value = "";
  $("projectFormTitle").textContent = "Add Archive Entry";
  $("projectEditBadge").classList.add("hidden");
  $("projectSubmitBtn").textContent = "Save Archive Item";
  $("projectReset").textContent = "Clear Form";
  showError($("projectFormError"), "");
}

function resetMilestoneForm() {
  $("milestoneForm").reset();
  $("msId").value = "";
  $("msFormTitle").textContent = "Add Department Milestone";
  $("msEditBadge").classList.add("hidden");
  $("msSubmitBtn").textContent = "Save Milestone";
  $("msReset").textContent = "Clear Form";
  showError($("msError"), "");
}

function resetFacultyForm() {
  $("facultyForm").reset();
  $("faId").value = "";
  $("faFormTitle").textContent = "Faculty Profile";
  $("faEditBadge").classList.add("hidden");
  $("faSubmitBtn").textContent = "Save Faculty";
  $("faReset").textContent = "Clear";
  showError($("faError"), "");
}

function resetLabForm() {
  $("labForm").reset();
  $("labId").value = "";
  $("labFormTitle").textContent = "Lab / Facility Profile";
  $("labEditBadge").classList.add("hidden");
  $("labSubmitBtn").textContent = "Save Facility";
  $("labReset").textContent = "Clear";
  showError($("labError"), "");
}

function resetPlacementForm() {
  $("placementForm").reset();
  $("plId").value = "";
  $("plFormTitle").textContent = "Add Placement Record";
  $("plEditBadge").classList.add("hidden");
  $("plSubmitBtn").textContent = "Save Placement";
  $("plReset").textContent = "Clear Form";
  showError($("plError"), "");
}

/* ==========================================================================
   RENDER HELPERS
   ========================================================================== */
function card(html) {
  const article = document.createElement("article");
  article.className = "card";
  article.innerHTML = html;
  return article;
}

function statsHtml(items) {
  return items
    .map(([label, value]) => `
      <div class="stat">
        <b>${escapeHtml(String(value))}</b>
        <span>${escapeHtml(label)}</span>
      </div>
    `)
    .join("");
}

function actionButtons(kind, id) {
  return `
    <div class="row-actions">
      <button class="btn btn-ghost btn-xs" data-edit="${kind}" data-id="${id}" title="Edit this record">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
        <span>Edit</span>
      </button>
      <button class="btn btn-danger btn-xs" data-delete="${kind}" data-id="${id}" title="Delete this record">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        <span>Delete</span>
      </button>
    </div>
  `;
}

/* ==========================================================================
   LOAD & RENDER PUBLIC DATA
   ========================================================================== */
async function loadPublic() {
  const [students, projects, milestones, faculty, labs, placements] = await Promise.all([
    api("/students"),
    api("/projects"),
    api("/milestones"),
    api("/faculty"),
    api("/labs"),
    api("/placements"),
  ]);

  $("homeStats").innerHTML = statsHtml([
    ["Student Records", students.length],
    ["Research & Projects", projects.length],
    ["Faculty Profiles", faculty.length],
    ["Recruiter Partners", placements.length],
  ]);

  renderStudents(students);
  renderProjects(projects);
  renderTimeline(milestones);
  renderFaculty(faculty);
  renderLabs(labs);
  renderPlacements(placements);
}

function renderStudents(students) {
  const wrap = $("studentCards");
  wrap.innerHTML = "";
  if (!students.length) {
    wrap.appendChild(card("<p class='meta-subtext'>No matching student records found.</p>"));
    renderStudentTable([]);
    return;
  }

  students.forEach((item) => {
    const statusClass = item.status === "alumni" ? "chip-alumni" : "chip-student";
    const statusLabel = item.status === "alumni" ? "Alumni" : "Current Student";

    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML = `
      <div>
        <span class="chip ${statusClass}">${statusLabel}</span>
        <span class="chip chip-year">Batch ${item.batch_year}</span>
      </div>
      <h3>${escapeHtml(item.name)}</h3>
      <p class="meta-subtext"><strong>Roll:</strong> ${escapeHtml(item.roll_no)} · <a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a></p>
      <div class="mt-sm">
        <p><strong>${escapeHtml(item.job_role || "Career in progress")}</strong></p>
        <p class="meta-subtext">${escapeHtml(item.current_company || "Institution / Department")}</p>
      </div>
      ${item.career_notes ? `<p class="mt-sm meta-subtext">${escapeHtml(item.career_notes)}</p>` : ""}
    `;
    wrap.appendChild(el);
  });

  renderStudentTable(students);
}

function renderStudentTable(students) {
  const tbody = $("studentManageTable");
  if (!students.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--slate-400); padding: 1.5rem;">No student records found.</td></tr>`;
    return;
  }
  tbody.innerHTML = students
    .map((item) => {
      const statusChip = item.status === "alumni" ? '<span class="chip chip-alumni">Alumni</span>' : '<span class="chip chip-student">Student</span>';
      return `
        <tr>
          <td><strong>${escapeHtml(item.roll_no)}</strong></td>
          <td>${escapeHtml(item.name)}</td>
          <td>${item.batch_year}</td>
          <td>${statusChip}</td>
          <td>${escapeHtml(item.current_company || "—")} <br><span class="meta-subtext">${escapeHtml(item.job_role || "—")}</span></td>
          <td class="actions-col">${actionButtons("students", item.id)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderProjects(projects) {
  const wrap = $("projectCards");
  wrap.innerHTML = "";
  if (!projects.length) {
    wrap.appendChild(card("<p class='meta-subtext'>No archive entries found.</p>"));
    $("projectManageList").innerHTML = "<p class='meta-subtext'>No archive entries recorded.</p>";
    return;
  }

  projects.forEach((item) => {
    const chipClass =
      item.category === "research"
        ? "chip-research"
        : item.category === "innovation"
        ? "chip-innovation"
        : "chip-project";

    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML = `
      <div>
        <span class="chip ${chipClass}">${escapeHtml(item.category)}</span>
        <span class="chip chip-year">${item.year}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="meta-subtext"><strong>Authors:</strong> ${escapeHtml(item.authors)}</p>
      <p class="mt-sm">${escapeHtml(item.description)}</p>
      ${item.technologies ? `<p class="mt-sm meta-subtext"><strong>Tech:</strong> ${escapeHtml(item.technologies)}</p>` : ""}
    `;
    wrap.appendChild(el);
  });

  $("projectManageList").innerHTML = projects
    .map(
      (item) => `
      <article class="card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
          <div>
            <span class="chip">${escapeHtml(item.category)} · ${item.year}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p class="meta-subtext">Authors: ${escapeHtml(item.authors)}</p>
          </div>
          ${actionButtons("projects", item.id)}
        </div>
      </article>
    `
    )
    .join("");
}

function renderTimeline(items) {
  const wrap = $("timelineList");
  if (!items.length) {
    wrap.innerHTML = "<p class='meta-subtext'>No timeline milestones found.</p>";
    $("milestoneManageList").innerHTML = "<p class='meta-subtext'>No milestones recorded.</p>";
    return;
  }

  wrap.innerHTML = items
    .map((item) => `
      <div class="timeline-item">
        <div class="timeline-header">
          <span class="timeline-year">${item.year}</span>
          <span class="chip">${escapeHtml(item.category)}</span>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
      </div>
    `)
    .join("");

  $("milestoneManageList").innerHTML = items
    .map((item) => `
      <article class="card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
          <div>
            <span class="chip">${item.year} · ${escapeHtml(item.category)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
          </div>
          ${actionButtons("milestones", item.id)}
        </div>
      </article>
    `)
    .join("");
}

function renderFaculty(items) {
  const wrap = $("facultyCards");
  wrap.innerHTML = "";
  if (!items.length) {
    wrap.appendChild(card("<p class='meta-subtext'>No faculty profiles recorded.</p>"));
    $("facultyManageList").innerHTML = "<p class='meta-subtext'>No faculty profiles recorded.</p>";
    return;
  }

  items.forEach((item) => {
    const el = document.createElement("article");
    el.className = "card person";
    el.innerHTML = `
      ${item.photo_url ? `<img src="${escapeHtml(item.photo_url)}" alt="${escapeHtml(item.name)}" loading="lazy" />` : ""}
      <h3>${escapeHtml(item.name)}</h3>
      <p class="meta-subtext" style="color:var(--primary); font-weight:600;">${escapeHtml(item.designation)}</p>
      <p class="meta-subtext"><strong>Area:</strong> ${escapeHtml(item.specialization)}</p>
      <div class="mt-sm">
        <span class="chip chip-year">Publications: ${item.publications}</span>
        <span class="chip chip-year">Exp: ${item.experience_years} Years</span>
      </div>
    `;
    wrap.appendChild(el);
  });

  $("facultyManageList").innerHTML = items
    .map(
      (item) => `
      <article class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem;">
          <div>
            <h3>${escapeHtml(item.name)}</h3>
            <p class="meta-subtext">${escapeHtml(item.designation)} · ${escapeHtml(item.specialization)}</p>
          </div>
          ${actionButtons("faculty", item.id)}
        </div>
      </article>
    `
    )
    .join("");
}

function renderLabs(items) {
  const wrap = $("labCards");
  wrap.innerHTML = "";
  if (!items.length) {
    wrap.appendChild(card("<p class='meta-subtext'>No facilities or labs recorded.</p>"));
    $("labManageList").innerHTML = "<p class='meta-subtext'>No laboratories recorded.</p>";
    return;
  }

  items.forEach((item) => {
    const el = document.createElement("article");
    el.className = "card photo-card";
    el.innerHTML = `
      ${item.photo_url ? `<img src="${escapeHtml(item.photo_url)}" alt="${escapeHtml(item.name)}" loading="lazy" />` : ""}
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.description)}</p>
    `;
    wrap.appendChild(el);
  });

  $("labManageList").innerHTML = items
    .map(
      (item) => `
      <article class="card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
          <div>
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.description)}</p>
          </div>
          ${actionButtons("labs", item.id)}
        </div>
      </article>
    `
    )
    .join("");
}

function renderPlacements(items) {
  const offers = items.reduce((sum, item) => sum + item.offers_count, 0);
  const highest = items.reduce((max, item) => Math.max(max, item.package_lpa), 0);
  const avg = items.length ? (items.reduce((sum, item) => sum + item.package_lpa, 0) / items.length).toFixed(1) : "0.0";

  $("placementStats").innerHTML = statsHtml([
    ["Recruiting Companies", items.length],
    ["Total Job Offers", offers],
    ["Highest Package", `${highest.toFixed(1)} LPA`],
    ["Avg Recruiter Package", `${avg} LPA`],
  ]);

  const tbody = $("placementTable");
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--slate-400); padding: 1.5rem;">No placement records available.</td></tr>`;
    $("placementManageList").innerHTML = "<p class='meta-subtext'>No placement records recorded.</p>";
    return;
  }

  tbody.innerHTML = items
    .map((item) => `
      <tr>
        <td><strong>${escapeHtml(item.company)}</strong></td>
        <td>${escapeHtml(item.job_role)}</td>
        <td>${item.year}</td>
        <td><span class="chip">${item.offers_count} Offers</span></td>
        <td><strong>${item.package_lpa.toFixed(1)} LPA</strong></td>
      </tr>
    `)
    .join("");

  $("placementManageList").innerHTML = items
    .map((item) => `
      <article class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem;">
          <div>
            <h3>${escapeHtml(item.company)}</h3>
            <p class="meta-subtext">${escapeHtml(item.job_role)} · Year ${item.year} · ${item.package_lpa} LPA · ${item.offers_count} Offers</p>
          </div>
          ${actionButtons("placements", item.id)}
        </div>
      </article>
    `)
    .join("");
}

/* ==========================================================================
   PUBLIC SEARCH
   ========================================================================== */
function renderSearch(query, data) {
  $("searchSummary").textContent = `Search results for “${query}”`;
  const wrap = $("searchResults");
  wrap.innerHTML = "";

  const groups = [
    ["Students & Alumni Records", data.students || [], (item) => `<strong>${escapeHtml(item.name)}</strong> (${escapeHtml(item.roll_no)}) · Batch ${item.batch_year} · ${escapeHtml(item.current_company || "—")} (${escapeHtml(item.job_role || "—")})`],
    ["Projects & Research Publications", data.projects || [], (item) => `<strong>${escapeHtml(item.title)}</strong> (${item.year}) · ${escapeHtml(item.category)} · By ${escapeHtml(item.authors)}`],
    ["Department Milestones & History", data.milestones || [], (item) => `<strong>${item.year} - ${escapeHtml(item.title)}</strong> · ${escapeHtml(item.category)}: ${escapeHtml(item.description)}`],
    ["Faculty Members", data.faculty || [], (item) => `<strong>${escapeHtml(item.name)}</strong> · ${escapeHtml(item.designation)} · Area: ${escapeHtml(item.specialization)}`],
    ["Recruiter Partners & Roles", data.placements || [], (item) => `<strong>${escapeHtml(item.company)}</strong> · Role: ${escapeHtml(item.job_role)} · Year ${item.year} (${item.package_lpa} LPA)`],
  ];

  let foundAny = false;
  groups.forEach(([title, rows, lineFormatter]) => {
    if (!rows.length) return;
    foundAny = true;
    const article = document.createElement("article");
    article.className = "card";
    article.innerHTML = `
      <div class="card-header-compact">
        <h3>${title} (${rows.length})</h3>
      </div>
      <div class="compact-list">
        ${rows.map((row) => `<p>${lineFormatter(row)}</p>`).join("")}
      </div>
    `;
    wrap.appendChild(article);
  });

  if (!foundAny) {
    wrap.appendChild(card("<p class='meta-subtext'>No public records matched your search query. Try another keyword.</p>"));
  }
}

/* ==========================================================================
   STAFF DASHBOARD & REPORTS
   ========================================================================== */
async function loadStaffViews() {
  if (!state.token) return;

  const [dash, reports, inbox] = await Promise.all([
    api("/dashboard"),
    api("/reports"),
    api("/feedback"),
  ]);

  $("welcomeLine").textContent = `Logged in as ${state.user?.full_name || state.user?.username || "Department Staff"}`;

  $("dashStats").innerHTML = statsHtml([
    ["Total Students", dash.students],
    ["Alumni Profiles", dash.alumni],
    ["Research Projects", dash.projects],
    ["Milestones", dash.milestones],
    ["Faculty", dash.faculty],
    ["Placements Recorded", dash.placements],
    ["Offers Secured", dash.total_offers],
    ["Highest Package", `${dash.highest_package.toFixed(1)} LPA`],
    ["Guest Submissions", dash.feedback],
  ]);

  $("dashStudents").innerHTML = dash.recent_students.length
    ? dash.recent_students
        .map((item) => `<p><strong>${escapeHtml(item.name)}</strong> (${escapeHtml(item.roll_no)}) · Batch ${item.batch_year} · ${escapeHtml(item.current_company || "—")}</p>`)
        .join("")
    : "<p class='meta-subtext'>No recent students recorded.</p>";

  $("dashFeedback").innerHTML = dash.recent_feedback.length
    ? dash.recent_feedback
        .map((item) => `<p><strong>${escapeHtml(item.subject)}</strong><br><span class="meta-subtext">${escapeHtml(item.name)} · ${escapeHtml(item.kind)}</span></p>`)
        .join("")
    : "<p class='meta-subtext'>No recent guest submissions.</p>";

  $("inboxList").innerHTML = inbox.length
    ? inbox
        .map((item) => {
          const formattedDate = new Date(item.created_at).toLocaleString();
          return `
            <article class="card">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                <span class="chip ${item.kind === 'inquiry' ? 'chip-project' : 'chip-innovation'}">${escapeHtml(item.kind)}</span>
                <span class="meta-subtext">${formattedDate}</span>
              </div>
              <h3>${escapeHtml(item.subject)}</h3>
              <p class="meta-subtext"><strong>From:</strong> ${escapeHtml(item.name)} (<a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a>)</p>
              <p class="mt-sm">${escapeHtml(item.message)}</p>
            </article>
          `;
        })
        .join("")
    : "<article class='card'><p class='meta-subtext'>No messages in feedback inbox.</p></article>";

  $("reportStudents").innerHTML = reports.students_by_batch.length
    ? reports.students_by_batch
        .map((row) => `
          <tr>
            <td><strong>Batch ${row.batch_year}</strong></td>
            <td>${row.total}</td>
            <td><span class="chip chip-alumni">${row.alumni}</span></td>
            <td><span class="chip chip-student">${row.students}</span></td>
          </tr>
        `)
        .join("")
    : `<tr><td colspan="4" style="text-align:center; color: var(--slate-400);">No student records available.</td></tr>`;

  $("reportPlacements").innerHTML = reports.placements_by_year.length
    ? reports.placements_by_year
        .map((row) => `
          <tr>
            <td><strong>${row.year}</strong></td>
            <td>${row.companies}</td>
            <td>${row.offers}</td>
            <td><strong>${row.highest_package.toFixed(1)} LPA</strong></td>
            <td>${row.average_package.toFixed(1)} LPA</td>
          </tr>
        `)
        .join("")
    : `<tr><td colspan="5" style="text-align:center; color: var(--slate-400);">No placement data available.</td></tr>`;

  $("reportRecruiters").innerHTML = reports.top_recruiters.length
    ? reports.top_recruiters
        .map((item) => `
          <div class="stat">
            <b>${item.package_lpa.toFixed(1)} LPA</b>
            <span>${escapeHtml(item.company)} (${item.year})</span>
            <p class="meta-subtext mt-sm">${escapeHtml(item.job_role)}</p>
          </div>
        `)
        .join("")
    : "<p class='meta-subtext'>No top recruiter packages recorded.</p>";
}

/* ==========================================================================
   FORM SERIALIZATION & RESOURCE SAVING
   ========================================================================== */
function formValues(map) {
  const payload = {};
  Object.entries(map).forEach(([key, id]) => {
    const el = $(id);
    if (!el) return;
    payload[key] = el.type === "number" ? (el.value === "" ? 0 : Number(el.value)) : el.value.trim();
  });
  return payload;
}

function fillForm(map, data) {
  Object.entries(map).forEach(([key, id]) => {
    const el = $(id);
    if (el) el.value = data[key] ?? "";
  });
}

async function saveResource(path, id, payload, errorId, successMsg) {
  showError($(errorId), "");
  try {
    if (id) {
      await api(`${path}/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      showToast(successMsg || "Record updated successfully", "success");
    } else {
      await api(path, { method: "POST", body: JSON.stringify(payload) });
      showToast(successMsg || "Record created successfully", "success");
    }
    await loadPublic();
    if (state.token) await loadStaffViews();
  } catch (err) {
    showError($(errorId), err.message);
    showToast(err.message, "error");
    throw err;
  }
}

/* ==========================================================================
   GLOBAL CLICK ROUTING (EDIT / DELETE / SWITCH PAGE)
   ========================================================================== */
document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-target], [data-edit], [data-delete]");
  if (!target) return;

  // Page Switch
  if (target.dataset.target) {
    event.preventDefault();
    switchPage(target.dataset.target);
    return;
  }

  const kind = target.dataset.edit || target.dataset.delete;
  const id = Number(target.dataset.id);

  // Delete Action
  if (target.dataset.delete) {
    if (!confirm(`Are you sure you want to permanently delete this ${kind} record?`)) return;
    try {
      await api(`/${kind}/${id}`, { method: "DELETE" });
      showToast(`${kind.slice(0, -1)} record deleted`, "info");
      await loadPublic();
      await loadStaffViews();
    } catch (err) {
      showToast(err.message, "error");
    }
    return;
  }

  // Edit Action
  if (target.dataset.edit) {
    try {
      const records = await api(`/${kind === "students" ? "students" : kind}`);
      const item = records.find((row) => row.id === id);
      if (!item) return;

      if (kind === "students") {
        fillForm(
          {
            id: "studentId",
            roll_no: "stRoll",
            name: "stName",
            batch_year: "stBatch",
            email: "stEmail",
            phone: "stPhone",
            status: "stStatus",
            current_company: "stCompany",
            job_role: "stRole",
            career_notes: "stNotes",
          },
          item
        );
        $("studentFormTitle").textContent = `Edit Student Record: ${item.name} (${item.roll_no})`;
        $("studentEditBadge").classList.remove("hidden");
        $("studentSubmitBtn").textContent = "Update Record";
        $("studentReset").textContent = "Cancel Edit";
        switchPage("manage-students");
        $("studentForm").scrollIntoView({ behavior: "smooth" });
      } else if (kind === "projects") {
        fillForm(
          {
            id: "projectId",
            title: "prTitle",
            year: "prYear",
            category: "prCategory",
            authors: "prAuthors",
            technologies: "prTech",
            description: "prDesc",
          },
          item
        );
        $("projectFormTitle").textContent = `Edit Archive Entry: ${item.title}`;
        $("projectEditBadge").classList.remove("hidden");
        $("projectSubmitBtn").textContent = "Update Archive Item";
        $("projectReset").textContent = "Cancel Edit";
        switchPage("manage-projects");
        $("projectForm").scrollIntoView({ behavior: "smooth" });
      } else if (kind === "milestones") {
        fillForm(
          {
            id: "msId",
            year: "msYear",
            title: "msTitle",
            category: "msCategory",
            description: "msDesc",
          },
          item
        );
        $("msFormTitle").textContent = `Edit Milestone: ${item.title}`;
        $("msEditBadge").classList.remove("hidden");
        $("msSubmitBtn").textContent = "Update Milestone";
        $("msReset").textContent = "Cancel Edit";
        switchPage("manage-history");
        $("milestoneForm").scrollIntoView({ behavior: "smooth" });
      } else if (kind === "faculty") {
        fillForm(
          {
            id: "faId",
            name: "faName",
            designation: "faDesignation",
            specialization: "faSpec",
            publications: "faPubs",
            experience_years: "faExp",
            photo_url: "faPhoto",
          },
          item
        );
        $("faFormTitle").textContent = `Edit Faculty: ${item.name}`;
        $("faEditBadge").classList.remove("hidden");
        $("faSubmitBtn").textContent = "Update Faculty";
        $("faReset").textContent = "Cancel Edit";
        switchPage("manage-faculty");
        $("facultyForm").scrollIntoView({ behavior: "smooth" });
      } else if (kind === "labs") {
        fillForm(
          {
            id: "labId",
            name: "labName",
            description: "labDesc",
            photo_url: "labPhoto",
          },
          item
        );
        $("labFormTitle").textContent = `Edit Facility: ${item.name}`;
        $("labEditBadge").classList.remove("hidden");
        $("labSubmitBtn").textContent = "Update Facility";
        $("labReset").textContent = "Cancel Edit";
        switchPage("manage-faculty");
        $("labForm").scrollIntoView({ behavior: "smooth" });
      } else if (kind === "placements") {
        fillForm(
          {
            id: "plId",
            company: "plCompany",
            job_role: "plRole",
            year: "plYear",
            offers_count: "plOffers",
            package_lpa: "plPackage",
          },
          item
        );
        $("plFormTitle").textContent = `Edit Placement: ${item.company} (${item.year})`;
        $("plEditBadge").classList.remove("hidden");
        $("plSubmitBtn").textContent = "Update Placement";
        $("plReset").textContent = "Cancel Edit";
        switchPage("manage-placements");
        $("placementForm").scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  }
});

/* ==========================================================================
   NAVIGATION & MODAL LISTENERS
   ========================================================================== */
$("menuBtn").addEventListener("click", () => document.body.classList.toggle("nav-open"));
$("navOverlay").addEventListener("click", () => document.body.classList.remove("nav-open"));

$("staffLoginBtn").addEventListener("click", () => {
  $("loginModal").hidden = false;
  $("usernameInput").focus();
});

$("closeLogin").addEventListener("click", () => {
  $("loginModal").hidden = true;
});

$("loginModal").addEventListener("click", (e) => {
  if (e.target === $("loginModal")) $("loginModal").hidden = true;
});

$("guestViewBtn").addEventListener("click", () => switchPage("home"));

$("logoutBtn").addEventListener("click", () => {
  state.token = "";
  state.user = null;
  localStorage.removeItem(storageKey);
  setAuthUI(false);
  showToast("Logged out successfully", "info");
  switchPage("home");
});

/* ==========================================================================
   AUTHENTICATION FORM
   ========================================================================== */
$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  showError($("loginError"), "");
  const submitBtn = $("loginSubmitBtn");
  submitBtn.disabled = true;

  try {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: $("usernameInput").value.trim(),
        password: $("passwordInput").value,
      }),
    });

    state.token = data.access_token;
    localStorage.setItem(storageKey, data.access_token);
    state.user = await api("/auth/me");

    setAuthUI(true);
    $("loginModal").hidden = true;
    $("loginForm").reset();

    showToast(`Welcome back, ${state.user?.full_name || state.user?.username}`, "success");
    await loadStaffViews();
    switchPage("dashboard");
  } catch (err) {
    showError($("loginError"), err.message);
  } finally {
    submitBtn.disabled = false;
  }
});

/* ==========================================================================
   GLOBAL SEARCH & PUBLIC FILTERS
   ========================================================================== */
$("globalSearchForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = $("globalSearchInput").value.trim();
  if (!query) return;

  try {
    const data = await api(`/search?q=${encodeURIComponent(query)}`);
    renderSearch(query, data);
    switchPage("search");
  } catch (err) {
    showToast(err.message, "error");
  }
});

$("studentSearchForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const params = new URLSearchParams();
  const q = $("studentQuery").value.trim();
  const batch = $("studentBatch").value;
  if (q) params.set("q", q);
  if (batch) params.set("batch_year", batch);

  const qs = params.toString();
  renderStudents(await api(`/students${qs ? `?${qs}` : ""}`));
});

$("studentClearFilterBtn").addEventListener("click", async () => {
  $("studentQuery").value = "";
  $("studentBatch").value = "";
  renderStudents(await api("/students"));
});

$("projectSearchForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const q = $("projectQuery").value.trim();
  renderProjects(await api(`/projects${q ? `?q=${encodeURIComponent(q)}` : ""}`));
});

$("projectClearFilterBtn").addEventListener("click", async () => {
  $("projectQuery").value = "";
  renderProjects(await api("/projects"));
});

/* ==========================================================================
   GUEST INQUIRY / FEEDBACK SUBMISSION
   ========================================================================== */
$("feedbackForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  showError($("fbError"), "");
  $("fbOk").hidden = true;

  try {
    await api("/feedback", {
      method: "POST",
      body: JSON.stringify({
        name: $("fbName").value.trim(),
        email: $("fbEmail").value.trim(),
        kind: $("fbKind").value,
        subject: $("fbSubject").value.trim(),
        message: $("fbMessage").value.trim(),
      }),
    });

    $("feedbackForm").reset();
    $("fbOk").hidden = false;
    $("fbOk").textContent = "Thank you. Your message has been safely recorded in the department legacy inbox.";
    showToast("Inquiry submitted successfully", "success");
  } catch (err) {
    showError($("fbError"), err.message);
  }
});

/* ==========================================================================
   STAFF MANAGEMENT FORMS
   ========================================================================== */
// 1. Students
$("studentForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = $("studentId").value;
  const payload = formValues({
    roll_no: "stRoll",
    name: "stName",
    batch_year: "stBatch",
    email: "stEmail",
    phone: "stPhone",
    status: "stStatus",
    current_company: "stCompany",
    job_role: "stRole",
    career_notes: "stNotes",
  });

  try {
    await saveResource("/students", id, payload, "studentFormError", id ? "Student record updated" : "Student record created");
    resetStudentForm();
  } catch (_) {}
});
$("studentReset").addEventListener("click", resetStudentForm);

// 2. Projects
$("projectForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = $("projectId").value;
  const payload = formValues({
    title: "prTitle",
    year: "prYear",
    category: "prCategory",
    authors: "prAuthors",
    technologies: "prTech",
    description: "prDesc",
  });

  try {
    await saveResource("/projects", id, payload, "projectFormError", id ? "Archive item updated" : "Archive item added");
    resetProjectForm();
  } catch (_) {}
});
$("projectReset").addEventListener("click", resetProjectForm);

// 3. Milestones
$("milestoneForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = $("msId").value;
  const payload = formValues({
    year: "msYear",
    title: "msTitle",
    category: "msCategory",
    description: "msDesc",
  });

  try {
    await saveResource("/milestones", id, payload, "msError", id ? "Milestone updated" : "Milestone recorded");
    resetMilestoneForm();
  } catch (_) {}
});
$("msReset").addEventListener("click", resetMilestoneForm);

// 4. Faculty
$("facultyForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = $("faId").value;
  const payload = formValues({
    name: "faName",
    designation: "faDesignation",
    specialization: "faSpec",
    publications: "faPubs",
    experience_years: "faExp",
    photo_url: "faPhoto",
  });

  try {
    await saveResource("/faculty", id, payload, "faError", id ? "Faculty profile updated" : "Faculty profile saved");
    resetFacultyForm();
  } catch (_) {}
});
$("faReset").addEventListener("click", resetFacultyForm);

// 5. Labs
$("labForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = $("labId").value;
  const payload = formValues({
    name: "labName",
    description: "labDesc",
    photo_url: "labPhoto",
  });

  try {
    await saveResource("/labs", id, payload, "labError", id ? "Facility profile updated" : "Facility profile saved");
    resetLabForm();
  } catch (_) {}
});
$("labReset").addEventListener("click", resetLabForm);

// 6. Placements
$("placementForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = $("plId").value;
  const payload = formValues({
    company: "plCompany",
    job_role: "plRole",
    year: "plYear",
    offers_count: "plOffers",
    package_lpa: "plPackage",
  });

  try {
    await saveResource("/placements", id, payload, "plError", id ? "Placement record updated" : "Placement record saved");
    resetPlacementForm();
  } catch (_) {}
});
$("plReset").addEventListener("click", resetPlacementForm);

/* ==========================================================================
   APPLICATION BOOTSTRAP
   ========================================================================== */
async function boot() {
  try {
    if (state.token) {
      state.user = await api("/auth/me");
      setAuthUI(true);
      await loadStaffViews();
    } else {
      setAuthUI(false);
    }
  } catch {
    state.token = "";
    localStorage.removeItem(storageKey);
    setAuthUI(false);
  }
  await loadPublic();
}

boot().catch((err) => {
  $("homeStats").innerHTML = `<div class="card"><p style="color:var(--rose);">Could not connect to FastAPI backend. Ensure server is running on http://127.0.0.1:8000. (${escapeHtml(err.message)})</p></div>`;
});

