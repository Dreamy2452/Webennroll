// UniApply PH — Admin Dashboard Client Logic

const ADMIN_TOKEN_KEY = "uniapply_admin_token";

const state = {
  colleges: [],
  applications: [],
  errors: [],
  analytics: {},
  editingCollegeId: null,
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ---------- API Helper ----------
async function api(path, opts = {}) {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(opts.headers || {}),
  };

  const res = await fetch(path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Request failed"), { data, status: res.status });
  return data;
}

// ---------- Authentication ----------
function checkAuth() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) {
    $("#loginScreen").style.display = "none";
    $("#dash").style.display = "block";
    loadDashboardData();
  } else {
    $("#loginScreen").style.display = "flex";
    $("#dash").style.display = "none";
  }
}

$("#loginBtn").addEventListener("click", async () => {
  const password = $("#pwInput").value.trim();
  const errEl = $("#loginError");
  errEl.style.display = "none";

  try {
    const res = await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    localStorage.setItem(ADMIN_TOKEN_KEY, res.token);
    $("#pwInput").value = "";
    checkAuth();
  } catch (e) {
    errEl.style.display = "block";
  }
});

$("#logoutBtn").addEventListener("click", () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  checkAuth();
});

// ---------- Tabs ----------
$$(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".tab-btn").forEach((b) => b.classList.remove("active"));
    $$(".tab-pane").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    $(`#tab-${btn.dataset.tab}`).classList.add("active");
  });
});

// ---------- Dashboard Data Loading ----------
async function loadDashboardData() {
  try {
    const [analytics, colleges, applications, errors] = await Promise.all([
      api("/api/admin/analytics"),
      api("/api/colleges"),
      api("/api/admin/applications"),
      api("/api/admin/errors"),
    ]);

    state.analytics = analytics;
    state.colleges = colleges;
    state.applications = applications;
    state.errors = errors;

    renderOverview();
    renderColleges();
    renderApplications();
    renderErrors();
  } catch (e) {
    console.error("Failed to load admin data", e);
  }
}

// ---------- Render Overview ----------
function renderOverview() {
  const a = state.analytics || {};
  $("#statApplicants").textContent = a.totalApplicants ?? state.applications.length;
  $("#statTot").textContent = a.avgTimeOnTaskFormatted || "2m 14s";
  $("#statErrors").textContent = state.errors.length;
  $("#statRating").textContent = a.avgRating ? `${a.avgRating} / 5.0` : "4.8 / 5.0";

  // Strand Breakdown Table
  const strandRows = Object.entries(a.strandCounts || {}).map(([strand, count]) => `
    <tr><td><b>${strand}</b></td><td>${count} applicants</td></tr>
  `).join("");
  $("#strandBreakdown").innerHTML = `<table><thead><tr><th>Strand</th><th>Applications</th></tr></thead><tbody>${strandRows || '<tr><td colspan="2">No data yet</td></tr>'}</tbody></table>`;

  // Region Breakdown Table
  const regionRows = Object.entries(a.regionCounts || {}).map(([region, count]) => `
    <tr><td><b>${region}</b></td><td>${count} colleges</td></tr>
  `).join("");
  $("#regionBreakdown").innerHTML = `<table><thead><tr><th>Region</th><th>Total Colleges</th></tr></thead><tbody>${regionRows || '<tr><td colspan="2">No data yet</td></tr>'}</tbody></table>`;
}

// ---------- Render & Manage Colleges (CRUD) ----------
function renderColleges() {
  $("#collegeCount").textContent = state.colleges.length;
  const list = $("#collegeList");

  if (state.colleges.length === 0) {
    list.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No colleges added yet.</p>`;
    return;
  }

  list.innerHTML = `<table>
    <thead><tr><th>Name</th><th>Region</th><th>Type</th><th>Tier</th><th>Actions</th></tr></thead>
    <tbody>
      ${state.colleges.map((c) => `
        <tr>
          <td><b>${c.name}</b> (${c.shortName})</td>
          <td>${c.region} · ${c.city}</td>
          <td>${c.type}</td>
          <td>${c.tuitionTier}</td>
          <td>
            <button class="icon-btn" onclick="editCollege(${c.id})">Edit</button>
            <button class="icon-btn" style="color:#dc2626; border-color:#fecaca;" onclick="deleteCollege(${c.id})">Delete</button>
          </td>
        </tr>
      `).join("")}
    </tbody>
  </table>`;
}

// Parse helper for comma-separated inputs
const parseList = (str) => (str ? str.split(",").map((s) => s.trim()).filter(Boolean) : []);

// Parse programs input: Strand: Deg1, Deg2 | Strand2: Deg3
function parsePrograms(str) {
  if (!str) return [];
  return str.split("|").map((group) => {
    const parts = group.split(":");
    if (parts.length < 2) return null;
    return {
      strand: parts[0].trim(),
      degrees: parts[1].split(",").map((d) => d.trim()).filter(Boolean),
    };
  }).filter(Boolean);
}

$("#collegeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: $("#f_name").value.trim(),
    shortName: $("#f_shortName").value.trim(),
    region: $("#f_region").value,
    city: $("#f_city").value.trim(),
    type: $("#f_type").value,
    tuitionTier: $("#f_tuitionTier").value,
    brandColor: $("#f_brandColor").value,
    logoInitial: $("#f_logoInitial").value.trim() || $("#f_shortName").value.slice(0, 3).toUpperCase(),
    strands: parseList($("#f_strands").value),
    programs: parsePrograms($("#f_programs").value),
    benefits: parseList($("#f_benefits").value),
    scholarships: parseList($("#f_scholarships").value),
    requirements: parseList($("#f_requirements").value),
    applicationUrl: $("#f_applicationUrl").value.trim(),
    contactEmail: $("#f_contactEmail").value.trim(),
    description: $("#f_description").value.trim(),
  };

  try {
    if (state.editingCollegeId) {
      await api(`/api/colleges/${state.editingCollegeId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      alert("College updated successfully!");
    } else {
      await api("/api/colleges", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      alert("College added successfully!");
    }

    resetCollegeForm();
    loadDashboardData();
  } catch (err) {
    alert("Error saving college: " + (err.message || "Unknown error"));
  }
});

window.editCollege = function(id) {
  const c = state.colleges.find((x) => x.id === id);
  if (!c) return;

  state.editingCollegeId = c.id;
  $("#collegeFormTitle").textContent = `Edit College: ${c.name}`;
  $("#collegeFormSubmit").textContent = "Update College";
  $("#resetFormBtn").style.display = "inline-block";

  $("#f_name").value = c.name || "";
  $("#f_shortName").value = c.shortName || "";
  $("#f_region").value = c.region || "NCR";
  $("#f_city").value = c.city || "";
  $("#f_type").value = c.type || "Public";
  $("#f_tuitionTier").value = c.tuitionTier || "Free Public";
  $("#f_brandColor").value = c.brandColor || "#0d9488";
  $("#f_logoInitial").value = c.logoInitial || "";
  $("#f_strands").value = (c.strands || []).join(", ");
  
  // Format programs back to string representation
  $("#f_programs").value = (c.programs || []).map((p) => `${p.strand}: ${p.degrees.join(", ")}`).join(" | ");
  
  $("#f_benefits").value = (c.benefits || []).join(", ");
  $("#f_scholarships").value = (c.scholarships || []).join(", ");
  $("#f_requirements").value = (c.requirements || []).join(", ");
  $("#f_applicationUrl").value = c.applicationUrl || "";
  $("#f_contactEmail").value = c.contactEmail || "";
  $("#f_description").value = c.description || "";

  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.deleteCollege = async function(id) {
  if (!confirm("Are you sure you want to delete this college?")) return;
  try {
    await api(`/api/colleges/${id}`, { method: "DELETE" });
    loadDashboardData();
  } catch (err) {
    alert("Failed to delete college");
  }
};

function resetCollegeForm() {
  state.editingCollegeId = null;
  $("#collegeFormTitle").textContent = "Add New College";
  $("#collegeFormSubmit").textContent = "Add College";
  $("#resetFormBtn").style.display = "none";
  $("#collegeForm").reset();
  $("#f_brandColor").value = "#0d9488";
}

$("#resetFormBtn").addEventListener("click", resetCollegeForm);

// ---------- Render Applications Log ----------
function renderApplications() {
  const tbody = $("#appTableBody");
  const apps = state.applications;

  if (apps.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No applications submitted yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = apps.map((a) => `
    <tr>
      <td>${a.studentEmail}</td>
      <td><b>${a.collegeName || 'College #' + a.collegeId}</b></td>
      <td>${a.program}</td>
      <td><span class="tag">${a.strand}</span></td>
      <td><span class="tag" style="background:#f0fdf4; color:#166534; border-color:#bbf7d0;">Submitted</span></td>
      <td>${new Date(a.createdAt || Date.now()).toLocaleDateString()}</td>
    </tr>
  `).join("");
}

$("#appSearch").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = state.applications.filter((a) => 
    a.studentEmail.toLowerCase().includes(q) || (a.collegeName || "").toLowerCase().includes(q)
  );
  const tbody = $("#appTableBody");
  tbody.innerHTML = filtered.map((a) => `
    <tr>
      <td>${a.studentEmail}</td>
      <td><b>${a.collegeName || 'College #' + a.collegeId}</b></td>
      <td>${a.program}</td>
      <td><span class="tag">${a.strand}</span></td>
      <td><span class="tag" style="background:#f0fdf4; color:#166534; border-color:#bbf7d0;">Submitted</span></td>
      <td>${new Date(a.createdAt || Date.now()).toLocaleDateString()}</td>
    </tr>
  `).join("") || `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No matching applications found.</td></tr>`;
});

$("#exportCsvBtn").addEventListener("click", () => {
  if (state.applications.length === 0) {
    alert("No data to export.");
    return;
  }
  let csv = "Email,College,Program,Strand,Date\n";
  state.applications.forEach((a) => {
    csv += `"${a.studentEmail}","${a.collegeName || a.collegeId}","${a.program}","${a.strand}","${a.createdAt || ''}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "uniapply-applications.csv";
  anchor.click();
  URL.revokeObjectURL(url);
});

// ---------- Render Error Logs ----------
function renderErrors() {
  const tbody = $("#errorTableBody");
  const errs = state.errors;

  if (errs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No errors or friction logged. System running smoothly.</td></tr>`;
    return;
  }

  tbody.innerHTML = errs.map((e) => `
    <tr>
      <td><span class="tag" style="background:#fef2f2; color:#991b1b; border-color:#fecaca;">${e.type || 'Error'}</span></td>
      <td>${e.message}</td>
      <td>${e.context || 'N/A'}</td>
      <td>${new Date(e.timestamp || Date.now()).toLocaleString()}</td>
    </tr>
  `).join("");
}

// Initial check on load
checkAuth();
