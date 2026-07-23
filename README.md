# Interview Prep Dashboard

A tiny, static, single-page dashboard for tracking AI/ML and data science
interview prep. Plain HTML/CSS/JS — no build step, no npm, no framework,
no external network calls. Open `index.html` directly in a browser, or
serve the folder with any static file server.

## Files

- `index.html` — the single page. Contains the nav bar and an empty
  `<main id="app">` that gets filled in by JavaScript based on the URL hash.
- `styles.css` — all visual styling (indigo/purple, card-based, light mode).
- `data.js` — **all content lives here.** Topic write-ups, DSA problem
  lists, and behavioral questions are plain JavaScript arrays/objects.
- `app.js` — the router, localStorage helpers, and render functions.
  It knows how to *display* the data in `data.js`, but contains no
  topic text of its own.

## How routing works

The app uses hash-based routing, so it works from a `file://` URL with
zero server setup:

- `#dashboard` — overview, stats, category cards
- `#dsa` — grid of DSA categories
- `#dsa/<categoryId>` — grid of problem cards for one category
- `#mldl`, `#genai`, `#sysdesign` — topic list for that category
- `#topic/<id>` — full detail view for one topic
- `#behavioral` — STAR guide, question bank, notes

`app.js` listens for `hashchange` and re-renders `#app` accordingly.

## Progress tracking

Everything is persisted in the browser's `localStorage` — nothing is
sent over the network:

- `prep_dsa_done` — array of solved DSA problem ids
- `prep_topics_done` — array of mastered topic ids
- `prep_behavioral_prepared` — array of "prepared" behavioral question ids
- `prep_behavioral_notes` — object mapping question id → your STAR notes
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

## Notes

- All ids should stay unique across their respective arrays — they're
  used as localStorage keys and (for topics) as URL fragments.
- There's no build step: after editing `data.js`, just refresh the page.
