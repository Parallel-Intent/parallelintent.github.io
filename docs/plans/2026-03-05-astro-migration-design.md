# Astro Migration for parallelintent.io

## Overview

Convert existing single-page static HTML site to Astro framework with content collections, file-based routing, and GitHub Pages deployment.

## Architecture

Astro static site with file-based routing. Pages: `/`, `/writing`, `/writing/[slug]`, `/work`, `/now`. Content collections for `writing` and `now`. GitHub Pages deployment via GitHub Actions.

## Project Structure

```
src/
├── pages/
│   ├── index.astro          - homepage (current HTML, adapted)
│   ├── writing.astro         - post list
│   ├── writing/[slug].astro  - individual post
│   ├── work.astro            - static prose
│   └── now.astro             - renders now collection entry
├── layouts/
│   └── Base.astro            - shared HTML shell (head, fonts, noise/grid/scanline, cursor, theme toggle)
├── components/
│   └── Nav.astro             - shared navigation
├── content/
│   ├── writing/
│   │   └── aligned-at-the-source.md
│   └── now/
│       └── current.md
├── content.config.ts         - collection schemas
└── styles/                   - (empty, styles stay in components)
```

## Base Layout

Extracts the shared shell from current `index.html`: `<head>` with fonts, CSS variables, noise overlay, grid, scanline, custom cursor, and theme toggle. Each page slots its content into this shell. All visual effects (cursor, grid, scan line) live here so every page feels consistent.

## Navigation

`Nav.astro` component replaces the current bottom-bar links. Same styling (0.65rem, uppercase, letter-spacing, underline-on-hover). Links: Writing, Work, Now, Contact (mailto:k@parallelintent.io). Included in `Base.astro`.

## Content Collections

- **writing** - schema: `title`, `date`, `status` (seed/growing/evergreen), `tags` (string array), `description` (optional). Listed on `/writing` sorted by date desc. Each post gets `/writing/[slug]`.
- **now** - schema: `updated` (date). Single entry `current.md` rendered on `/now`.

## Post Page Styling

Markdown content gets minimal typography styles scoped to the post layout - same fonts, colors, and spacing as the rest of the site.

## Deployment

`astro.config.mjs` with `site: 'https://parallelintent.io'`. GitHub Actions workflow using `withastro/action@v3` to build and deploy to Pages. CNAME preserved in `public/`.

## What Stays the Same

The homepage content, visual effects, dark/light theming, and overall aesthetic are preserved exactly. This is a structural migration, not a redesign.
