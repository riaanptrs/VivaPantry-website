# Current Status

Last updated: 2026-08-25 before Windows reset.

## Git

- Repository: `https://github.com/riaanptrs/VivaPantry-website.git`
- Current branch: `main`
- Reset audit committed and pushed `885ff22` (`Refresh VivaPantry marketing site`) to `origin/main`.
- Working tree was clean after refreshing the index during the pre-reset audit.

## Evidence From Repository

- Static pages live at the repository root and under locale folders such as `en/`, `es/`, and `pt-BR/`.
- Source copy lives under `src/locales/`.
- Static generator lives at `scripts/build-static-seo-site.mjs`.
- Public domain is recorded in `CNAME`.

## Recovery Notes

- No local-only website secrets were identified in the substantive pre-reset diff.
- `supabase-web-config.js` exists as a tracked public web config placeholder/reference; do not place service-role keys or private credentials there.

