# CLAUDE.md - Portfolio2026

Static HTML/CSS portfolio. No build step, no framework, no CMS - every change is
a direct edit to HTML or `assets/css/main.css`.

Keep this file short. It loads into every session, so anything that rots or
restates the code costs more than it explains. Do not rename it: Claude Code
auto-loads `CLAUDE.md` and does **not** auto-load `AGENTS.md`.

## Layout

```
index.html              landing page - the only page at root
pages/                  about, coursework, ml, software, physics
coursework/             <class>.html and project-<class>-<slug>.html
images/                 thumbnails, named <class>-<slug>.png|svg
assets/css/main.css     the single stylesheet
assets/js/main.js       nav, mobile toggle, reveal-on-scroll, cursor halo
assets/docs/            hosted syllabus PDFs
tools/letterbox.py      thumbnail generator
```

The top-level pages live in `pages/`, so links from `coursework/` are
`../pages/about.html`. Getting this wrong silently 404s every nav link, which
has already happened once.

## Writing copy - the rule that gets broken

These pages are scanned, not read. Prose paragraphs were removed in Aug 2026;
do not reintroduce them.

- **Card:** one sentence, ~35 words. Name the technique and what it does.
- **Detail page:** `Problem` (2 lines) → `Approach` (4-5 bullets in
  `<ul class="project-points">`) → one `<p class="project-note">` line. ~150 words.
- Bullets ≤ 20 words. No lead-ins, no "This taught me that…".

The `.project-note` line is the only editorial voice on the page. It exists
because Problem + Approach alone is just the assignment handout, which every
classmate could publish. Make it a real judgement, not a summary.

**Voice.** Do not narrate the assignment's fiction - "my spaceship loses its
engine" reads as roleplay. Name the domain once, then describe the system in
third person. American spelling.

## Honor code

- No code, pseudocode, solution strategies, or tuned parameter values.
- No test cases, autograder output, point values, thresholds, or grading
  tolerances. This applies to ML4T exactly as much as to RAIT.
- Problem statements are fine - they are public assignment descriptions.
- The user's own reported results (returns, Sharpe ratios, timings) are fine.
- Course source files carry a "You may NOT publish this file" header. That
  covers the code, not the user's own reflections on it.
- Never link a private OMSCS repo. Copy the syllabus into `assets/docs/`, and
  ask before committing it - approval is per class, not blanket.

## Adding a class

1. Copy `coursework/ml4t.html`; update title, section label and meta description.
2. Add `assets/docs/<class>-syllabus-<term>.pdf` and link it with the
   `.syllabus-seam` / `.syllabus-inline` pair (copy the markup from `ml4t.html`).
3. Add a `.class-card` to `pages/coursework.html`, newest term first, and update
   the "N classes completed" tile.

## Adding a project

Read the code and spec from the user's OMSCS repo, write the card and detail
page to the copy rules above, add the thumbnail, then bump the class card's
`.class-meta` count.

Cards link to their detail page twice: from the title (`.project-card-link`,
whose `::after` makes the whole card clickable) and from a "More info" link.
Keep both - the first is the hit area, the second is the visible affordance.

## Images

Dark theme: background `#111118`, accent `#C9FB50`, text `#F0F0F0`, secondary
`#A09897`, borders `#1E1E2E`. Author SVGs with these; avoid white backgrounds.

Screenshots must be letterboxed. `.project-card-img` is
`100% x 200px; object-fit: cover`, so a square screenshot loses half its content
to the crop. Every card image must also land at the **same placed height**
(502px on a 960x540 canvas), or one card visibly renders shorter than its
neighbours.

Pillow, ImageMagick and ffmpeg are not installed. Use the pure-stdlib tool:

```bash
RAIT_PROJECTS=~/github/omscs-rait-summer2026/Projects python3 tools/letterbox.py
```

Append to its `JOBS` table. Each entry takes an optional `crop=(x0,y0,x1,y1)` and
`fills=[(x,y,w,h,feather)]`, the latter inpainting a rectangle - used to remove
simulator UI chrome, and to cut a test-case label and a set of tuned gain values
that were visible in two screenshots.

## Commits

- Never push to `main`. Branch `update/<description>` and let the user merge.
- Do **not** add `Co-Authored-By` trailers. The user does not want Claude listed
  as a contributor; it had to be scrubbed from published history once already.
- Say what changed: "Add CS 7646 Project 5: Market Simulator", not "update".

## Mailto pattern

Subject `Request%3A%20<CLASS>%20%E2%80%94%20<Project%20Title>`, body
`Hi%20Nrepesh%2C%20I%27d%20like%20the%20code%20and%20report%20for%20this%20project.%20My%20GitHub%20username%3A%20`

`<CLASS>` is `ML4T` or `RAIT`. Parentheses encode as `%28` and `%29`.
