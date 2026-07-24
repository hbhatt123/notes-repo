/*
 * admin.js
 * ---------------------------------------------------------------
 * Optional "edit from the browser" layer on top of the read-mostly
 * dashboard. Nothing here runs unless a GitHub token is saved via
 * the Settings panel — without one, the site behaves exactly as
 * before (read + localStorage progress only).
 *
 * When a token is present, forms injected into the DSA/topic/
 * company/project pages commit new entries straight to data.js in
 * this GitHub repo via the Contents API, using the string-aware
 * editing helpers in gh-edit.js. Every edit is validated with
 * `new Function(source)` (a syntax-only parse, never executed)
 * before it's pushed, so a bug here can only fail loudly and abort
 * — it can't silently corrupt data.js on GitHub.
 *
 * Organization:
 *   1. Config + token storage
 *   2. GitHub Contents API wrapper (base64/utf8, get/put file)
 *   3. Generic modal form helper
 *   4. Settings panel
 *   5. Add-entry actions (topic, DSA problem, company, project, attachment)
 *   6. Page hooks (inject buttons after each app.js render)
 * ---------------------------------------------------------------
 */

(function () {
  "use strict";

  // ---------------------------------------------------------------
  // 1. Config + token storage
  // ---------------------------------------------------------------

  const GH_OWNER = "hbhatt123";
  const GH_REPO = "notes-repo";
  const GH_BRANCH = "main";
  const TOKEN_KEY = "prep_gh_token";

  function getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function setToken(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      // ignore
    }
  }

  // ---------------------------------------------------------------
  // 2. GitHub Contents API wrapper
  // ---------------------------------------------------------------

  function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function base64ToUtf8(b64) {
    return decodeURIComponent(escape(atob(b64.replace(/\n/g, ""))));
  }

  async function ghRequest(path, options) {
    const token = getToken();
    if (!token) throw new Error("No GitHub token saved. Open Settings to add one.");
    const res = await fetch("https://api.github.com" + path, {
      ...options,
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/vnd.github+json",
        ...(options && options.headers ? options.headers : {}),
      },
    });
    if (!res.ok) {
      let detail = "";
      try {
        const body = await res.json();
        detail = body.message || "";
      } catch (e) {
        // ignore
      }
      throw new Error("GitHub API " + res.status + (detail ? ": " + detail : ""));
    }
    return res.json();
  }

  async function ghGetTextFile(repoPath) {
    const data = await ghRequest(
      `/repos/${GH_OWNER}/${GH_REPO}/contents/${repoPath}?ref=${GH_BRANCH}`,
      { method: "GET" }
    );
    return { content: base64ToUtf8(data.content), sha: data.sha };
  }

  async function ghPutTextFile(repoPath, content, message, sha) {
    return ghRequest(`/repos/${GH_OWNER}/${GH_REPO}/contents/${repoPath}`, {
      method: "PUT",
      body: JSON.stringify({
        message,
        content: utf8ToBase64(content),
        branch: GH_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });
  }

  // `base64Content` is raw base64 (e.g. from FileReader), not utf8-wrapped.
  async function ghPutBinaryFile(repoPath, base64Content, message) {
    return ghRequest(`/repos/${GH_OWNER}/${GH_REPO}/contents/${repoPath}`, {
      method: "PUT",
      body: JSON.stringify({
        message,
        content: base64Content,
        branch: GH_BRANCH,
      }),
    });
  }

  async function ghValidateToken() {
    const data = await ghRequest(`/repos/${GH_OWNER}/${GH_REPO}`, { method: "GET" });
    return !!(data.permissions && data.permissions.push);
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result; // "data:<mime>;base64,AAAA..."
        const b64 = String(result).split(",")[1] || "";
        resolve(b64);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // Validates JS syntax without executing it (Function() only parses
  // and compiles the body; it isn't called). Throws on syntax error.
  function assertValidJs(source) {
    new Function(source); // eslint-disable-line no-new-func
  }

  // ---------------------------------------------------------------
  // 3. Generic modal form helper
  // ---------------------------------------------------------------

  function closeModal() {
    const existing = document.getElementById("admin-modal-overlay");
    if (existing) existing.remove();
  }

  // fields: [{ key, label, type: 'text'|'textarea'|'select'|'file', options?, placeholder? }]
  function openFormModal({ title, description, fields, submitLabel, onSubmit }) {
    closeModal();

    const overlay = document.createElement("div");
    overlay.id = "admin-modal-overlay";
    overlay.className = "admin-modal-overlay";

    const fieldsHtml = fields
      .map((f) => {
        if (f.type === "textarea") {
          return `
            <label class="admin-field">
              <span>${f.label}</span>
              <textarea data-key="${f.key}" placeholder="${f.placeholder || ""}" rows="${f.rows || 4}">${escapeHtml(f.value || "")}</textarea>
            </label>`;
        }
        if (f.type === "select") {
          const opts = f.options
            .map((o) => `<option value="${o}" ${o === f.value ? "selected" : ""}>${o}</option>`)
            .join("");
          return `
            <label class="admin-field">
              <span>${f.label}</span>
              <select data-key="${f.key}">${opts}</select>
            </label>`;
        }
        if (f.type === "file") {
          return `
            <label class="admin-field">
              <span>${f.label}</span>
              <input type="file" data-key="${f.key}" accept="${f.accept || ""}" />
            </label>`;
        }
        return `
          <label class="admin-field">
            <span>${f.label}</span>
            <input type="text" data-key="${f.key}" placeholder="${f.placeholder || ""}" value="${escapeHtml(f.value || "")}" />
          </label>`;
      })
      .join("");

    overlay.innerHTML = `
      <div class="admin-modal">
        <div class="admin-modal-head">
          <h3>${title}</h3>
          <button type="button" class="admin-modal-close" aria-label="Close">✕</button>
        </div>
        ${description ? `<p class="admin-modal-desc">${description}</p>` : ""}
        <form class="admin-form">
          ${fieldsHtml}
          <div class="admin-modal-status" data-status></div>
          <div class="admin-modal-actions">
            <button type="button" class="btn-secondary admin-cancel">Cancel</button>
            <button type="submit" class="btn-primary">${submitLabel || "Save"}</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector(".admin-modal-close").addEventListener("click", closeModal);
    overlay.querySelector(".admin-cancel").addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });

    const form = overlay.querySelector(".admin-form");
    const statusEl = overlay.querySelector("[data-status]");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const values = {};
      fields.forEach((f) => {
        const el = form.querySelector(`[data-key="${f.key}"]`);
        values[f.key] = f.type === "file" ? (el.files && el.files[0]) : el.value;
      });

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      statusEl.textContent = "Saving to GitHub…";
      statusEl.className = "admin-modal-status";

      try {
        await onSubmit(values);
        statusEl.textContent = "Saved ✓";
        setTimeout(closeModal, 700);
      } catch (err) {
        statusEl.textContent = "Failed: " + err.message;
        statusEl.className = "admin-modal-status admin-modal-status-error";
        submitBtn.disabled = false;
      }
    });

    return overlay;
  }

  function requireTokenOrPrompt() {
    if (getToken()) return true;
    openSettingsPanel();
    return false;
  }

  // ---------------------------------------------------------------
  // 4. Settings panel
  // ---------------------------------------------------------------

  function openSettingsPanel() {
    closeModal();
    const overlay = document.createElement("div");
    overlay.id = "admin-modal-overlay";
    overlay.className = "admin-modal-overlay";
    const hasToken = !!getToken();

    overlay.innerHTML = `
      <div class="admin-modal">
        <div class="admin-modal-head">
          <h3>⚙️ Settings — GitHub Sync</h3>
          <button type="button" class="admin-modal-close" aria-label="Close">✕</button>
        </div>
        <p class="admin-modal-desc">
          Paste a GitHub personal access token to enable "+ Add" buttons that commit
          new entries directly to <code>${GH_OWNER}/${GH_REPO}</code>. Use a
          <strong>fine-grained token scoped only to this repository</strong> with
          "Contents: Read and write" permission — nothing else. The token is stored
          only in this browser's local storage and is never sent anywhere except
          api.github.com.
        </p>
        <form class="admin-form">
          <label class="admin-field">
            <span>Personal access token</span>
            <input type="password" data-key="token" placeholder="github_pat_..." value="${hasToken ? "••••••••••••••••" : ""}" />
          </label>
          <div class="admin-modal-status" data-status>${hasToken ? "Currently connected." : "Not connected — add a token to enable editing."}</div>
          <div class="admin-modal-actions">
            <button type="button" class="btn-secondary admin-clear-token">Clear token</button>
            <button type="submit" class="btn-primary">Save & test</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector(".admin-modal-close").addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });

    overlay.querySelector(".admin-clear-token").addEventListener("click", () => {
      setToken("");
      closeModal();
      renderAdminHooks();
    });

    const form = overlay.querySelector(".admin-form");
    const statusEl = overlay.querySelector("[data-status]");
    const tokenInput = form.querySelector('[data-key="token"]');

    tokenInput.addEventListener("focus", () => {
      if (tokenInput.value.startsWith("••")) tokenInput.value = "";
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const val = tokenInput.value.trim();
      if (!val || val.startsWith("••")) {
        statusEl.textContent = "Enter a token first.";
        statusEl.className = "admin-modal-status admin-modal-status-error";
        return;
      }
      statusEl.textContent = "Checking token…";
      statusEl.className = "admin-modal-status";
      setToken(val);
      try {
        const canPush = await ghValidateToken();
        if (!canPush) throw new Error("Token doesn't have write access to this repo.");
        statusEl.textContent = "Connected ✓ — you can close this now.";
        renderAdminHooks();
      } catch (err) {
        setToken("");
        statusEl.textContent = "Failed: " + err.message;
        statusEl.className = "admin-modal-status admin-modal-status-error";
      }
    });
  }

  // ---------------------------------------------------------------
  // 5. Add + Edit entry actions
  // ---------------------------------------------------------------

  async function commitDataJsEdit(mutateFn, commitMessage) {
    const { content, sha } = await ghGetTextFile("data.js");
    const newContent = mutateFn(content);
    assertValidJs(newContent); // throws before anything is pushed if malformed
    await ghPutTextFile("data.js", newContent, commitMessage, sha);
    return newContent;
  }

  function uniqueId(base, existingIds) {
    let id = base || "item";
    let n = 2;
    while (existingIds.has(id)) {
      id = base + "-" + n;
      n++;
    }
    return id;
  }

  function linesOf(text) {
    return text.split("\n").map((s) => s.trim()).filter(Boolean);
  }

  // --- Shared text builders (used by both Add and Edit) -------------------

  function buildTopicText(id, category, values) {
    const keyPoints = linesOf(values.keyPoints)
      .map((s) => `      "${GhEdit.jsStringEscape(s)}"`)
      .join(",\n");
    return (
`{
    id: "${id}",
    title: "${GhEdit.jsStringEscape(values.title)}",
    category: "${category}",
    tier: "${values.tier}",
    summary: "${GhEdit.jsStringEscape(values.summary)}",
    content:
\`${GhEdit.jsTemplateEscape(values.content.trim())}\`,
    keyPoints: [
${keyPoints}
    ]
  }`
    );
  }

  function topicFromValues(id, category, values) {
    return {
      id,
      title: values.title,
      category,
      tier: values.tier,
      summary: values.summary,
      content: values.content.trim(),
      keyPoints: linesOf(values.keyPoints),
    };
  }

  function buildDsaProblemText(id, values) {
    const leetcodePart = values.leetcode.trim()
      ? ` leetcode: "${GhEdit.jsStringEscape(values.leetcode.trim())}",`
      : "";
    return `{ id: "${id}", name: "${GhEdit.jsStringEscape(values.name)}", difficulty: "${values.difficulty}",${leetcodePart} hint: "${GhEdit.jsStringEscape(values.hint)}" }`;
  }

  function dsaProblemFromValues(id, values) {
    return {
      id,
      name: values.name,
      difficulty: values.difficulty,
      ...(values.leetcode.trim() ? { leetcode: values.leetcode.trim() } : {}),
      hint: values.hint,
    };
  }

  function buildCompanyText(id, values) {
    const rounds = linesOf(values.rounds);
    const focusAreas = linesOf(values.focusAreas);
    const roundsText = rounds.map((r) => `      "${GhEdit.jsStringEscape(r)}"`).join(",\n");
    const focusText = focusAreas.map((f) => `      "${GhEdit.jsStringEscape(f)}"`).join(",\n");
    return (
`{
    id: "${id}",
    name: "${GhEdit.jsStringEscape(values.name)}",
    targetDate: "${GhEdit.jsStringEscape(values.targetDate || "TBD")}",
    rounds: [
${roundsText || '      "TBD"'}
    ],
    focusAreas: [
${focusText || '      "TBD"'}
    ]
  }`
    );
  }

  function companyFromValues(id, values) {
    return {
      id,
      name: values.name,
      targetDate: values.targetDate || "TBD",
      rounds: linesOf(values.rounds).length ? linesOf(values.rounds) : ["TBD"],
      focusAreas: linesOf(values.focusAreas).length ? linesOf(values.focusAreas) : ["TBD"],
    };
  }

  function buildProjectText(id, values) {
    return `{ id: "${id}", title: "${GhEdit.jsStringEscape(values.title)}", blurb: "${GhEdit.jsStringEscape(values.blurb || "")}" }`;
  }

  function projectFromValues(id, values) {
    return { id, title: values.title, blurb: values.blurb || "" };
  }

  // --- Topic: Add + Edit ---------------------------------------------------

  function openAddTopicForm(category) {
    if (!requireTokenOrPrompt()) return;
    const meta = CATEGORY_META[category];
    openFormModal({
      title: `+ Add topic to ${meta.name}`,
      submitLabel: "Add topic",
      fields: [
        { key: "title", label: "Title", type: "text", placeholder: "e.g. Speculative Decoding" },
        { key: "tier", label: "Tier", type: "select", options: ["core", "common", "advanced"] },
        { key: "summary", label: "One-sentence summary", type: "text" },
        { key: "content", label: "Content (blank line = new paragraph)", type: "textarea", rows: 8 },
        { key: "keyPoints", label: "Key points (one per line)", type: "textarea", rows: 4 },
      ],
      onSubmit: async (values) => {
        if (!values.title || !values.summary || !values.content) {
          throw new Error("Title, summary, and content are required.");
        }
        const existingIds = new Set(TOPICS.map((t) => t.id));
        const id = uniqueId(GhEdit.slugify(values.title), existingIds);
        const elementText = buildTopicText(id, category, values);

        await commitDataJsEdit(
          (src) => GhEdit.appendTopLevelArrayItem(src, "TOPICS", elementText, 2),
          `Add topic: ${values.title} (via UI)`
        );
        TOPICS.push(topicFromValues(id, category, values));
        render();
      },
    });
  }

  function openEditTopicForm(topicId) {
    if (!requireTokenOrPrompt()) return;
    const topic = TOPICS.find((t) => t.id === topicId);
    if (!topic) return;
    openFormModal({
      title: `✏️ Edit topic: ${topic.title}`,
      submitLabel: "Save changes",
      fields: [
        { key: "title", label: "Title", type: "text", value: topic.title },
        { key: "tier", label: "Tier", type: "select", options: ["core", "common", "advanced"], value: topic.tier },
        { key: "summary", label: "One-sentence summary", type: "text", value: topic.summary },
        { key: "content", label: "Content (blank line = new paragraph)", type: "textarea", rows: 8, value: topic.content },
        { key: "keyPoints", label: "Key points (one per line)", type: "textarea", rows: 4, value: topic.keyPoints.join("\n") },
      ],
      onSubmit: async (values) => {
        if (!values.title || !values.summary || !values.content) {
          throw new Error("Title, summary, and content are required.");
        }
        const elementText = buildTopicText(topicId, topic.category, values);

        await commitDataJsEdit(
          (src) => GhEdit.replaceObjectById(src, "TOPICS", topicId, elementText),
          `Edit topic: ${values.title} (via UI)`
        );
        const idx = TOPICS.findIndex((t) => t.id === topicId);
        TOPICS[idx] = topicFromValues(topicId, topic.category, values);
        render();
      },
    });
  }

  // --- DSA problem: Add + Edit ---------------------------------------------

  function openAddDsaProblemForm(categoryId) {
    if (!requireTokenOrPrompt()) return;
    const cat = DSA_CATEGORIES.find((c) => c.id === categoryId);
    openFormModal({
      title: `+ Add problem to ${cat.name}`,
      submitLabel: "Add problem",
      fields: [
        { key: "name", label: "Problem name", type: "text", placeholder: "e.g. Rotate Array" },
        { key: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Medium", "Hard"] },
        { key: "hint", label: "Hint (one line, not a solution)", type: "text" },
        { key: "leetcode", label: "LeetCode URL (optional, leave blank if none)", type: "text", placeholder: "https://leetcode.com/problems/..." },
      ],
      onSubmit: async (values) => {
        if (!values.name || !values.hint) throw new Error("Name and hint are required.");
        const existingIds = new Set(cat.problems.map((p) => p.id));
        const prefix = categoryId.split("-").map((w) => w[0]).join("");
        const id = uniqueId(prefix + "-" + GhEdit.slugify(values.name), existingIds);
        const elementText = buildDsaProblemText(id, values);

        await commitDataJsEdit((src) => {
          const { objStart, objEnd } = GhEdit.findObjectById(src, "DSA_CATEGORIES", categoryId);
          return GhEdit.appendToObjectField(src, objStart, objEnd, "problems", elementText, 6, "icon");
        }, `Add DSA problem: ${values.name} (via UI)`);

        cat.problems.push(dsaProblemFromValues(id, values));
        render();
      },
    });
  }

  function openEditDsaProblemForm(categoryId, problemId) {
    if (!requireTokenOrPrompt()) return;
    const cat = DSA_CATEGORIES.find((c) => c.id === categoryId);
    const problem = cat.problems.find((p) => p.id === problemId);
    if (!problem) return;
    openFormModal({
      title: `✏️ Edit problem: ${problem.name}`,
      submitLabel: "Save changes",
      fields: [
        { key: "name", label: "Problem name", type: "text", value: problem.name },
        { key: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Medium", "Hard"], value: problem.difficulty },
        { key: "hint", label: "Hint (one line, not a solution)", type: "text", value: problem.hint },
        { key: "leetcode", label: "LeetCode URL (optional, leave blank if none)", type: "text", value: problem.leetcode || "" },
      ],
      onSubmit: async (values) => {
        if (!values.name || !values.hint) throw new Error("Name and hint are required.");
        const elementText = buildDsaProblemText(problemId, values);

        await commitDataJsEdit(
          (src) => GhEdit.replaceObjectById(src, "DSA_CATEGORIES", problemId, elementText),
          `Edit DSA problem: ${values.name} (via UI)`
        );
        const idx = cat.problems.findIndex((p) => p.id === problemId);
        cat.problems[idx] = dsaProblemFromValues(problemId, values);
        render();
      },
    });
  }

  // --- Company: Add + Edit --------------------------------------------------

  function openAddCompanyForm() {
    if (!requireTokenOrPrompt()) return;
    openFormModal({
      title: "+ Add company",
      submitLabel: "Add company",
      fields: [
        { key: "name", label: "Company name", type: "text" },
        { key: "targetDate", label: "Target date", type: "text", placeholder: "e.g. 2026-09-01 or TBD" },
        { key: "rounds", label: "Interview rounds (one per line)", type: "textarea", rows: 4 },
        { key: "focusAreas", label: "Focus areas (one per line)", type: "textarea", rows: 3 },
      ],
      onSubmit: async (values) => {
        if (!values.name) throw new Error("Company name is required.");
        const existingIds = new Set(COMPANIES.map((c) => c.id));
        const id = uniqueId(GhEdit.slugify(values.name), existingIds);
        const elementText = buildCompanyText(id, values);

        await commitDataJsEdit(
          (src) => GhEdit.appendTopLevelArrayItem(src, "COMPANIES", elementText, 2),
          `Add company: ${values.name} (via UI)`
        );
        COMPANIES.push(companyFromValues(id, values));
        render();
      },
    });
  }

  function openEditCompanyForm(companyId) {
    if (!requireTokenOrPrompt()) return;
    const company = COMPANIES.find((c) => c.id === companyId);
    if (!company) return;
    openFormModal({
      title: `✏️ Edit company: ${company.name}`,
      submitLabel: "Save changes",
      description: company.resources && company.resources.length
        ? "Note: resource links aren't editable from this form yet — they'll be kept as-is."
        : "",
      fields: [
        { key: "name", label: "Company name", type: "text", value: company.name },
        { key: "targetDate", label: "Target date", type: "text", value: company.targetDate },
        { key: "rounds", label: "Interview rounds (one per line)", type: "textarea", rows: 4, value: company.rounds.join("\n") },
        { key: "focusAreas", label: "Focus areas (one per line)", type: "textarea", rows: 3, value: company.focusAreas.join("\n") },
      ],
      onSubmit: async (values) => {
        if (!values.name) throw new Error("Company name is required.");
        const elementText = buildCompanyText(companyId, values);

        await commitDataJsEdit(
          (src) => GhEdit.replaceObjectById(src, "COMPANIES", companyId, elementText),
          `Edit company: ${values.name} (via UI)`
        );
        const idx = COMPANIES.findIndex((c) => c.id === companyId);
        const updated = companyFromValues(companyId, values);
        if (company.resources) updated.resources = company.resources; // preserved as-is, form doesn't edit these
        COMPANIES[idx] = updated;
        render();
      },
    });
  }

  // --- Project: Add + Edit --------------------------------------------------

  function openAddProjectForm() {
    if (!requireTokenOrPrompt()) return;
    openFormModal({
      title: "+ Add project",
      submitLabel: "Add project",
      fields: [
        { key: "title", label: "Project title", type: "text" },
        { key: "blurb", label: "One-line description", type: "text" },
      ],
      onSubmit: async (values) => {
        if (!values.title) throw new Error("Project title is required.");
        const existingIds = new Set(PROJECTS.map((p) => p.id));
        const id = uniqueId(GhEdit.slugify(values.title), existingIds);
        const elementText = buildProjectText(id, values);

        await commitDataJsEdit(
          (src) => GhEdit.appendTopLevelArrayItem(src, "PROJECTS", elementText, 2),
          `Add project: ${values.title} (via UI)`
        );
        PROJECTS.push(projectFromValues(id, values));
        render();
      },
    });
  }

  function openEditProjectForm(projectId) {
    if (!requireTokenOrPrompt()) return;
    const project = PROJECTS.find((p) => p.id === projectId);
    if (!project) return;
    openFormModal({
      title: `✏️ Edit project: ${project.title}`,
      submitLabel: "Save changes",
      fields: [
        { key: "title", label: "Project title", type: "text", value: project.title },
        { key: "blurb", label: "One-line description", type: "text", value: project.blurb },
      ],
      onSubmit: async (values) => {
        if (!values.title) throw new Error("Project title is required.");
        const elementText = buildProjectText(projectId, values);

        await commitDataJsEdit(
          (src) => GhEdit.replaceObjectById(src, "PROJECTS", projectId, elementText),
          `Edit project: ${values.title} (via UI)`
        );
        const idx = PROJECTS.findIndex((p) => p.id === projectId);
        PROJECTS[idx] = projectFromValues(projectId, values);
        render();
      },
    });
  }

  function openAddAttachmentForm({ containerArrayName, itemId, itemLabel, anchorFieldName, targetArray }) {
    if (!requireTokenOrPrompt()) return;
    openFormModal({
      title: `+ Add attachment to ${itemLabel}`,
      description: "Images go to <code>assets/images/</code>, everything else (PDFs, etc.) goes to <code>assets/files/</code>.",
      submitLabel: "Upload & attach",
      fields: [
        { key: "file", label: "File", type: "file" },
        { key: "label", label: "Label (shown as the link text)", type: "text", placeholder: "e.g. Company comp bands (PDF)" },
      ],
      onSubmit: async (values) => {
        if (!values.file) throw new Error("Choose a file first.");
        if (!values.label) throw new Error("Label is required.");

        const file = values.file;
        const isImage = file.type.startsWith("image/");
        const folder = isImage ? "assets/images" : "assets/files";
        const ext = (file.name.split(".").pop() || "bin").toLowerCase();
        const baseName = GhEdit.slugify(file.name.replace(/\.[^.]+$/, "")) || "file";
        let repoPath = `${folder}/${itemId}-${baseName}.${ext}`;

        const base64 = await readFileAsBase64(file);

        try {
          await ghPutBinaryFile(repoPath, base64, `Upload attachment for ${itemLabel} (via UI)`);
        } catch (err) {
          // Path collision — retry once with a short unique suffix.
          if (String(err.message).includes("422")) {
            repoPath = `${folder}/${itemId}-${baseName}-${Date.now().toString(36)}.${ext}`;
            await ghPutBinaryFile(repoPath, base64, `Upload attachment for ${itemLabel} (via UI)`);
          } else {
            throw err;
          }
        }

        const elementText = `{ href: "${repoPath}", label: "${GhEdit.jsStringEscape(values.label)}" }`;
        await commitDataJsEdit((src) => {
          const { objStart, objEnd } = GhEdit.findObjectById(src, containerArrayName, itemId);
          return GhEdit.appendToObjectField(src, objStart, objEnd, "attachments", elementText, 6, anchorFieldName);
        }, `Attach file to ${itemLabel} (via UI)`);

        const target = targetArray.find((x) => x.id === itemId);
        if (!target.attachments) target.attachments = [];
        target.attachments.push({ href: repoPath, label: values.label });
        render();
      },
    });
  }

  // ---------------------------------------------------------------
  // 6. Page hooks — inject "+ Add" buttons after each app.js render
  // ---------------------------------------------------------------

  function makeAddButton(label, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "admin-add-btn";
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function makeEditButton(onClick, label) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "admin-edit-btn";
    btn.title = "Edit";
    btn.textContent = label || "✏️ Edit";
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // don't trigger a card's own click-to-navigate/checkbox handlers
      onClick();
    });
    return btn;
  }

  // Groups a detail page's existing "Mark ... / checkbox-row" control together
  // with a new Edit button, so they sit as one flex item on the right side of
  // .topic-detail-head instead of the edit button spreading the row apart.
  function addEditButtonToDetailHead(app, onClick) {
    const head = app.querySelector(".topic-detail-head");
    if (!head) return;
    const checkboxRow = head.querySelector(".checkbox-row");
    const wrapper = document.createElement("div");
    wrapper.className = "admin-head-actions";
    if (checkboxRow) {
      head.insertBefore(wrapper, checkboxRow);
      wrapper.appendChild(checkboxRow);
    } else {
      head.appendChild(wrapper);
    }
    wrapper.appendChild(makeEditButton(onClick));
  }

  function renderAdminHooks() {
    const gearExisting = document.getElementById("admin-settings-gear");
    if (!gearExisting) {
      const gear = document.createElement("button");
      gear.id = "admin-settings-gear";
      gear.type = "button";
      gear.className = "admin-settings-gear";
      gear.title = "GitHub sync settings";
      gear.textContent = "⚙️";
      gear.addEventListener("click", openSettingsPanel);
      document.querySelector(".topbar-inner").appendChild(gear);
    }

    if (!getToken()) return; // nothing else to inject until connected

    const { route, param } = parseHash();
    const app = document.getElementById("app");
    const sectionHeader = app.querySelector(".section-header");

    if (route === "mldl" || route === "genai" || route === "sysdesign") {
      if (sectionHeader) sectionHeader.appendChild(makeAddButton("+ Add topic", () => openAddTopicForm(route)));
      app.querySelectorAll(".topic-card[data-topic]").forEach((card) => {
        const id = card.getAttribute("data-topic");
        const bottom = card.querySelector(".topic-card-bottom");
        if (bottom) bottom.appendChild(makeEditButton(() => openEditTopicForm(id), "✏️"));
      });
    }

    if (route === "dsa" && param) {
      if (sectionHeader) {
        sectionHeader.appendChild(makeAddButton("+ Add problem", () => openAddDsaProblemForm(param)));
      }
      const attachBox = app.querySelector(".attachments-box");
      const anchor = attachBox || app.querySelector(".dsa-category-detail-progress");
      if (anchor) {
        const cat = DSA_CATEGORIES.find((c) => c.id === param);
        const btn = makeAddButton("+ Add attachment", () =>
          openAddAttachmentForm({
            containerArrayName: "DSA_CATEGORIES",
            itemId: param,
            itemLabel: cat.name,
            anchorFieldName: "icon",
            targetArray: DSA_CATEGORIES,
          })
        );
        btn.classList.add("admin-add-btn-block");
        anchor.insertAdjacentElement("afterend", btn);
      }
      // Per-problem edit icon on each card in the grid.
      app.querySelectorAll(".dsa-problem[data-prob]").forEach((card) => {
        const probId = card.getAttribute("data-prob");
        const body = card.querySelector(".dsa-problem-body");
        if (body) {
          body.appendChild(makeEditButton(() => openEditDsaProblemForm(param, probId), "✏️ Edit"));
        }
      });
    }

    if (route === "companies" && !param) {
      if (sectionHeader) sectionHeader.appendChild(makeAddButton("+ Add company", openAddCompanyForm));
      app.querySelectorAll(".topic-card[data-company]").forEach((card) => {
        const id = card.getAttribute("data-company");
        const bottom = card.querySelector(".topic-card-bottom");
        if (bottom) bottom.appendChild(makeEditButton(() => openEditCompanyForm(id), "✏️"));
      });
    }

    if (route === "companies" && param) {
      addEditButtonToDetailHead(app, () => openEditCompanyForm(param));
    }

    if (route === "projects" && !param) {
      if (sectionHeader) sectionHeader.appendChild(makeAddButton("+ Add project", openAddProjectForm));
      app.querySelectorAll(".topic-card[data-project]").forEach((card) => {
        const id = card.getAttribute("data-project");
        const bottom = card.querySelector(".topic-card-bottom");
        if (bottom) bottom.appendChild(makeEditButton(() => openEditProjectForm(id), "✏️"));
      });
    }

    if (route === "projects" && param) {
      addEditButtonToDetailHead(app, () => openEditProjectForm(param));
    }

    if (route === "topic" && param) {
      const topic = TOPICS.find((t) => t.id === param);
      const card = app.querySelector(".topic-detail-card");
      if (topic && card) {
        addEditButtonToDetailHead(app, () => openEditTopicForm(param));

        const btn = makeAddButton("+ Add attachment", () =>
          openAddAttachmentForm({
            containerArrayName: "TOPICS",
            itemId: param,
            itemLabel: topic.title,
            anchorFieldName: "tier",
            targetArray: TOPICS,
          })
        );
        btn.classList.add("admin-add-btn-block");
        const keypoints = card.querySelector(".keypoints-box");
        (keypoints || card).insertAdjacentElement("beforebegin", btn);
      }
    }
  }

  window.addEventListener("hashchange", () => setTimeout(renderAdminHooks, 0));
  window.addEventListener("DOMContentLoaded", () => setTimeout(renderAdminHooks, 0));
})();
