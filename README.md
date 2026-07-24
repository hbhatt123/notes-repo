# Interview Prep Dashboard

A tiny, static, single-page dashboard for tracking AI/ML and data science
interview prep. Plain HTML/CSS/JS — no build step, no npm, no framework.
Open `index.html` directly in a browser, or serve the folder with any
static file server. The only network calls it ever makes are to
`api.github.com`, and only if you've opted in via Settings (see below) —
with no token saved, it's 100% local, no network calls at all.

## Files

- `index.html` — the single page. Contains the nav bar and an empty
  `<main id="app">` that gets filled in by JavaScript based on the URL hash.
- `styles.css` — all visual styling (indigo/purple, card-based, light mode).
- `data.js` — **all content lives here.** Topic write-ups, DSA problem
  lists, and behavioral questions are plain JavaScript arrays/objects.
- `app.js` — the router, localStorage helpers, and render functions.
  It knows how to *display* the data in `data.js`, but contains no
  topic text of its own.
- `gh-edit.js` — pure, dependency-free helpers that insert new entries
  into `data.js`'s source text (string-aware bracket matching, not a
  full JS parser). No DOM, no network — usable in Node for testing.
- `admin.js` — the optional "add from the browser" layer. Adds a
  Settings gear and, once a GitHub token is saved, "+ Add" buttons that
  commit straight to this repo via the GitHub Contents API.

## How routing works

The app uses hash-based routing, so it works from a `file://` URL with
zero server setup:

- `#dashboard` — overview, stats, category cards
- `#dsa` — grid of DSA categories
- `#dsa/<categoryId>` — grid of problem cards for one category
- `#mldl`, `#genai`, `#sysdesign` — topic list for that category
- `#topic/<id>` — full detail view for one topic
- `#behavioral` — STAR guide, question bank, notes
- `#companies` — grid of companies you're prepping for
- `#companies/<id>` — one company's rounds, focus areas, resources, notes
- `#projects` — grid of your projects
- `#projects/<id>` — one project's freeform prep notes

`app.js` listens for `hashchange` and re-renders `#app` accordingly.

## Progress tracking

Everything is persisted in the browser's `localStorage` — nothing is
sent over the network:

- `prep_dsa_done` — array of solved DSA problem ids
- `prep_topics_done` — array of mastered topic ids
- `prep_behavioral_prepared` — array of "prepared" behavioral question ids
- `prep_behavioral_notes` — object mapping question id → your STAR notes
- `prep_companies_done` — array of "prepared" company ids
- `prep_company_notes` — object mapping company id → your freeform notes
- `prep_projects_done` — array of "prepared" project ids
- `prep_project_notes` — object mapping project id → your freeform notes
- `prep_streak` — `{ lastDate, streak }`, updated whenever you check
  something off or save notes (not just on page load)
- `prep_name` — the editable name shown on the dashboard greeting

Clearing site data / localStorage resets all progress.

## How to add or edit content

Everything you'd want to change lives in `data.js`. No other file needs
to be touched.

### Add or edit a topic (ML/DL, GenAI, or System Design)

Add an object to the `TOPICS` array:

```js
{
  id: "my-new-topic",              // unique slug, used in the URL
  title: "My New Topic",
  category: "mldl",                // 'mldl' | 'genai' | 'sysdesign'
  tier: "core",                    // 'core' | 'common' | 'advanced'
  summary: "One or two sentence teaser shown on the card.",
  content: `First paragraph.

Second paragraph, separated by a blank line.`,
  keyPoints: [
    "First takeaway",
    "Second takeaway",
  ],
}
```

It will automatically show up in its category's list and be reachable
at `#topic/my-new-topic`.

### Add or edit a DSA problem

Find (or add) a category in `DSA_CATEGORIES`, then add an object to its
`problems` array:

```js
{ id: "as-my-problem", name: "My Problem", difficulty: "Medium", hint: "A short original nudge, not a solution." }
```

To add a whole new category, copy the shape of an existing entry in
`DSA_CATEGORIES` (`id`, `name`, `icon`, `problems`).

To link a problem to LeetCode, add a `leetcode` field with the exact
problem URL — only include it if the problem is a real LeetCode
problem (the Pandas/NumPy entries and a couple of derived interview
variants aren't, and intentionally have no link):

```js
{ id: "as-two-sum", name: "Two Sum", difficulty: "Easy", leetcode: "https://leetcode.com/problems/two-sum/", hint: "..." }
```

### Add or edit a behavioral question

Add an object to `BEHAVIORAL_QUESTIONS`:

```js
{ id: "bq-my-question", group: "Leadership", question: "Tell me about a time..." }
```

`group` just controls which heading the question is clustered under on
the page — use an existing group name or introduce a new one.

### Add an image or PDF to a topic

1. Drop the file into `assets/images/` (images) or `assets/files/` (PDFs,
   slides, etc.) — create the folders if they don't exist.
2. Reference it from that topic's object in `data.js`:

```js
{
  id: "activation-functions",
  ...
  image: { src: "assets/images/relu-vs-gelu.png", alt: "ReLU vs GELU curves" },
  attachments: [
    { href: "assets/files/activation-cheatsheet.pdf", label: "Activation function cheat sheet" },
  ],
  content: `...`,
}
```

`image` renders once, right under the summary. `attachments` renders as
a list of download/open links right after the body text. Both are
optional — omit either field if a topic doesn't need it.

GitHub hard-caps individual files at 100MB (way more than you'd ever
need here) — keep images reasonably compressed so the site stays fast
to load.

### Add or edit a company prep plan

Add an object to the `COMPANIES` array:

```js
{
  id: "my-company",                  // unique slug, used in the URL
  name: "My Company",
  targetDate: "2026-09-01",          // freeform string — any format you like
  rounds: ["Recruiter screen", "Onsite: coding", "Onsite: system design"],
  focusAreas: ["Whatever this company's loop actually emphasizes"],
  resources: [                       // optional
    { label: "Engineering blog", href: "https://..." },
  ],
}
```

The freeform notes box on the company's detail page isn't part of this
object — it's typed directly on the page and autosaves to
`prep_company_notes`.

### Add or edit a project

Add an object to the `PROJECTS` array:

```js
{ id: "my-project", title: "My Project", blurb: "One-line description shown on the card." }
```

Same as companies — the actual prep content is a single freeform notes
box on the project's detail page, autosaved to `prep_project_notes`.

## Adding and editing content from the browser (GitHub sync)

Instead of editing `data.js` by hand, you can add and edit topics, DSA
problems, companies, and projects (plus add file attachments) directly
from the UI — each one commits straight to this repo on GitHub, and
the site redeploys automatically like any other push.

- **"+ Add ..."** buttons appear on each section's list page.
- **"✏️ Edit"** buttons/icons appear on existing cards and detail
  pages — they open the same form, pre-filled, and overwrite that
  entry in place (same id, no duplicate created).

### One-time setup

1. On GitHub, go to **Settings → Developer settings → Personal access
   tokens → Fine-grained tokens → Generate new token**.
2. Set **Repository access** to **Only select repositories** → this
   repo (`notes-repo`) — not "All repositories."
3. Under **Permissions → Repository permissions**, set **Contents** to
   **Read and write**. Leave everything else at "No access."
4. Generate the token and copy it (starts with `github_pat_`).
5. On the live site, click the ⚙️ gear icon (top right of the nav bar),
   paste the token, and save. It'll validate against the repo before
   saving as "connected."

### What this does and doesn't do

- The token is stored **only** in this browser's `localStorage`, for
  this site's origin. It's never sent anywhere except `api.github.com`.
- Scoped this way, the absolute worst case if it ever leaked is that
  someone could read/write files in *this one repo* — not your other
  repos, not your GitHub account, not anything on your device.
- "+ Add" and "✏️ Edit" controls only appear once a token is saved and
  validated — with no token, the site is exactly the read +
  local-progress-only tool it always was.
- Every edit is checked for valid JavaScript syntax (via a parse-only
  `new Function(...)` check) *before* it's pushed — if that check
  fails, nothing is sent to GitHub.
- There's still no in-UI way to *delete* an entry, edit a company's
  resource links, or edit flashcards/images — those remain a `data.js`
  + git job for now.
- Click "Clear token" in Settings any time to disconnect.

## Notes

- All ids should stay unique across their respective arrays — they're
  used as localStorage keys and (for topics/companies/projects) as URL
  fragments.
- There's no build step: after editing `data.js`, just refresh the page.
