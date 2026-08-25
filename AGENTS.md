# Codex Project Notes

## Project

This is the static public website for VivaPantry. It is published from generated HTML/CSS/JS files and localized source copy.

## First Steps

1. Read `README.md`, `docs/CURRENT_STATUS.md`, and any route/deployment notes in `docs/`.
2. Do not commit private Supabase credentials, service keys, analytics secrets, tokens, or deployment credentials.
3. Edit localized source under `src/locales/` and generator code under `scripts/` when changing generated pages.
4. Regenerate static pages before committing user-facing website changes.

## Useful Commands

- `node scripts/build-static-seo-site.mjs`

## Tooling Expectations

Node is required for the static site generator. The site itself is static HTML/CSS/JS.

