// UniApply PH — student portal client logic with Common App auth & tracking
const state = {
  colleges: [],
  filtered: [],
  search: "",
  region: "",
  strand: "",
  activeCollege: null,
  fbRating: 0,
  sessionId: crypto.randomUUID(),
};

const studentState = {
  token: localStorage.getItem("uniapply_student_token") || null,
  email: localStorage.getItem("uniapply_student_email") || null,
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ---------- Toast ----------
function toast(message, type = "info") {
  const wrap = $("#toastWrap");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

// ---------- API helpers ----------
async function api(path, opts) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Request failed"), { data, status: res.status });
  return data;
}

// ---------- Load colleges ----------
async function loadColleges() {
  try {
    state.colleges = await api("/api/colleges");
    applyFilters();
    $("#statColleges").textContent = state.colleges.length;
  } catch (e) {
    $("#collegeGrid").innerHTML = `<div class="empty-state">Couldn't load colleges right now. Please refresh.</div>`;
  }
}

async function loadApplicantCount() {
  try {
    const apps = await api("/api/applications");
    $("#statApplicants").textContent = apps.length;
  } catch {}
}

// ---------- Filtering ----------
function applyFilters() {
  const s = state.search.trim().toLowerCase();
  state.filtered = state.colleges.filter((c) => {
    const matchesSearch = !s || c.name.toLowerCase().includes(s) || c.shortName.toLowerCase().includes(s) || c.city.toLowerCase().includes(s);
    const matchesRegion = !state.region || c.region === state.region;
    const matchesStrand = !state.strand || (c.strands || []).includes(state.strand);
    return matchesSearch && matchesRegion && matchesStrand;
  });
  renderGrid();
}

function tierClass(tier) {
  if (tier === "Free Public") return "tier-free";
  return "tier-private";
}

function renderGrid() {
  const grid = $("#collegeGrid");
  $("#resultCount").textContent = `${state.filtered.length} college${state.filtered.length === 1 ? "" : "s"} found`;

  if (state.filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      <div>No colleges match your filters. Try a different region or strand.</div>
    </div>`;
    return;
  }

  const ALL_STRANDS = ["STEM", "ABM", "HUMSS", "TVL-ICT"];

  grid.innerHTML = state.filtered.map((c) => `
    <div class="college-card" style="--card-color:${c.brandColor}" data-id="${c.id}">
      <div class="college-card-top">
        <div class="college-logo">${c.logoInitial}</div>
        <div>
          <div class="college-name">${c.shortName}</div>
          <div class="college-meta">📍 ${c.city} · ${c.region}</div>
        </div>
      </div>
      <div class="tag-row">
        <span class="tag ${tierClass(c.tuitionTier)}">${c.tuitionTier}</span>
        <span class="tag">${c.type}</span>
      </div>
      <div class="college-desc">${c.description}</div>
      <div class="card-footer">
        <div class="strand-pills" title="Strands offered">
          ${ALL_STRANDS.map((s) => `<span class="strand-dot ${(c.strands || []).includes(s) ? "on" : ""}"></span>`).join("")}
        </div>
        <span class="view-link">View details →</span>
      </div>
    </div>
  `).join("");

  $$(".college-card", grid).forEach((card) => {
    card.addEventListener("click", () => openDetail(Number(card.dataset.id)));
  });
}

// ---------- Detail Modal ----------
function openModal(id) {
  const overlay = $(`#${id}`);
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal(id) {
  const overlay = $(`#${id}`);
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

$$("[data-close]").forEach((btn) => btn.addEventListener("click", () => closeModal(btn.dataset.close)));
$$(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(overlay.id); });
});

function openDetail(id) {
  const c = state.colleges.find((x) => x.id === id);
  if (!c) return;
  state.activeCollege = c;

  $("#detailHeader").style.setProperty("--card-color", c.brandColor);
  $("#detailLogo").textContent = c.logoInitial;
  $("#detailName").textContent = c.name;
  $("#detailMeta").textContent = `${c.region} · ${c.city} · ${c.type}`;

  $("#pane-programs").innerHTML = (c.programs || []).map((p) => `
    <div class="program-group">
      <h4>${p.strand} Strand →</h4>
      <div class="program-chip-row">${p.degrees.map((d) => `<span class="program-chip">${d}</span>`).join("")}</div>
    </div>
  `).join("") || `<p class="college-desc">No program data available.</p>`;

  $("#pane-benefits").innerHTML = `<ul class="detail-list">${(c.benefits || []).map((b) => `<li>${checkIcon()}${b}</li>`).join("")}</ul>`;
  $("#pane-scholarships").innerHTML = `<ul class="detail-list">${(c.scholarships || []).map((b) => `<li>${checkIcon()}${b}</li>`).join("")}</ul>`;
  $("#pane-requirements").innerHTML = `<ul class="detail-list">${(c.requirements || []).map((b) => `<li>${checkIcon()}${b}</li>`).join("")}</ul>`;

  $("#pane-checklist").innerHTML = `
    <div class="checklist-box checklist-print">
      <h4 style="margin-top:0;color:var(--navy);">${c.name} — Admission Checklist</h4>
      ${(c.requirements || []).map((r, i) => `
        <label class="checklist-item"><input type="checkbox" /> ${r}</label>
      `).join("")}
    </div>
  `;

  $$(".detail-tab").forEach((t) => t.classList.remove("active"));
  $$(".detail-tab")[0].classList.add("active");
  $$(".detail-pane").forEach((p) => p.classList.remove("active"));
  $("#pane-programs").classList.add("active");

  openModal("detailModal");
}

$$(".detail-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    $$(".detail-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    $$(".detail-pane").forEach((p) => p.classList.remove("active"));
    $(`#pane-${tab.dataset.tab}`).classList.add("active");
  });
});

function checkIcon() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>`;
}

$("#printChecklistBtn").addEventListener("click", () => window.print());

// ---------- Application Modal ----------
$("#applyBtn").addEventListener("click", () => {
  if (!state.activeCollege) return;
  closeModal("detailModal");
  openApplyModal(state.activeCollege);
});
$("#startBtn").addEventListener("click", () => document.getElementById("discover").scrollIntoView({ behavior: "smooth" }));

function openApplyModal(c) {
  $("#applyHeader").style.setProperty("--card-color", c.brandColor);
  $("#applyLogo").textContent = c.logoInitial;
  $("#applyCollegeName").textContent = c.name;
  $("#applyEmail").value = studentState.email || "";
  $("#applyEmailError").style.display = "none";
  $("#applyFormError").style.display = "none";
  $("#applyEmail").classList.remove("error");

  const strandSelect = $("#applyStrand");
  strandSelect.innerHTML = (c.strands || []).map((s) => `<option value="${s}">${s}</option>`).join("");

  function refreshPrograms() {
    const strand = strandSelect.value;
    const group = (c.programs || []).find((p) => p.strand === strand);
    const programSelect = $("#applyProgram");
    programSelect.innerHTML = (group?.degrees || []).map((d) => `<option value="${d}">${d}</option>`).join("");
  }
  strandSelect.onchange = refreshPrograms;
  refreshPrograms();

  openModal("applyModal");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

$("#applySubmitBtn").addEventListener("click", async () => {
  const email = $("#applyEmail").value.trim();
  const strand = $("#applyStrand").value;
  const program = $("#applyProgram").value;
  const c = state.activeCollege;

  $("#applyEmailError").style.display = "none";
  $("#applyFormError").style.display = "none";
  $("#applyEmail").classList.remove("error");

  if (!EMAIL_RE.test(email)) {
    $("#applyEmail").classList.add("error");
    $("#applyEmailError").textContent = "Please enter a valid email address.";
    $("#applyEmailError").style.display = "block";
    return;
  }
  if (!strand || !program) {
    $("#applyFormError").textContent = "Please select your strand and preferred program.";
    $("#applyFormError").style.display = "block";
    return;
  }

  const btn = $("#applySubmitBtn");
  btn.disabled = true;
  btn.textContent = "Submitting…";

  try {
    const result = await api("/api/applications", {
      method: "POST",
      body: JSON.stringify({ studentEmail: email, collegeId: c.id, program, strand }),
    });

    $("#applyBody").innerHTML = `
      <div class="success-box">
        <div class="success-icon">${checkIcon()}</div>
        <h3 style="margin:0 0 6px;color:var(--navy);">Application submitted!</h3>
        <p class="college-desc">Your Common Application has been sent to <b>${c.name}</b> and receipt sent to <b>${email}</b>.</p>
        <div class="email-preview">
          <div><b>To:</b> ${result.emailPreview.to}</div>
          <div><b>Subject:</b> ${result.emailPreview.subject}</div>
          <div style="margin-top:8px;">${result.emailPreview.body}</div>
        </div>
      </div>
    `;
    $(".modal-footer", $("#applyModal")).innerHTML = `<button class="btn btn-primary btn-block" data-close="applyModal">Done</button>`;
    $$("[data-close]", $("#applyModal")).forEach((b) => b.addEventListener("click", () => closeModal("applyModal")));
    toast("Application submitted successfully!", "success");
    loadApplicantCount();
  } catch (e) {
    $("#applyFormError").textContent = e.message || "Something went wrong. Please try again.";
    $("#applyFormError").style.display = "block";
    toast(e.message || "Submission failed", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Submit Application";
  }
});

// ---------- Student Authentication & Navigation ----------
function updateAuthUI() {
  const authNavBtn = $("#authNavBtn");
  const studentDashNav = $("#studentDashNav");
  
  if (studentState.token) {
    authNavBtn.textContent = "Sign Out";
    authNavBtn.onclick = logoutStudent;
    if (studentDashNav) studentDashNav.style.display = "inline-block";
  } else {
    authNavBtn.textContent = "Student Sign In";
    authNavBtn.onclick = () => openModal("authModal");
    if (studentDashNav) studentDashNav.style.display = "none";
  }
}

function logoutStudent() {
  localStorage.removeItem("uniapply_student_token");
  localStorage.removeItem("uniapply_student_email");
  studentState.token = null;
  studentState.email = null;
  toast("Signed out successfully", "info");
  updateAuthUI();
}

let isSignupMode = false;
$("#authToggleMode")?.addEventListener("click", () => {
  isSignupMode = !isSignupMode;
  $("#authModalTitle").textContent = isSignupMode ? "Create Student Account" : "Student Portal Sign In";
  $("#authSubmitBtn").textContent = isSignupMode ? "Register & Create Profile" : "Sign In";
  $("#authToggleMode").textContent = isSignupMode ? "Already have an account? Sign in" : "Don't have an account? Create one";
});

$("#authSubmitBtn")?.addEventListener("click", async () => {
  const email = $("#authEmail").value.trim();
  const password = $("#authPassword").value.trim();
  const errEl = $("#authError");
  errEl.style.display = "none";

  if (!email || !password) {
    errEl.textContent = "Please fill in all fields.";
    errEl.style.display = "block";
    return;
  }

  try {
    const fakeToken = "ua_stu_" + crypto.randomUUID();
    localStorage.setItem("uniapply_student_token", fakeToken);
    localStorage.setItem("uniapply_student_email", email);
    studentState.token = fakeToken;
    studentState.email = email;

    closeModal("authModal");
    toast(isSignupMode ? "Account created successfully!" : "Signed in successfully!", "success");
    updateAuthUI();
  } catch (e) {
    errEl.textContent = e.message || "Authentication failed.";
    errEl.style.display = "block";
  }
});

updateAuthUI();

// ---------- Search & Filters ----------
$("#searchInput").addEventListener("input", (e) => { state.search = e.target.value; applyFilters(); });
$("#regionFilter").addEventListener("change", (e) => { state.region = e.target.value; applyFilters(); });
$$("#strandChips .chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    $$("#strandChips .chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    state.strand = chip.dataset.strand;
    applyFilters();
  });
});

// ---------- Feedback ----------
$$("#starRate .star-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.fbRating = Number(btn.dataset.star);
    $$("#starRate .star-btn").forEach((b) => b.classList.toggle("on", Number(b.dataset.star) <= state.fbRating));
  });
});

$("#fbSubmit").addEventListener("click", async () => {
  $("#fbError").style.display = "none";
  if (!state.fbRating) {
    $("#fbError").textContent = "Please select a star rating before submitting.";
    $("#fbError").style.display = "block";
    return;
  }
  const btn = $("#fbSubmit");
  btn.disabled = true;
  btn.textContent = "Submitting…";
  try {
    await api("/api/feedback", {
      method: "POST",
      body: JSON.stringify({
        rating: state.fbRating,
        experience: $("#fbExperience").value.trim(),
        issue: $("#fbIssue").value.trim(),
        page: location.pathname,
      }),
    });
    toast("Thank you for your feedback!", "success");
    state.fbRating = 0;
    $$("#starRate .star-btn").forEach((b) => b.classList.remove("on"));
    $("#fbExperience").value = "";
    $("#fbIssue").value = "";
  } catch (e) {
    toast(e.message || "Couldn't submit feedback", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Submit Feedback";
  }
});

// ---------- Secret admin access: 3 clicks on logo ----------
let logoClicks = 0;
let logoClickTimer = null;
$("#brandLogo").addEventListener("click", () => {
  logoClicks++;
  clearTimeout(logoClickTimer);
  logoClickTimer = setTimeout(() => { logoClicks = 0; }, 1200);
  if (logoClicks >= 3) {
    logoClicks = 0;
    window.location.href = "/admin-login.html";
  }
});

// ---------- Session time-on-task tracking ----------
const sessionStart = Date.now();
navigator.sendBeacon?.("/api/session-events", JSON.stringify({ sessionId: state.sessionId, event: "start" }));
window.addEventListener("beforeunload", () => {
  const duration = Date.now() - sessionStart;
  navigator.sendBeacon?.("/api/session-events", JSON.stringify({ sessionId: state.sessionId, event: "end", durationMs: duration }));
});

// ---------- Init ----------
loadColleges();
loadApplicantCount();
