# Astro Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the existing static HTML site at parallelintent.io to an Astro project with content collections, multiple pages, and GitHub Pages deployment.

**Architecture:** Astro static site with file-based routing. Shared Base layout extracts all visual effects (grid, scanline, cursor, theme toggle) so every page is consistent. Content collections for `writing` (blog posts) and `now` (single living document). GitHub Actions deploys to Pages on push to main.

**Tech Stack:** Astro 5.x, TypeScript, GitHub Actions, GitHub Pages

---

### Task 1: Scaffold Astro Project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/pages/index.astro` (placeholder)
- Move: `CNAME` to `public/CNAME`
- Delete: `index.html` (after migration)

**Step 1: Initialize Astro in the current directory**

Since we have an existing repo, install Astro manually rather than using `create astro`:

```bash
cd /Users/kostandin/Projects/pi/web
npm init -y
npm install astro
```

**Step 2: Create astro.config.mjs**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://parallelintent.io',
});
```

**Step 3: Create tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

**Step 4: Update package.json scripts**

Replace the default scripts in `package.json` with:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

**Step 5: Create directory structure**

```bash
mkdir -p src/pages src/layouts src/components src/content/writing src/content/now public
```

**Step 6: Move CNAME to public/**

```bash
mv CNAME public/CNAME
```

**Step 7: Create placeholder index page**

Create `src/pages/index.astro`:

```astro
---
---
<html><body><h1>placeholder</h1></body></html>
```

**Step 8: Create .gitignore**

```
node_modules/
dist/
.astro/
```

**Step 9: Verify it builds**

```bash
npx astro build
```

Expected: Build succeeds, outputs to `dist/`.

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold Astro project"
```

---

### Task 2: Create Base Layout

**Files:**
- Create: `src/layouts/Base.astro`

**Step 1: Create Base.astro**

Extract the shared shell from the old `index.html`. This includes: `<head>` (meta, fonts), CSS variables, reset, noise overlay, grid, scanline, custom cursor, theme toggle, and all animations. The layout accepts a `title` prop and a `<slot />` for page content.

```astro
---
// src/layouts/Base.astro
interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} — Parallel Intent</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div class="cursor" id="cursor"></div>
    <div class="cursor-ring" id="cursorRing"></div>
    <div class="grid"></div>
    <div class="scanline"></div>
    <div class="vertical-text">Building with intention — 2026</div>
    <div class="number">41.3275° N / 19.8187° E</div>
    <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
      ☀ Light
    </button>

    <slot />

    <script>
      // theme toggle
      const toggleBtn = document.getElementById("themeToggle");
      const root = document.documentElement;
      let isLight = false;

      toggleBtn?.addEventListener("click", () => {
        isLight = !isLight;
        root.classList.toggle("light", isLight);
        if (toggleBtn) toggleBtn.textContent = isLight ? "◑ Dark" : "☀ Light";
      });

      // custom cursor
      const cursor = document.getElementById("cursor");
      const ring = document.getElementById("cursorRing");
      let mx = 0, my = 0, rx = 0, ry = 0;

      document.addEventListener("mousemove", (e) => {
        mx = e.clientX;
        my = e.clientY;
        if (cursor) {
          cursor.style.left = mx + "px";
          cursor.style.top = my + "px";
        }
      });

      function animateRing() {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        if (ring) {
          ring.style.left = rx + "px";
          ring.style.top = ry + "px";
        }
        requestAnimationFrame(animateRing);
      }
      animateRing();

      // cursor grow on links
      document.querySelectorAll("a, .word").forEach((el) => {
        el.addEventListener("mouseenter", () => {
          if (ring) {
            ring.style.width = "56px";
            ring.style.height = "56px";
            ring.style.borderColor = "var(--accent)";
          }
        });
        el.addEventListener("mouseleave", () => {
          if (ring) {
            ring.style.width = "32px";
            ring.style.height = "32px";
            ring.style.borderColor = "var(--muted)";
          }
        });
      });
    </script>

    <style is:global>
      *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      :root {
        --bg: #0c0c0b;
        --fg: #e8e4dc;
        --muted: #5a5750;
        --accent: #c8b89a;
        --line: #1e1e1c;
      }

      :root.light {
        --bg: #f5f2ec;
        --fg: #1a1916;
        --muted: #9a9690;
        --accent: #7a5c3a;
        --line: #e0dcd4;
      }

      html, body {
        height: 100%;
      }

      body {
        background: var(--bg);
        color: var(--fg);
        font-family: "DM Mono", monospace;
        font-weight: 300;
        overflow: hidden;
        cursor: none;
        transition: background 0.5s ease, color 0.5s ease;
      }

      /* custom cursor */
      .cursor {
        position: fixed;
        width: 6px;
        height: 6px;
        background: var(--accent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: transform 0.1s ease, opacity 0.3s ease;
        mix-blend-mode: difference;
      }

      .cursor-ring {
        position: fixed;
        width: 32px;
        height: 32px;
        border: 1px solid var(--muted);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        transform: translate(-50%, -50%);
        transition: transform 0.25s ease, width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
      }

      /* noise overlay */
      body::before {
        content: "";
        position: fixed;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
        pointer-events: none;
        z-index: 100;
        opacity: 0.35;
      }

      /* grid lines */
      .grid {
        position: fixed;
        inset: 0;
        background-image:
          linear-gradient(var(--line) 1px, transparent 1px),
          linear-gradient(90deg, var(--line) 1px, transparent 1px);
        background-size: 80px 80px;
        pointer-events: none;
        opacity: 0.5;
      }

      /* scan line */
      .scanline {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--accent), transparent);
        opacity: 0.15;
        animation: scan 8s linear infinite;
        pointer-events: none;
        z-index: 50;
      }

      /* vertical text */
      .vertical-text {
        position: fixed;
        right: 3rem;
        top: 50%;
        transform: translateY(-50%) rotate(90deg);
        font-size: 0.58rem;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        color: var(--muted);
        opacity: 0.4;
        white-space: nowrap;
        pointer-events: none;
      }

      /* number accent */
      .number {
        position: fixed;
        left: 3rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.58rem;
        letter-spacing: 0.2em;
        color: var(--muted);
        opacity: 0.3;
        writing-mode: vertical-rl;
        text-orientation: mixed;
        pointer-events: none;
      }

      /* theme toggle */
      .theme-toggle {
        position: fixed;
        top: 2.8rem;
        right: 3rem;
        z-index: 200;
        background: none;
        border: 1px solid var(--muted);
        color: var(--muted);
        font-family: "DM Mono", monospace;
        font-size: 0.58rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        padding: 0.4rem 0.8rem;
        cursor: none;
        transition: color 0.3s ease, border-color 0.3s ease, background 0.3s ease;
        opacity: 0;
        animation: fadeUp 1s ease 1.6s forwards;
      }

      .theme-toggle:hover {
        color: var(--accent);
        border-color: var(--accent);
      }

      /* animations */
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      @keyframes scan {
        0% { top: -2px; }
        100% { top: 100vh; }
      }

      /* mobile */
      @media (max-width: 640px) {
        .vertical-text, .number { display: none; }
      }
    </style>
  </body>
</html>
```

**Step 2: Verify it builds**

```bash
npx astro build
```

Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "feat: create Base layout with shared visual effects"
```

---

### Task 3: Create Nav Component

**Files:**
- Create: `src/components/Nav.astro`

**Step 1: Create Nav.astro**

```astro
---
// src/components/Nav.astro
const links = [
  { href: "/writing", label: "Writing" },
  { href: "/work", label: "Work" },
  { href: "/now", label: "Now" },
  { href: "mailto:k@parallelintent.io", label: "Contact" },
];
---

<nav class="nav-links">
  {links.map((link) => (
    <a href={link.href}>{link.label}</a>
  ))}
</nav>

<style>
  .nav-links {
    display: flex;
    gap: 2rem;
  }

  .nav-links a {
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted);
    text-decoration: none;
    transition: color 0.3s ease;
    position: relative;
  }

  .nav-links a::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--accent);
    transition: width 0.3s ease;
  }

  .nav-links a:hover {
    color: var(--accent);
  }

  .nav-links a:hover::after {
    width: 100%;
  }
</style>
```

**Step 2: Commit**

```bash
git add src/components/Nav.astro
git commit -m "feat: create Nav component"
```

---

### Task 4: Migrate Homepage

**Files:**
- Modify: `src/pages/index.astro` (replace placeholder)

**Step 1: Rewrite index.astro using Base layout and Nav**

This page contains the hero section, top bar, and bottom bar from the original `index.html`. The shared elements (cursor, grid, scanline, theme toggle) now come from `Base.astro`.

```astro
---
// src/pages/index.astro
import Base from "../layouts/Base.astro";
import Nav from "../components/Nav.astro";
---

<Base title="Aligned at the source">
  <main>
    <div class="top-bar">
      <div class="name">Parallel Intent</div>
      <div class="status">
        <span class="dot"></span>Building something new<br />
        Tirana, AL —&nbsp;
      </div>
    </div>

    <div class="hero">
      <div class="label">Software · AI · Craft</div>
      <h1 class="tagline">
        <span class="word">Aligned</span>&nbsp;<span class="word">at</span>&nbsp;<span class="word">the</span>&nbsp;<em class="word">source.</em>
      </h1>
      <div class="manifesto">
        <p>
          We believe the next era of software isn't built by humans or machines.
          It's built by both, in parallel, toward the same goal.
        </p>
        <p>
          Parallel Intent exists at that intersection. Where intent is the input.
          Where alignment is the architecture. Where every commit moves in one
          direction.
        </p>
        <p>Not faster tools. A new way of building.</p>
      </div>
    </div>

    <div class="bottom-bar">
      <Nav />
      <div class="coords">
        <span style="color: var(--accent)">v0.1</span> — seed<br />
        March 2026
      </div>
    </div>
  </main>
</Base>

<style>
  main {
    position: relative;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 3rem;
    z-index: 10;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    opacity: 0;
    animation: fadeUp 1s ease 0.2s forwards;
  }

  .name {
    font-family: "Instrument Serif", serif;
    font-size: 1.1rem;
    letter-spacing: 0.02em;
    color: var(--fg);
  }

  .status {
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted);
    text-align: right;
    line-height: 1.8;
    padding-right: 7rem;
  }

  .status .dot {
    display: inline-block;
    width: 5px;
    height: 5px;
    background: #4a7c59;
    border-radius: 50%;
    margin-right: 6px;
    animation: pulse 2.5s ease-in-out infinite;
  }

  .hero {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 820px;
  }

  .label {
    font-size: 0.62rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 2.5rem;
    opacity: 0;
    animation: fadeUp 1s ease 0.5s forwards;
  }

  .tagline {
    font-family: "Instrument Serif", serif;
    font-size: clamp(2.8rem, 6vw, 5.5rem);
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: var(--fg);
    opacity: 0;
    animation: fadeUp 1.2s ease 0.7s forwards;
  }

  .tagline em {
    font-style: italic;
    color: var(--accent);
  }

  .tagline .word {
    display: inline-block;
    transition: color 0.4s ease;
  }

  .tagline .word:hover {
    color: var(--accent);
  }

  .manifesto {
    margin-top: 3rem;
    max-width: 480px;
    opacity: 0;
    animation: fadeUp 1s ease 1.1s forwards;
  }

  .manifesto p {
    font-size: 0.78rem;
    line-height: 1.9;
    color: var(--muted);
    letter-spacing: 0.03em;
  }

  .manifesto p + p {
    margin-top: 1rem;
  }

  .bottom-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    opacity: 0;
    animation: fadeUp 1s ease 1.4s forwards;
  }

  .coords {
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    color: var(--muted);
    text-align: right;
    line-height: 1.8;
  }

  @media (max-width: 640px) {
    main { padding: 2rem; }
    .coords { display: none; }
  }
</style>
```

**Step 2: Delete old index.html**

```bash
rm /Users/kostandin/Projects/pi/web/index.html
```

**Step 3: Run dev server and verify visually**

```bash
npx astro dev
```

Open `http://localhost:4321` — should look identical to the original site.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: migrate homepage to Astro"
```

---

### Task 5: Content Collections Setup

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/writing/aligned-at-the-source.md`
- Create: `src/content/now/current.md`

**Step 1: Create content.config.ts**

```ts
// src/content.config.ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const writing = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/writing" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    status: z.enum(["seed", "growing", "evergreen"]),
    tags: z.array(z.string()),
    description: z.string().optional(),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/now" }),
  schema: z.object({
    updated: z.coerce.date(),
  }),
});

export const collections = { writing, now };
```

**Step 2: Create seed writing post**

Create `src/content/writing/aligned-at-the-source.md`:

```markdown
---
title: "Aligned at the source"
date: 2026-03-05
status: seed
tags: [engineering, ai]
description: "Human intent and machine intelligence, committed together."
---

We believe the next era of software isn't built by humans or machines. It's built by both, in parallel, toward the same goal.

Parallel Intent exists at that intersection. Where intent is the input. Where alignment is the architecture. Where every commit moves in one direction.

Not faster tools. A new way of building.
```

**Step 3: Create now page content**

Create `src/content/now/current.md`:

```markdown
---
updated: 2026-03-05
---

Building [Parallel Intent](https://parallelintent.io) — a software studio at the intersection of human intent and machine intelligence.

Based in Tirana, Albania.
```

**Step 4: Verify build**

```bash
npx astro build
```

Expected: Build succeeds with content collections loaded.

**Step 5: Commit**

```bash
git add src/content.config.ts src/content/
git commit -m "feat: add content collections for writing and now"
```

---

### Task 6: Create Inner Page Layout and Writing Pages

**Files:**
- Create: `src/layouts/Page.astro`
- Create: `src/pages/writing.astro`
- Create: `src/pages/writing/[slug].astro`

**Step 1: Create Page.astro — a layout for inner pages**

Inner pages need: the Base layout shell, a header with site name + nav, scrollable content area, and a simpler footer. Unlike the homepage, `overflow` should not be hidden.

```astro
---
// src/layouts/Page.astro
import Base from "./Base.astro";
import Nav from "../components/Nav.astro";

interface Props {
  title: string;
}

const { title } = Astro.props;
---

<Base title={title}>
  <main class="page">
    <header class="page-header">
      <a href="/" class="site-name">Parallel Intent</a>
      <Nav />
    </header>
    <div class="page-content">
      <slot />
    </div>
    <footer class="page-footer">
      <span style="color: var(--accent)">v0.1</span> — seed · March 2026
    </footer>
  </main>
</Base>

<style is:global>
  /* Inner pages need scrolling */
  .page body,
  body:has(.page) {
    overflow: auto;
  }
</style>

<style>
  .page {
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 3rem;
    z-index: 10;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4rem;
    opacity: 0;
    animation: fadeUp 1s ease 0.2s forwards;
  }

  .site-name {
    font-family: "Instrument Serif", serif;
    font-size: 1.1rem;
    letter-spacing: 0.02em;
    color: var(--fg);
    text-decoration: none;
  }

  .page-content {
    flex: 1;
    max-width: 640px;
    opacity: 0;
    animation: fadeUp 1s ease 0.5s forwards;
  }

  .page-footer {
    margin-top: 4rem;
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    color: var(--muted);
    opacity: 0;
    animation: fadeUp 1s ease 0.8s forwards;
  }

  @media (max-width: 640px) {
    .page { padding: 2rem; }
  }
</style>
```

**Step 2: Create writing.astro — post list page**

```astro
---
// src/pages/writing.astro
import Page from "../layouts/Page.astro";
import { getCollection } from "astro:content";

const posts = (await getCollection("writing")).sort(
  (a, b) => b.data.date.getTime() - a.data.date.getTime()
);
---

<Page title="Writing">
  <h1 class="page-title">Writing</h1>
  <ul class="post-list">
    {posts.map((post) => (
      <li>
        <a href={`/writing/${post.id}`}>
          <span class="post-title">{post.data.title}</span>
          <span class="post-meta">
            {post.data.date.toLocaleDateString("en-US", { year: "numeric", month: "short" })}
            · {post.data.status}
          </span>
        </a>
      </li>
    ))}
  </ul>
</Page>

<style>
  .page-title {
    font-family: "Instrument Serif", serif;
    font-size: clamp(2rem, 4vw, 3.5rem);
    letter-spacing: -0.02em;
    margin-bottom: 3rem;
  }

  .post-list {
    list-style: none;
  }

  .post-list li {
    border-top: 1px solid var(--line);
  }

  .post-list a {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 1.2rem 0;
    text-decoration: none;
    color: var(--fg);
    transition: color 0.3s ease;
  }

  .post-list a:hover {
    color: var(--accent);
  }

  .post-title {
    font-size: 0.85rem;
    letter-spacing: 0.02em;
  }

  .post-meta {
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    white-space: nowrap;
    margin-left: 2rem;
  }
</style>
```

**Step 3: Create writing/[slug].astro — individual post page**

```astro
---
// src/pages/writing/[slug].astro
import Page from "../../layouts/Page.astro";
import { getCollection, render } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("writing");
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---

<Page title={post.data.title}>
  <article class="post">
    <header class="post-header">
      <h1 class="post-title">{post.data.title}</h1>
      <div class="post-meta">
        {post.data.date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        · {post.data.status}
        {post.data.tags.length > 0 && (
          <span class="post-tags">
            · {post.data.tags.join(", ")}
          </span>
        )}
      </div>
    </header>
    <div class="prose">
      <Content />
    </div>
  </article>
</Page>

<style>
  .post-header {
    margin-bottom: 3rem;
  }

  .post-title {
    font-family: "Instrument Serif", serif;
    font-size: clamp(2rem, 4vw, 3.5rem);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .post-meta {
    margin-top: 1rem;
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .prose {
    font-size: 0.85rem;
    line-height: 1.9;
    color: var(--muted);
    letter-spacing: 0.02em;
  }

  .prose :global(p + p) {
    margin-top: 1.5rem;
  }

  .prose :global(a) {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .prose :global(h2) {
    font-family: "Instrument Serif", serif;
    font-size: 1.4rem;
    color: var(--fg);
    margin-top: 3rem;
    margin-bottom: 1rem;
  }

  .prose :global(h3) {
    font-size: 0.85rem;
    font-weight: 400;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--fg);
    margin-top: 2rem;
    margin-bottom: 0.8rem;
  }

  .prose :global(code) {
    font-family: "DM Mono", monospace;
    font-size: 0.8rem;
    background: var(--line);
    padding: 0.15rem 0.4rem;
    border-radius: 3px;
  }

  .prose :global(blockquote) {
    border-left: 2px solid var(--accent);
    padding-left: 1.2rem;
    color: var(--muted);
    font-style: italic;
    margin: 1.5rem 0;
  }
</style>
```

**Step 4: Verify build**

```bash
npx astro build
```

Expected: Build succeeds, generates `/writing/` and `/writing/aligned-at-the-source/`.

**Step 5: Commit**

```bash
git add src/layouts/Page.astro src/pages/writing.astro src/pages/writing/
git commit -m "feat: add writing list and post pages"
```

---

### Task 7: Create Work and Now Pages

**Files:**
- Create: `src/pages/work.astro`
- Create: `src/pages/now.astro`

**Step 1: Create work.astro**

```astro
---
// src/pages/work.astro
import Page from "../layouts/Page.astro";
---

<Page title="Work">
  <h1 class="page-title">Work</h1>
  <div class="work-content">
    <p>
      Parallel Intent is a software studio building at the intersection of
      human intent and machine intelligence.
    </p>
    <p>More coming soon.</p>
  </div>
</Page>

<style>
  .page-title {
    font-family: "Instrument Serif", serif;
    font-size: clamp(2rem, 4vw, 3.5rem);
    letter-spacing: -0.02em;
    margin-bottom: 3rem;
  }

  .work-content {
    font-size: 0.85rem;
    line-height: 1.9;
    color: var(--muted);
    letter-spacing: 0.02em;
    max-width: 480px;
  }

  .work-content p + p {
    margin-top: 1.5rem;
  }
</style>
```

**Step 2: Create now.astro**

```astro
---
// src/pages/now.astro
import Page from "../layouts/Page.astro";
import { getCollection, render } from "astro:content";

const nowEntries = await getCollection("now");
const entry = nowEntries[0];
const { Content } = await render(entry);
---

<Page title="Now">
  <h1 class="page-title">Now</h1>
  <div class="now-meta">
    Updated {entry.data.updated.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
  </div>
  <div class="now-content">
    <Content />
  </div>
</Page>

<style>
  .page-title {
    font-family: "Instrument Serif", serif;
    font-size: clamp(2rem, 4vw, 3.5rem);
    letter-spacing: -0.02em;
    margin-bottom: 1rem;
  }

  .now-meta {
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 3rem;
  }

  .now-content {
    font-size: 0.85rem;
    line-height: 1.9;
    color: var(--muted);
    letter-spacing: 0.02em;
    max-width: 480px;
  }

  .now-content :global(p + p) {
    margin-top: 1.5rem;
  }

  .now-content :global(a) {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
```

**Step 3: Verify build**

```bash
npx astro build
```

Expected: Build succeeds, generates `/work/` and `/now/`.

**Step 4: Commit**

```bash
git add src/pages/work.astro src/pages/now.astro
git commit -m "feat: add work and now pages"
```

---

### Task 8: GitHub Actions Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create deploy workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install and Build
        uses: withastro/action@v3

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: Verify build locally one final time**

```bash
npx astro build
```

**Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add GitHub Actions deployment workflow"
```

---

### Task 9: Final Cleanup and Verification

**Step 1: Run full build**

```bash
npx astro build
```

**Step 2: Preview locally**

```bash
npx astro preview
```

Open `http://localhost:4321` and verify:
- Homepage looks identical to original
- `/writing` shows post list
- `/writing/aligned-at-the-source` renders the post
- `/work` shows static content
- `/now` shows content from markdown
- Navigation works on all pages
- Theme toggle works on all pages
- Custom cursor works on all pages

**Step 3: Verify CNAME is in dist/**

```bash
ls dist/CNAME
```

Expected: File exists with content `parallelintent.io`.

**Step 4: Commit any remaining changes**

```bash
git status
# If any uncommitted files:
git add -A
git commit -m "chore: final cleanup"
```
