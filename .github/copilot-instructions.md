# Copilot Instructions

## Project Overview

Static personal resume website hosted on GitHub Pages at `https://guilhermesendyk.com`. No build tools, package managers, or frameworks — plain HTML, CSS, and vanilla JavaScript.

## Local Development

```bash
python3 -m http.server 8080
# Then visit http://localhost:8080
```

`resume.json` is fetched at runtime via `fetch()`, so a local server is required (opening `index.html` directly won't load data).

## Architecture

All resume content lives in **`data/resume.json`** (following the [JSON Resume schema](https://jsonresume.org/schema)). The HTML in `index.html` contains mostly empty placeholder elements; `js/resume-builder.js` fetches the JSON on `DOMContentLoaded` and populates the DOM.

- **`data/resume.json`** — Single source of truth for all resume content. Edit this file to change any displayed text, dates, skills, or links.
- **`js/resume-builder.js`** — Fetches JSON and builds DOM nodes for About, Experience, Skills, and Interests sections.
- **`js/scripts.js`** — Bootstrap/jQuery smooth scrolling and navbar collapse behavior.
- **`css/styles.css`** — Bootstrap 4 + custom styles (compiled, large file).
- **`index.html`** — Shell with empty placeholders; HTML comments mark where each section is populated.

Deployment is automatic via GitHub Pages on push to `main`.

## Key Conventions

### Editing resume content
Always edit `data/resume.json`, never `index.html` directly for content changes.

### JSON schema extensions beyond standard JSON Resume
- `work[].location` — custom field (city/country string, not in base spec)
- `skills[].tools[]` — custom sub-array for the icon grid; each tool has `name`, `icon`, `iconType` (`"fontawesome"` or `"iconify"`), and `url`
- `interests[].summary` — used for displayed paragraph text; `keywords` is present but not rendered

### Skills section structure (order-sensitive)
`resume-builder.js` maps the three `<ul>` elements in `#skills` by index:
- `ul[0]` ← `resumeData.languages`
- `ul[1]` ← the skills entry containing a `tools` array
- `ul[2]` ← the skills entry named `"Workflow"` (uses `keywords` array)

### Icon systems
Two icon systems are used side-by-side:
- **Font Awesome** — `iconType: "fontawesome"`, value is a CSS class string (e.g., `"fab fa-python"`), rendered as `<i class="...">`.
- **Iconify** — `iconType: "iconify"`, value is an icon ID (e.g., `"cib:grafana"`), rendered as `<span class="iconify" data-icon="...">`. Call `Iconify.scan()` after dynamically inserting iconify elements.

### Security
- All user-facing strings use `sanitizeText()` (DOM text node assignment, not `innerHTML`).
- All URLs pass through `sanitizeUrl()`, which only allows `http:`, `https:`, and `mailto:` protocols.
- All `target="_blank"` links include `rel="noopener noreferrer"`.

### Commented-out sections
Education and Awards sections exist in `index.html` but are commented out. Do not add them to `resume.json` processing without first uncommenting the corresponding nav links and HTML sections.
