# VivaPantry Static Website

`pantrypal-website` contains the current static public website for VivaPantry.com.

Generate the site from this repo root:

```powershell
node scripts\build-static-seo-site.mjs
```

The generator reads localized copy from `src/locales/` and writes HTML, `styles.css`, `script.js`, `robots.txt`, and `sitemap.xml` directly into this folder.

Before publishing, verify the localized home, pricing, privacy, terms, support, delete-account, callback, and noindex web-access pages. See `../docs/web-deployment.md` and `../docs/web-architecture.md` for route and deployment notes.
