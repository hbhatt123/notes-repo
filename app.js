/*
 * app.js
 * ---------------------------------------------------------------
 * Original vanilla JS application logic: hash router, localStorage
 * state helpers, and render functions for each section. Reads all
 * content from the structures defined in data.js — this file has
 * no hard-coded topic text of its own.
 *
 * Organization:
 *   1. Storage keys + generic localStorage helpers
 *   2. Streak tracking
 *   3. Small utilities
 *   4. Router
 *   5. Render functions (one per section)
 *   6. Init
 * ---------------------------------------------------------------
 */

// ---------------------------------------------------------------
// 1. Storage keys + generic helpers
// ---------------------------------------------------------------

const STORAGE_KEYS = {
  dsaDone: "prep_dsa_done",
  topicsDone: "prep_topics_done",
  behavioralPrepared: "prep_behavioral_prepared",
  behavioralNotes: "prep_behavioral_notes",
  companiesDone: "prep_companies_done",
  companyNotes: "prep_company_notes",
  projectsDone: "prep_projects_done",
  projectNotes: "prep_project_notes",
  streak: "prep_streak",
  name: "prep_name",
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // localStorage unavailable (private browsing quota, etc.) — fail silently
  }
}

function getDoneSet(key) {
  return new Set(readJSON(key, []));
}

function toggleDone(key, id) {
  const set = getDoneSet(key);
  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
    recordActivity(); // only count forward progress toward the streak
  }
  writeJSON(key, Array.from(set));
  return set.has(id);
}

// ---------------------------------------------------------------
// 2. Streak tracking
// A "day" counts toward the streak only when the user marks
// something done or saves behavioral notes — opening the app
// passively does not extend it.
// ---------------------------------------------------------------

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(b) - new Date(a)) / msPerDay);
}

function getStreak() {
  const data = readJSON(STORAGE_KEYS.streak, { lastDate: null, streak: 0 });
  return data.streak || 0;
}

function recordActivity() {
  const today = todayStr();
  const data = readJSON(STORAGE_KEYS.streak, { lastDate: null, streak: 0 });

  if (data.lastDate === today) {
    return; // already counted today
  }

  if (data.lastDate) {
    const gap = daysBetween(data.lastDate, today);
    data.streak = gap === 1 ? data.streak + 1 : 1;
  } else {
    data.streak = 1;
  }

  data.lastDate = today;
  writeJSON(STORAGE_KEYS.streak, data);
}

// ---------------------------------------------------------------
// 3. Small utilities
// ---------------------------------------------------------------

function el(html) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html.trim();
  return wrapper.firstElementChild;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pct(done, total) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

function totalDsaProblems() {
  return DSA_CATEGORIES.reduce((sum, cat) => sum + cat.problems.length, 0);
}

function topicsInCategory(category) {
  return TOPICS.filter((t) => t.category === category);
}

const CATEGORY_META = {
  dsa: { name: "DSA", icon: "🧮", route: "dsa" },
  mldl: { name: "ML/DL Fundamentals", icon: "🧠", route: "mldl" },
  genai: { name: "GenAI & LLMs", icon: "✨", route: "genai" },
  sysdesign: { name: "ML System Design", icon: "🏗️", route: "sysdesign" },
  behavioral: { name: "Behavioral", icon: "🎤", route: "behavioral" },
  companies: { name: "Company Prep", icon: "🏢", route: "companies" },
  projects: { name: "Projects", icon: "💼", route: "projects" },
};

// ---------------------------------------------------------------
// 4. Router
// Supported hashes: #dashboard #dsa #dsa/<catId> #mldl #genai #sysdesign
//                   #topic/<id> #behavioral #companies #companies/<id>
//                   #projects #projects/<id>
// ---------------------------------------------------------------

function parseHash() {
  const hash = (location.hash || "#dashboard").replace(/^#/, "");
  const parts = hash.split("/");
  return { route: parts[0] || "dashboard", param: parts[1] || null };
}

function render() {
  const { route, param } = parseHash();
  const app = document.getElementById("app");
  app.innerHTML = "";

  let node;
  let activeRoute = route;
  switch (route) {
    case "dsa":
      if (param) {
        node = renderDSACategory(param);
      } else {
        node = renderDSA();
      }
      activeRoute = "dsa";
      break;
    case "mldl":
    case "genai":
    case "sysdesign":
      node = renderTopicList(route);
      break;
    case "topic": {
      node = renderTopicDetail(param);
      const topic = TOPICS.find((t) => t.id === param);
      activeRoute = topic ? topic.category : route;
      break;
    }
    case "behavioral":
      node = renderBehavioral();
      break;
    case "companies":
      node = param ? renderCompanyDetail(param) : renderCompanies();
      activeRoute = "companies";
      break;
    case "projects":
      node = param ? renderProjectDetail(param) : renderProjects();
      activeRoute = "projects";
      break;
    case "dashboard":
    default:
      node = renderDashboard();
      break;
  }

  app.appendChild(node);
  updateActiveNav(activeRoute);
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function updateActiveNav(route) {
  const links = document.querySelectorAll("#main-nav a");
  links.forEach((a) => {
    a.classList.toggle("active", a.getAttribute("data-route") === route);
  });
}

// ---------------------------------------------------------------
// 5. Render: Dashboard
// ---------------------------------------------------------------

function renderDashboard() {
  const container = el(`<section></section>`);

  const name = readJSON(STORAGE_KEYS.name, null) || "Himani";
  const totalDsa = totalDsaProblems();
  const doneDsa = getDoneSet(STORAGE_KEYS.dsaDone).size;

  const totalTopics = TOPICS.length;
  const doneTopics = getDoneSet(STORAGE_KEYS.topicsDone).size;

  const totalBehavioral = BEHAVIORAL_QUESTIONS.length;
  const donePrepared = getDoneSet(STORAGE_KEYS.behavioralPrepared).size;

  const totalCompanies = COMPANIES.length;
  const doneCompanies = getDoneSet(STORAGE_KEYS.companiesDone).size;

  const totalProjects = PROJECTS.length;
  const doneProjects = getDoneSet(STORAGE_KEYS.projectsDone).size;

  const grandTotal = totalDsa + totalTopics + totalBehavioral + totalCompanies + totalProjects;
  const grandDone = doneDsa + doneTopics + donePrepared + doneCompanies + doneProjects;
  const overallPct = pct(grandDone, grandTotal);

  const streak = getStreak();

  container.appendChild(
    el(`
    <div class="greeting-card">
      <div class="greeting-title">Welcome back, <span class="greeting-name" contenteditable="true" spellcheck="false" id="name-editable">${escapeHtml(
        name
      )}</span> 👋</div>
      <p class="greeting-sub">Here's where your interview prep stands today. Click your name above to change it.</p>
    </div>
  `)
  );

  container.appendChild(
    el(`
    <div class="stat-grid">
      <div class="stat-tile">
        <div class="stat-value">${overallPct}%</div>
        <div class="stat-label">Overall Progress</div>
      </div>
      <div class="stat-tile">
        <div class="stat-value">${doneDsa} / ${totalDsa}</div>
        <div class="stat-label">DSA Solved</div>
      </div>
      <div class="stat-tile">
        <div class="stat-value">${doneTopics} / ${totalTopics}</div>
        <div class="stat-label">Topics Mastered</div>
      </div>
      <div class="stat-tile">
        <div class="stat-value">${streak} 🔥</div>
        <div class="stat-label">Day Streak</div>
      </div>
    </div>
  `)
  );

  const catHeader = el(`
    <div class="section-header">
      <h2 class="section-title">Categories</h2>
      <p class="section-subtitle">Click any card to jump into that section.</p>
    </div>
  `);
  container.appendChild(catHeader);

  const grid = el(`<div class="category-grid"></div>`);

  const categoryCards = [
    {
      key: "dsa",
      count: totalDsa,
      done: doneDsa,
      route: "dsa",
    },
    {
      key: "mldl",
      count: topicsInCategory("mldl").length,
      done: topicsInCategory("mldl").filter((t) => getDoneSet(STORAGE_KEYS.topicsDone).has(t.id))
        .length,
      route: "mldl",
    },
    {
      key: "genai",
      count: topicsInCategory("genai").length,
      done: topicsInCategory("genai").filter((t) => getDoneSet(STORAGE_KEYS.topicsDone).has(t.id))
        .length,
      route: "genai",
    },
    {
      key: "sysdesign",
      count: topicsInCategory("sysdesign").length,
      done: topicsInCategory("sysdesign").filter((t) =>
        getDoneSet(STORAGE_KEYS.topicsDone).has(t.id)
      ).length,
      route: "sysdesign",
    },
    {
      key: "behavioral",
      count: totalBehavioral,
      done: donePrepared,
      route: "behavioral",
    },
    {
      key: "companies",
      count: totalCompanies,
      done: doneCompanies,
      route: "companies",
    },
    {
      key: "projects",
      count: totalProjects,
      done: doneProjects,
      route: "projects",
    },
  ];

  categoryCards.forEach((c) => {
    const meta = CATEGORY_META[c.key];
    const p = pct(c.done, c.count);
    const card = el(`
      <a class="category-card" href="#${c.route}">
        <div class="category-card-head">
          <span class="category-icon">${meta.icon}</span>
          <span class="category-name">${meta.name}</span>
        </div>
        <div class="category-count">${c.done} / ${c.count} complete</div>
        <div class="progress-track"><div class="progress-fill" style="width:${p}%"></div></div>
        <div class="progress-pct">${p}%</div>
      </a>
    `);
    grid.appendChild(card);
  });

  container.appendChild(grid);

  // Name edit -> persist on blur
  setTimeout(() => {
    const nameEl = document.getElementById("name-editable");
    if (nameEl) {
      nameEl.addEventListener("blur", () => {
        const val = nameEl.textContent.trim() || "Himani";
        writeJSON(STORAGE_KEYS.name, val);
      });
      nameEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          nameEl.blur();
        }
      });
    }
  }, 0);

  return container;
}

// ---------------------------------------------------------------
// 5b. Render: DSA
// ---------------------------------------------------------------

function renderDSA() {
  const container = el(`
    <section>
      <div class="section-header">
        <h2 class="section-title"><span>🧮</span> DSA Practice</h2>
        <p class="section-subtitle">Canonical problem names grouped by pattern. Click a category to open its problem grid.</p>
      </div>
      <div class="dsa-category-grid" id="dsa-category-grid"></div>
    </section>
  `);

  const grid = container.querySelector("#dsa-category-grid");
  const doneSet = getDoneSet(STORAGE_KEYS.dsaDone);

  DSA_CATEGORIES.forEach((cat) => {
    const doneCount = cat.problems.filter((p) => doneSet.has(p.id)).length;
    const p = pct(doneCount, cat.problems.length);

    const card = el(`
      <a class="dsa-category-card" href="#dsa/${cat.id}">
        <div class="category-card-head">
          <span class="category-icon">${cat.icon}</span>
          <span class="category-name">${escapeHtml(cat.name)}</span>
        </div>
        <div class="category-count">${doneCount} / ${cat.problems.length} solved</div>
        <div class="progress-track"><div class="progress-fill" style="width:${p}%"></div></div>
        <div class="progress-pct">${p}%</div>
      </a>
    `);

    grid.appendChild(card);
  });

  return container;
}

function renderDSACategory(catId) {
  const cat = DSA_CATEGORIES.find((c) => c.id === catId);
  if (!cat) {
    return el(`
      <section>
        <a class="back-link" href="#dsa">← Back to DSA Practice</a>
        <p>Category not found.</p>
      </section>
    `);
  }

  const doneSet = getDoneSet(STORAGE_KEYS.dsaDone);
  const doneCount = cat.problems.filter((p) => doneSet.has(p.id)).length;
  const p = pct(doneCount, cat.problems.length);

  // Optional category-level file attachments: [{ href: "assets/files/foo.pdf", label: "..." }]
  const attachmentsHtml = cat.attachments && cat.attachments.length
    ? `<div class="attachments-box">
         <h3>Attachments</h3>
         <ul>${cat.attachments
           .map(
             (a) =>
               `<li><a href="${escapeHtml(a.href)}" target="_blank" rel="noopener">📎 ${escapeHtml(a.label)}</a></li>`
           )
           .join("")}</ul>
       </div>`
    : "";

  const container = el(`
    <section>
      <a class="back-link" href="#dsa">← Back to DSA Practice</a>
      <div class="section-header">
        <h2 class="section-title"><span>${cat.icon}</span> ${escapeHtml(cat.name)}</h2>
        <p class="section-subtitle">${doneCount} / ${cat.problems.length} solved. Check a box to mark it solved — progress is saved automatically.</p>
      </div>
      <div class="progress-track dsa-category-detail-progress"><div class="progress-fill" style="width:${p}%"></div></div>
      ${attachmentsHtml}
      <div class="dsa-problem-list" id="dsa-problem-grid"></div>
    </section>
  `);

  const problemList = container.querySelector("#dsa-problem-grid");
  cat.problems.forEach((prob) => {
    const isDone = doneSet.has(prob.id);
    // Only real LeetCode problems carry a `leetcode` url — some entries
    // (Pandas/NumPy concepts, derived interview variants) have no LeetCode
    // equivalent and intentionally omit it.
    const leetcodeLink = prob.leetcode
      ? `<a class="dsa-problem-leetcode" href="${escapeHtml(prob.leetcode)}" target="_blank" rel="noopener">Solve on LeetCode ↗</a>`
      : "";
    const row = el(`
      <label class="dsa-problem ${isDone ? "is-done" : ""}" data-prob="${prob.id}">
        <input type="checkbox" ${isDone ? "checked" : ""} />
        <div class="dsa-problem-body">
          <div class="dsa-problem-name">
            ${escapeHtml(prob.name)}
            <span class="difficulty difficulty-${prob.difficulty}">${prob.difficulty}</span>
          </div>
          <div class="dsa-problem-hint">${escapeHtml(prob.hint)}</div>
          ${leetcodeLink}
        </div>
      </label>
    `);

    row.querySelector('input[type="checkbox"]').addEventListener("change", (e) => {
      e.stopPropagation();
      toggleDone(STORAGE_KEYS.dsaDone, prob.id);
      render();
    });

    const lcLink = row.querySelector(".dsa-problem-leetcode");
    if (lcLink) {
      // Prevent the enclosing <label> from also toggling the checkbox
      // when the user is just clicking through to LeetCode.
      lcLink.addEventListener("click", (e) => e.stopPropagation());
    }

    problemList.appendChild(row);
  });

  return container;
}

// ---------------------------------------------------------------
// 5c. Render: Topic list (mldl / genai / sysdesign)
// ---------------------------------------------------------------

function renderTopicList(category) {
  const meta = CATEGORY_META[category];
  const topics = topicsInCategory(category);
  const doneSet = getDoneSet(STORAGE_KEYS.topicsDone);
  const doneCount = topics.filter((t) => doneSet.has(t.id)).length;

  const container = el(`
    <section>
      <div class="section-header">
        <h2 class="section-title"><span>${meta.icon}</span> ${meta.name}</h2>
        <p class="section-subtitle">${doneCount} / ${topics.length} topics mastered. Click a title to read the full explanation.</p>
      </div>
      <div class="topic-grid" id="topic-grid"></div>
    </section>
  `);

  const grid = container.querySelector("#topic-grid");

  topics.forEach((t) => {
    const isDone = doneSet.has(t.id);
    const card = el(`
      <div class="topic-card ${isDone ? "is-done" : ""}" data-topic="${t.id}">
        <div class="topic-card-top">
          <span class="topic-title-link">${escapeHtml(t.title)}</span>
          <span class="tag tag-${t.tier}">${t.tier}</span>
        </div>
        <div class="topic-summary">${escapeHtml(t.summary)}</div>
        <div class="topic-card-bottom">
          <label class="checkbox-row">
            <input type="checkbox" ${isDone ? "checked" : ""} />
            Mastered
          </label>
        </div>
      </div>
    `);

    card.querySelector(".topic-title-link").addEventListener("click", () => {
      location.hash = `#topic/${t.id}`;
    });

    card.querySelector('input[type="checkbox"]').addEventListener("change", () => {
      toggleDone(STORAGE_KEYS.topicsDone, t.id);
      render();
    });

    grid.appendChild(card);
  });

  return container;
}

// ---------------------------------------------------------------
// 5d. Render: Topic detail
// ---------------------------------------------------------------

function renderTopicDetail(id) {
  const topic = TOPICS.find((t) => t.id === id);

  if (!topic) {
    return el(`
      <section>
        <div class="empty-note">Topic not found. <a href="#dashboard">Go back to the dashboard</a>.</div>
      </section>
    `);
  }

  const meta = CATEGORY_META[topic.category];
  const doneSet = getDoneSet(STORAGE_KEYS.topicsDone);
  const isDone = doneSet.has(topic.id);

  const paragraphs = topic.content
    .split(/\n\n+/)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");

  const keyPointsHtml = topic.keyPoints.map((k) => `<li>${escapeHtml(k)}</li>`).join("");
  const keyPointsBoxHtml = topic.keyPoints.length
    ? `<div class="keypoints-box">
         <h3>If you remember nothing else</h3>
         <ul>${keyPointsHtml}</ul>
       </div>`
    : "";

  // Optional flashcards: [{ q, a, example? }] — rendered as a click-to-flip grid.
  const flashcardsHtml = topic.flashcards && topic.flashcards.length
    ? `<div class="flashcards-section">
         <h3>Flashcards</h3>
         <p class="flashcards-hint">Click a card to flip it.</p>
         <div class="flashcard-grid">
           ${topic.flashcards
             .map(
               (fc, i) => `
             <div class="flashcard" data-flashcard="${i}">
               <div class="flashcard-inner">
                 <div class="flashcard-face flashcard-front">
                   <span class="flashcard-label">Q</span>
                   <p>${escapeHtml(fc.q)}</p>
                 </div>
                 <div class="flashcard-face flashcard-back">
                   <span class="flashcard-label">A</span>
                   <p>${escapeHtml(fc.a)}</p>
                   ${fc.example ? `<p class="flashcard-example">${escapeHtml(fc.example)}</p>` : ""}
                 </div>
               </div>
             </div>`
             )
             .join("")}
         </div>
       </div>`
    : "";

  // Optional image: { src: "assets/images/foo.png", alt: "..." }
  const imageHtml = topic.image
    ? `<img class="topic-image" src="${escapeHtml(topic.image.src)}" alt="${escapeHtml(topic.image.alt || "")}" />`
    : "";

  // Optional file attachments: [{ href: "assets/files/foo.pdf", label: "..." }]
  const attachmentsHtml = topic.attachments && topic.attachments.length
    ? `<div class="attachments-box">
         <h3>Attachments</h3>
         <ul>${topic.attachments
           .map(
             (a) =>
               `<li><a href="${escapeHtml(a.href)}" target="_blank" rel="noopener">📎 ${escapeHtml(a.label)}</a></li>`
           )
           .join("")}</ul>
       </div>`
    : "";

  const container = el(`
    <section>
      <a class="back-link" href="#${meta.route}">← Back to ${meta.name}</a>
      <div class="topic-detail-card">
        <div class="topic-detail-head">
          <div>
            <div class="topic-detail-title">${meta.icon} ${escapeHtml(topic.title)}</div>
            <span class="tag tag-${topic.tier}">${topic.tier}</span>
          </div>
          <label class="checkbox-row">
            <input type="checkbox" id="detail-checkbox" ${isDone ? "checked" : ""} />
            Mark mastered
          </label>
        </div>
        <p class="topic-detail-summary">${escapeHtml(topic.summary)}</p>
        ${imageHtml}
        <div class="topic-body">${paragraphs}</div>
        ${attachmentsHtml}
        ${keyPointsBoxHtml}
        ${flashcardsHtml}
      </div>
    </section>
  `);

  container.querySelector("#detail-checkbox").addEventListener("change", () => {
    toggleDone(STORAGE_KEYS.topicsDone, topic.id);
    render();
  });

  container.querySelectorAll(".flashcard").forEach((card) => {
    card.addEventListener("click", () => card.classList.toggle("is-flipped"));
  });

  return container;
}

// ---------------------------------------------------------------
// 5e. Render: Behavioral
// ---------------------------------------------------------------

let notesSaveTimer = null;

function renderBehavioral() {
  const preparedSet = getDoneSet(STORAGE_KEYS.behavioralPrepared);
  const notes = readJSON(STORAGE_KEYS.behavioralNotes, {});
  const doneCount = preparedSet.size;

  const container = el(`
    <section>
      <div class="section-header">
        <h2 class="section-title"><span>🎤</span> Behavioral Prep</h2>
        <p class="section-subtitle">${doneCount} / ${BEHAVIORAL_QUESTIONS.length} questions marked prepared.</p>
      </div>
      <div class="star-guide"><strong>STAR method:</strong> ${STAR_GUIDE}</div>
      <div id="behavioral-list"></div>
    </section>
  `);

  const list = container.querySelector("#behavioral-list");

  let lastGroup = null;
  BEHAVIORAL_QUESTIONS.forEach((q) => {
    if (q.group !== lastGroup) {
      list.appendChild(el(`<div class="behavioral-group-title">${escapeHtml(q.group)}</div>`));
      lastGroup = q.group;
    }

    const isPrepared = preparedSet.has(q.id);
    const noteValue = notes[q.id] || "";

    const card = el(`
      <div class="behavioral-card" data-q="${q.id}">
        <div class="behavioral-question">${escapeHtml(q.question)}</div>
        <textarea class="behavioral-notes" placeholder="Jot your Situation / Task / Action / Result notes here — autosaves as you type.">${escapeHtml(
          noteValue
        )}</textarea>
        <div class="behavioral-footer">
          <label class="checkbox-row">
            <input type="checkbox" ${isPrepared ? "checked" : ""} />
            Mark prepared
          </label>
          <span class="autosave-note" data-status>Autosaves locally</span>
        </div>
      </div>
    `);

    const textarea = card.querySelector("textarea");
    const statusEl = card.querySelector("[data-status]");

    textarea.addEventListener("input", () => {
      clearTimeout(notesSaveTimer);
      const allNotes = readJSON(STORAGE_KEYS.behavioralNotes, {});
      allNotes[q.id] = textarea.value;
      notesSaveTimer = setTimeout(() => {
        writeJSON(STORAGE_KEYS.behavioralNotes, allNotes);
        recordActivity();
        if (statusEl) {
          statusEl.textContent = "Saved ✓";
          setTimeout(() => {
            if (statusEl) statusEl.textContent = "Autosaves locally";
          }, 1500);
        }
      }, 500);
    });

    card.querySelector('input[type="checkbox"]').addEventListener("change", () => {
      toggleDone(STORAGE_KEYS.behavioralPrepared, q.id);
      render();
    });

    list.appendChild(card);
  });

  return container;
}

// ---------------------------------------------------------------
// 5f. Render: Company Prep
// ---------------------------------------------------------------

function renderCompanies() {
  const doneSet = getDoneSet(STORAGE_KEYS.companiesDone);
  const doneCount = COMPANIES.filter((c) => doneSet.has(c.id)).length;

  const container = el(`
    <section>
      <div class="section-header">
        <h2 class="section-title"><span>🏢</span> Company Prep</h2>
        <p class="section-subtitle">${doneCount} / ${COMPANIES.length} companies marked prepared. Click a card to open its prep plan.</p>
      </div>
      <div class="topic-grid" id="company-grid"></div>
    </section>
  `);

  const grid = container.querySelector("#company-grid");

  COMPANIES.forEach((c) => {
    const isDone = doneSet.has(c.id);
    const card = el(`
      <div class="topic-card ${isDone ? "is-done" : ""}" data-company="${c.id}">
        <div class="topic-card-top">
          <span class="topic-title-link">${escapeHtml(c.name)}</span>
        </div>
        <div class="topic-summary">Target: ${escapeHtml(c.targetDate || "TBD")} · ${c.rounds.length} round${c.rounds.length === 1 ? "" : "s"} · ${c.focusAreas.length} focus area${c.focusAreas.length === 1 ? "" : "s"}</div>
        <div class="topic-card-bottom">
          <label class="checkbox-row">
            <input type="checkbox" ${isDone ? "checked" : ""} />
            Prepared
          </label>
        </div>
      </div>
    `);

    card.querySelector(".topic-title-link").addEventListener("click", () => {
      location.hash = `#companies/${c.id}`;
    });

    card.querySelector('input[type="checkbox"]').addEventListener("change", () => {
      toggleDone(STORAGE_KEYS.companiesDone, c.id);
      render();
    });

    grid.appendChild(card);
  });

  return container;
}

function renderCompanyDetail(id) {
  const company = COMPANIES.find((c) => c.id === id);

  if (!company) {
    return el(`
      <section>
        <div class="empty-note">Company not found. <a href="#companies">Go back to Company Prep</a>.</div>
      </section>
    `);
  }

  const doneSet = getDoneSet(STORAGE_KEYS.companiesDone);
  const isDone = doneSet.has(company.id);
  const allNotes = readJSON(STORAGE_KEYS.companyNotes, {});
  const noteValue = allNotes[company.id] || "";

  const roundsHtml = company.rounds.map((r) => `<li>${escapeHtml(r)}</li>`).join("");
  const focusHtml = company.focusAreas.map((f) => `<li>${escapeHtml(f)}</li>`).join("");

  const resourcesHtml = company.resources && company.resources.length
    ? `<div class="attachments-box">
         <h3>Resources</h3>
         <ul>${company.resources
           .map((r) => `<li><a href="${escapeHtml(r.href)}" target="_blank" rel="noopener">🔗 ${escapeHtml(r.label)}</a></li>`)
           .join("")}</ul>
       </div>`
    : "";

  const container = el(`
    <section>
      <a class="back-link" href="#companies">← Back to Company Prep</a>
      <div class="topic-detail-card">
        <div class="topic-detail-head">
          <div>
            <div class="topic-detail-title">🏢 ${escapeHtml(company.name)}</div>
            <span class="tag tag-core">Target: ${escapeHtml(company.targetDate || "TBD")}</span>
          </div>
          <label class="checkbox-row">
            <input type="checkbox" id="detail-checkbox" ${isDone ? "checked" : ""} />
            Mark prepared
          </label>
        </div>

        <div class="keypoints-box">
          <h3>Interview Rounds</h3>
          <ul>${roundsHtml}</ul>
        </div>

        <div class="keypoints-box">
          <h3>Focus Areas</h3>
          <ul>${focusHtml}</ul>
        </div>

        ${resourcesHtml}

        <div class="behavioral-card company-notes-card">
          <div class="behavioral-question">Your prep notes</div>
          <textarea class="behavioral-notes" placeholder="Jot anything specific to this company's process, comp notes, referral contacts, practice plan, etc. — autosaves as you type.">${escapeHtml(noteValue)}</textarea>
          <div class="behavioral-footer">
            <span class="autosave-note" data-status>Autosaves locally</span>
          </div>
        </div>
      </div>
    </section>
  `);

  container.querySelector("#detail-checkbox").addEventListener("change", () => {
    toggleDone(STORAGE_KEYS.companiesDone, company.id);
    render();
  });

  const textarea = container.querySelector(".behavioral-notes");
  const statusEl = container.querySelector("[data-status]");
  textarea.addEventListener("input", () => {
    clearTimeout(notesSaveTimer);
    const notes = readJSON(STORAGE_KEYS.companyNotes, {});
    notes[company.id] = textarea.value;
    notesSaveTimer = setTimeout(() => {
      writeJSON(STORAGE_KEYS.companyNotes, notes);
      recordActivity();
      if (statusEl) {
        statusEl.textContent = "Saved ✓";
        setTimeout(() => {
          if (statusEl) statusEl.textContent = "Autosaves locally";
        }, 1500);
      }
    }, 500);
  });

  return container;
}

// ---------------------------------------------------------------
// 5g. Render: Projects
// ---------------------------------------------------------------

function renderProjects() {
  const doneSet = getDoneSet(STORAGE_KEYS.projectsDone);
  const doneCount = PROJECTS.filter((p) => doneSet.has(p.id)).length;

  const container = el(`
    <section>
      <div class="section-header">
        <h2 class="section-title"><span>💼</span> Projects</h2>
        <p class="section-subtitle">${doneCount} / ${PROJECTS.length} projects marked prepared. Click a card to open its notes.</p>
      </div>
      <div class="topic-grid" id="project-grid"></div>
    </section>
  `);

  const grid = container.querySelector("#project-grid");

  PROJECTS.forEach((p) => {
    const isDone = doneSet.has(p.id);
    const card = el(`
      <div class="topic-card ${isDone ? "is-done" : ""}" data-project="${p.id}">
        <div class="topic-card-top">
          <span class="topic-title-link">${escapeHtml(p.title)}</span>
        </div>
        <div class="topic-summary">${escapeHtml(p.blurb || "")}</div>
        <div class="topic-card-bottom">
          <label class="checkbox-row">
            <input type="checkbox" ${isDone ? "checked" : ""} />
            Prepared
          </label>
        </div>
      </div>
    `);

    card.querySelector(".topic-title-link").addEventListener("click", () => {
      location.hash = `#projects/${p.id}`;
    });

    card.querySelector('input[type="checkbox"]').addEventListener("change", () => {
      toggleDone(STORAGE_KEYS.projectsDone, p.id);
      render();
    });

    grid.appendChild(card);
  });

  return container;
}

function renderProjectDetail(id) {
  const project = PROJECTS.find((p) => p.id === id);

  if (!project) {
    return el(`
      <section>
        <div class="empty-note">Project not found. <a href="#projects">Go back to Projects</a>.</div>
      </section>
    `);
  }

  const doneSet = getDoneSet(STORAGE_KEYS.projectsDone);
  const isDone = doneSet.has(project.id);
  const allNotes = readJSON(STORAGE_KEYS.projectNotes, {});
  const noteValue = allNotes[project.id] || "";

  const container = el(`
    <section>
      <a class="back-link" href="#projects">← Back to Projects</a>
      <div class="topic-detail-card">
        <div class="topic-detail-head">
          <div>
            <div class="topic-detail-title">💼 ${escapeHtml(project.title)}</div>
          </div>
          <label class="checkbox-row">
            <input type="checkbox" id="detail-checkbox" ${isDone ? "checked" : ""} />
            Mark prepared
          </label>
        </div>
        <p class="topic-detail-summary">${escapeHtml(project.blurb || "")}</p>

        <div class="behavioral-card company-notes-card">
          <div class="behavioral-question">Your prep notes</div>
          <textarea class="behavioral-notes" placeholder="What it is, your role, tech stack, impact/results, questions you might get asked about it — autosaves as you type.">${escapeHtml(noteValue)}</textarea>
          <div class="behavioral-footer">
            <span class="autosave-note" data-status>Autosaves locally</span>
          </div>
        </div>
      </div>
    </section>
  `);

  container.querySelector("#detail-checkbox").addEventListener("change", () => {
    toggleDone(STORAGE_KEYS.projectsDone, project.id);
    render();
  });

  const textarea = container.querySelector(".behavioral-notes");
  const statusEl = container.querySelector("[data-status]");
  textarea.addEventListener("input", () => {
    clearTimeout(notesSaveTimer);
    const notes = readJSON(STORAGE_KEYS.projectNotes, {});
    notes[project.id] = textarea.value;
    notesSaveTimer = setTimeout(() => {
      writeJSON(STORAGE_KEYS.projectNotes, notes);
      recordActivity();
      if (statusEl) {
        statusEl.textContent = "Saved ✓";
        setTimeout(() => {
          if (statusEl) statusEl.textContent = "Autosaves locally";
        }, 1500);
      }
    }, 500);
  });

  return container;
}

// ---------------------------------------------------------------
// 6. Init
// ---------------------------------------------------------------

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
