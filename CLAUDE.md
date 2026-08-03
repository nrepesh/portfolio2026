# Agent Instructions - Portfolio2026

> Named `CLAUDE.md` deliberately: Claude Code auto-loads this file into every
> session. It was `AGENTS.md`, which is a cross-tool convention Claude Code does
> **not** pick up automatically - so these rules were only followed when someone
> happened to open the file. Do not rename it back.

This repo is a static HTML/CSS portfolio site. **Every edit is direct HTML/CSS edits.** There is no build step, no JS framework, no CMS.

---

## File Structure

```
├── index.html              # Landing page
├── about.html              # Bio / education / experience
├── coursework.html         # Index of OMSCS classes (class cards)
├── ml.html                 # ML showcase projects
├── software.html           # Software engineering projects
├── physics.html            # Physics projects
├── coursework/             # Per-class detail pages
│   ├── ml4t.html           # ← template for new class pages
│   └── <new-class>.html    # Add one per class
├── images/                 # Project thumbnails (PNG, JPG, SVG)
│   ├── ml4t-<slug>.png    # Course project images
│   └── ...                 # Other portfolio images
├── assets/css/main.css     # Single stylesheet
├── assets/js/main.js       # Nav, mobile toggle, AOS init
└── CLAUDE.md               # ← You are here (auto-loaded by Claude Code)
```

---

## Adding a NEW OMSCS Class

Do this when a new term starts.

1. **Copy `coursework/ml4t.html` to `coursework/<class-slug>.html`.**
   - Rename all references: title, section label, meta description.
   - Update nav links (all `../` relative references stay the same).
   - **Leave Agent Instructions comments in place.**

2. **Add the class syllabus.**
   - Copy the syllabus PDF out of the OMSCS repo to
     `assets/docs/<class-slug>-syllabus-<term>.pdf` (e.g. `cs7646-syllabus-sp26.pdf`).
     It must live in this repo - the OMSCS repos are private, so linking into
     one 404s for every visitor.
   - Add the link inside `.class-overview`, between `.class-description` and
     `.honor-code-note`:

   ```html
   <div class="syllabus-seam">
     <a class="syllabus-inline" href="../assets/docs/<FILE>.pdf" target="_blank" rel="noopener">
       <i class="fas fa-file-pdf"></i>
       Course syllabus
       <span class="syllabus-meta">PDF · <SIZE> KB</span>
     </a>
   </div>
   ```

   - `.syllabus-seam` centers the pill on an accent hairline that separates the
     class blurb from the project grid. Both classes already exist in `main.css` -
     do not redefine them.
   - Update `<SIZE>` to the real file size. Check with `ls -la assets/docs/`.
   - **Ask the user before committing the PDF.** The user has approved hosting
     the CS 7646 syllabus; that approval does not carry to other classes.

3. **Add a class card to `coursework.html`.**
   - Insert a new `<a class="project-card class-card">` in the `.project-grid`.
   - Cards are ordered **newest term first**.
   - Pick a representative image from `images/` or use `images/stock.jpg`.
   - Update the `<N> classes completed` stat tile.

4. **Update `coursework.html` stat tile.**
   - If a class completed: increment the `classes completed` stat.

---

## Adding a NEW PROJECT to an Existing Class

Do this when a project is finished.

1. **Read the problem statement from the user’s OMSCS repo.**
   - Ask for the path if you don’t have it. Common path: `~/Documents/omscs-*` or similar.
   - Never clone a private OMSCS repo to public-facing branches.

2. **Write PROBLEM statement only.**
   - 2–3 sentences. No solution details, no code snippets, no report quotes.
   - This preserves the GT honor code.

3. **Keep it short. This is the rule that gets broken.**
   These pages are scanned, not read. Prose paragraphs describing what you
   learned were removed in Aug 2026 - do not reintroduce them.

   - **Card:** ONE sentence. Name the technique and what it does. ~35 words.
   - **Detail page:** `Problem` (2 lines) → `Approach` (4–5 bullets in
     `<ul class="project-points">`) → ONE `<p class="project-note">` line.
   - Bullets ≤ 20 words. No lead-ins, no "This taught me that…".
   - Budget: ~40 words per card, ~150 per detail page.

   The single `.project-note` line is the only editorial voice on the page. It
   exists because Problem + Approach alone is just the assignment handout, which
   every classmate could publish. Make it a real judgement, not a summary.

4. **Voice: professional, third person about the system.**
   - Do NOT narrate the assignment's fiction. "My spaceship loses its engine"
     reads as roleplay; "Asteroid field simulation. Track ~100 objects…" does not.
   - Name the domain, then drop it. No possessives on the scenario.
   - Strip "I" from descriptions of the system. Keep it only where a judgement is
     genuinely personal.
   - American spelling - the site is consistent on this (optimization, behavior,
     modeling, localization).

5. **Pick tags.**
   - 2–4 tags covering techniques, libraries, or concepts.

6. **Get or make an image.**
   - If the project has a report chart/figure, copy it to `images/ml4t-<slug>.<ext>`.
   - If not, generate an SVG or use a relevant stock image from `images/`.
   - **All images must be styled for the dark theme** (bg `#111118`, accent `#C9FB50`).
   - See "Image Style Guide" below.

7. **Insert the project card into `coursework/<class>.html`.**
   - Add inside `.project-grid`.
   - Use `data-aos-delay="100"` or `"200"` to stagger every 2nd/3rd card.
   - Generate the mailto link with URL-encoded subject/body (copy from existing card).

8. **Update class card meta count on `coursework.html`.**
   - Increment the `.class-meta` count (e.g., "5 projects" → "6 projects").

9. **Remove the empty-state paragraph** if this is the first project.

---

## Image Style Guide

The portfolio uses a dark theme. All images should match:

- **Background:** `#111118` (near-black)
- **Accent color:** `#C9FB50` (chartreuse)
- **Text:** `#F0F0F0` (off-white)
- **Secondary:** `#A09897` (warm gray)
- **Grid/borders:** `#1E1E2E` (dark purple-gray)

**For SVG charts:** generate inline with these colors. Avoid white backgrounds.

**For report figures:** if the report figure has a white background, it will look jarring against the dark cards. Options:
1. Leave it - the image will have its own contrast (acceptable for honest report screenshots).
2. Generate a dark-themed recreation as SVG.
3. Use a relevant dark-themed stock image instead.

**For simulator screenshots - letterbox them first.** `.project-card-img` is
`width:100%; height:200px; object-fit:cover`. Source screenshots are usually
square-ish, so dropping one in raw center-crops roughly half of it away. Before
using a screenshot as a thumbnail, composite it onto a **960x540 `#111118`
canvas**, scaled to fit (never stretched, never cropped) with ~3-4% padding and
a 1px `#1E1E2E` hairline around the placed image. Then `cover` has nothing left
to crop. A light-background figure treated this way reads as a deliberate
figure card rather than an accident.

Pillow / ImageMagick / ffmpeg are **not installed** and should not be installed.
Use **`tools/letterbox.py`** - a dependency-free pure-Python PNG letterboxer
(stdlib `zlib` + `struct`; handles all five PNG scanline filters, colour types
0/2/4/6 at 8-bit, and fails loudly on palette / 16-bit / interlaced input).

```bash
RAIT_PROJECTS=~/github/omscs-rait-summer2026/Projects python3 tools/letterbox.py
```

It regenerates every course thumbnail from the job table at the bottom of the
file, and reproduces the committed images byte-for-byte. To add a class, append
entries to `JOBS`. Each entry takes an optional `crop=(x0,y0,x1,y1)` and
`fills=[(x,y,w,h,feather)]`, the latter inpainting a rectangle by interpolating
each row between its true left and right neighbours - used to remove simulator
UI chrome from a screenshot.

Two rules the script encodes, worth keeping if you ever replace it: downsample
by **averaging** source pixels rather than nearest-neighbour, or fine screenshot
detail aliases badly; and make every card image land at the **same placed
height** (502px on a 960x540 canvas), or one card visibly renders shorter than
its neighbours.

---

## Commit Rules

- **Never push to `main`.** Always branch: `update/<description>`.
- The user reviews before merging.
- Commit messages should say what changed: "Add CS 7646 Project 5: Market Simulator" not "update".

---

## Safety / Honor Code

- **Do NOT paste code, pseudocode, or solution strategies from OMSCS repos.**
- **Do NOT link to private OMSCS repos.**
- Problem statements are OK - they are public assignment descriptions.
- Report content: ask user if OK to quote. Default to paraphrasing in the user’s own words.
- If unsure: ask the user before committing.

**Autograded classes (no written report) - e.g. CS 7638.** The user was explicit
that test cases and grading machinery are GT property. Do **not** publish test
case counts, per-test point values, scoring formulas, pass thresholds, time
limits, or grading tolerances. Do not publish tuned parameter values either.
Describe the problem scenario and the named technique, and put the weight of the
page on what the user learned. Source files in these repos carry a "You may NOT
publish this file" header - honor it. That header covers the code, not the
user's own reflections on it.

---

## Quick Reference: Mailto Encoding

Subject: `Request%3A%20<CLASS>%20%E2%80%94%20<Project%20Title>`  
Body: `Hi%20Nrepesh%2C%20I%27d%20like%20the%20code%20and%20report%20for%20this%20project.%20My%20GitHub%20username%3A%20`

`<CLASS>` is the short class name - `ML4T`, `RAIT`. Parentheses in a project
title encode as `%28` and `%29`.

---

## Known Issue

The eight `coursework/project-ml4t-*.html` detail pages have broken nav and
breadcrumb links - they point at `../about.html`, `../coursework.html` etc., but
those pages live in `pages/`. The RAIT detail pages use the correct `../pages/`
prefix. The ML4T pages have not been touched pending the user's go-ahead.

---

## Last Updated

Branch: `update/rait-summer2026`  
Classes documented: ML4T (CS 7646, Spring 2026), RAIT (CS 7638, Summer 2026)  
Projects documented: 14 (8 ML4T + 6 RAIT)  
Syllabi hosted: `assets/docs/cs7646-syllabus-sp26.pdf`, `assets/docs/cs7638-syllabus-su26.pdf`
