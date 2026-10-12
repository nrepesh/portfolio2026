# portfolio2026

Personal portfolio for Nrepesh Joshi: machine learning, software, physics, and
OMSCS coursework.

**Live:** https://nrepesh.github.io/portfolio2026/

Static HTML and CSS. No build step, no framework, no dependencies. Open a file
and edit it. Everything is served from this origin; the site makes no
third-party requests.

## Layout

```
index.html              landing page, the only page at root
pages/                  about, coursework, ml, software, physics
coursework/             <class>.html and project-<class>-<slug>.html
images/                 thumbnails and figures
assets/css/main.css     the single stylesheet
assets/js/main.js       nav, mobile menu, scroll reveal, cursor halo
assets/fonts/           self-hosted woff2, latin subset
assets/docs/            hosted syllabus PDFs
tools/letterbox.py      thumbnail generator, pure stdlib
```

Top-level pages live in `pages/`, so links from `coursework/` need the
`../pages/` prefix.

## Working on it

A few conventions that are easy to break:

- Coursework pages describe the problem and the result, never the solution. No
  code, test cases or tuned values, per the GT honor code.
- No inline `style` attributes. Use the class layer at the bottom of `main.css`.
- Card thumbnails are letterboxed onto a 960x540 canvas so every card renders at
  the same height.

Preview locally with any static server:

```bash
python3 -m http.server 8000
```

Regenerate course thumbnails (needs a local clone of the private course repo):

```bash
RAIT_PROJECTS=~/github/omscs-rait-summer2026/Projects python3 tools/letterbox.py
```

## Deployment

GitHub Pages builds from `main`. Push to `main` and it goes live; `.nojekyll`
disables Jekyll processing.

## License

`LICENSE.txt` is the CC BY 3.0 license that shipped with the HTML5 UP "Escape
Velocity" template this repo was originally scaffolded from. None of that
template's code remains: its SCSS, jQuery bundle and stylesheet were removed in
Aug 2026, and the current design is bespoke. The file is kept pending a decision
on what to license this under.
