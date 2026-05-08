# Agent Instructions - Portfolio2026

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
└── AGENTS.md               # ← You are here
```

---

## Adding a NEW OMSCS Class

Do this when a new term starts.

1. **Copy `coursework/ml4t.html` to `coursework/<class-slug>.html`.**
   - Rename all references: title, section label, meta description.
   - Update nav links (all `../` relative references stay the same).
   - **Leave Agent Instructions comments in place.**

2. **Add a class card to `coursework.html`.**
   - Insert a new `<a class="project-card class-card">` in the `.project-grid`.
   - Cards are ordered **newest term first**.
   - Pick a representative image from `images/` or use `images/stock.jpg`.
   - Update the `<N> classes completed` stat tile.

3. **Update `coursework.html` stat tile.**
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

3. **Write a LEARNING paragraph.**
   - Extract the user’s personal takeaways from their report or ask them directly.
   - Use the `<p class="project-learning">` element (see `ml4t.html` for examples).
   - Keep it honest and specific - generic fluff reads as filler.

4. **Pick tags.**
   - 2–4 tags covering techniques, libraries, or concepts.

5. **Get or make an image.**
   - If the project has a report chart/figure, copy it to `images/ml4t-<slug>.<ext>`.
   - If not, generate an SVG or use a relevant stock image from `images/`.
   - **All images must be styled for the dark theme** (bg `#111118`, accent `#C9FB50`).
   - See "Image Style Guide" below.

6. **Insert the project card into `coursework/<class>.html`.**
   - Add inside `.project-grid`.
   - Use `data-aos-delay="100"` or `"200"` to stagger every 2nd/3rd card.
   - Generate the mailto link with URL-encoded subject/body (copy from existing card).

7. **Update class card meta count on `coursework.html`.**
   - Increment the `.class-meta` count (e.g., "5 projects" → "6 projects").

8. **Remove the empty-state paragraph** if this is the first project.

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

---

## Quick Reference: Mailto Encoding

Subject: `Request%3A%20ML4T%20%E2%80%94%20<Project%20Title>`  
Body: `Hi%20Nrepesh%2C%20I%27d%20like%20the%20code%20and%20report%20for%20this%20project.%20My%20GitHub%20username%3A%20`

---

## Last Updated

Branch: `update/ml4t-coursework`  
Classes documented: ML4T (CS 7646, Spring 2026)  
Projects documented: 8
