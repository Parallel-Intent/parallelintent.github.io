# Infrastructure

Build tooling, deployment, and hosting configuration.

```mermaid
stateDiagram-v2
    classDef done fill:#4a7c59,color:#fff,stroke:#4a7c59
    classDef inprogress fill:#c8b89a,color:#1a1916,stroke:#c8b89a
    classDef todo fill:#5a5750,color:#e8e4dc,stroke:#5a5750
    classDef blocked fill:#8b3a3a,color:#fff,stroke:#8b3a3a

    AstroSetup: Astro 5.x Setup
    ContentConfig: Content Collections Config
    GHActions: GitHub Actions CI/CD
    GHPages: GitHub Pages Hosting
    CustomDomain: Custom Domain (parallelintent.io)
    SEO: SEO / Meta Tags
    Analytics: Analytics
    RSS: RSS Feed
    Sitemap: Sitemap

    AstroSetup --> ContentConfig
    ContentConfig --> GHActions
    GHActions --> GHPages
    GHPages --> CustomDomain

    class AstroSetup done
    class ContentConfig done
    class GHActions done
    class GHPages blocked
    class CustomDomain inProgress
    class SEO todo
    class Analytics todo
    class RSS todo
    class Sitemap todo
```

## SEO

Only a `<title>` tag exists. No meta description, Open Graph tags, or structured data.

## Analytics

No analytics integration. Consider PostHog or simple analytics.

## RSS

No RSS feed configured. Astro has built-in RSS support via `@astrojs/rss`.

## Sitemap

No sitemap generation. Astro has `@astrojs/sitemap` integration available.
