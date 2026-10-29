# VivaPantry Static Website

`pantrypal-website` contains the current static public website for VivaPantry.com.

Generate the site from the repo root:

```powershell
node pantrypal-website\scripts\build-static-seo-site.mjs
```

The generator reads localized copy from `src/locales/` and writes HTML, `styles.css`, `script.js`, `robots.txt`, and `sitemap.xml` directly into this folder.

It also creates directory routes for the checked-in Expo export under `app/`, so links such as `/app/sign-in/` work on GitHub Pages. After replacing the Expo export, rerun the generator (or `node scripts/build-app-routes.mjs`) before publishing. Keep the exported `.html` files and their generated directory pages together.

Before publishing, verify the localized home, pricing, privacy, terms, support, delete-account, callback, and noindex web-access pages. See `../docs/web-deployment.md` and `../docs/web-architecture.md` for route and deployment notes.
