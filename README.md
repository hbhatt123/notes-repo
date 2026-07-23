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
- `#dsa` — DSA problem checklists by category
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

### Add or edit a behavioral question

Add an object to `BEHAVIORAL_QUESTIONS`:

```js
{ id: "bq-my-question", group: "Leadership", question: "Tell me about a time..." }
```

`group` just controls which heading the question is clustered under on
the page — use an existing group name or introduce a new one.

## Notes

- All ids should stay unique across their respective arrays — they're
  used as localStorage keys and (for topics) as URL fragments.
- There's no build step: after editing `data.js`, just refresh the page.
