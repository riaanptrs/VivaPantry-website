# VivaPantry Website Internationalization Verification

Manual checks for GitHub Pages deployment at `https://vivapantry.com`.

1. Browser language `pt-BR`
   - Clear `localStorage`.
   - Visit `https://vivapantry.com/`.
   - Expected: redirects to `https://vivapantry.com/pt-BR/`.

2. Browser language `es`
   - Clear `localStorage`.
   - Visit `https://vivapantry.com/`.
   - Expected: redirects to `https://vivapantry.com/es/`.

3. Browser language `en`
   - Clear `localStorage`.
   - Visit `https://vivapantry.com/`.
   - Expected: redirects to `https://vivapantry.com/en/`.

4. Manual language switch
   - Visit `/en/privacy`.
   - Switch to `Português Brasil`.
   - Expected: saves `vivapantry.locale=pt-BR` in `localStorage` and redirects to `/pt-BR/privacy`.

5. Static route refresh
   - Open `https://vivapantry.com/pt-BR/privacy`.
   - Refresh the page.
   - Expected: page loads without a 404 and remains in Portuguese.

6. Legal and support pages
   - Check `/en/privacy`, `/pt-BR/privacy`, `/es/privacy`.
   - Repeat for `terms`, `support`, and `delete-account`.
   - Expected: navigation, footer, content, buttons, title, and meta description match the selected language.

7. Metadata
   - Inspect the rendered document.
   - Expected: `<html lang>` is `en`, `pt-BR`, or `es`.
   - Expected: each localized page has `hreflang` alternates for `en`, `pt-BR`, `es`, plus `x-default` pointing to `/en/`.

8. Fallbacks
   - Visit `/privacy`.
   - Expected: redirects based on saved/browser language.
   - Visit `/fr/privacy`.
   - Expected: redirects to `/en/privacy`.
   - Visit `/en/unknown-page`.
   - Expected: localized 404 content is shown.

## Spanish release follow-up (2026-11-16)

- Regional Spanish browser languages (`es-MX`, `es-AR`, `es-CO`, `es-CL`, `es-419`) now select `/es/` from the language-neutral homepage.
- Manual language choices are saved as `vivapantry.locale`; a saved choice takes priority over browser language on unprefixed marketing routes.
- Existing explicit `/es/`, `/en/`, and `/pt-BR/` links keep their language. Unprefixed English routes remain valid canonical English URLs.
- Page selection, query parameters, and fragments survive language detection. Authentication callbacks, password-reset routes, and `/app/` are excluded from automatic redirects.
- Spanish skip links and account-deletion cross-reference text are translated. The Spanish wording for compatible mobile builds and account email is corrected.
- Static pages were regenerated from the localized source. `node --test tests/language-navigation.test.mjs` passes six tests covering navigation, unavailable storage, regional tags, protected routes, metadata, and generated Spanish pages. Tests simulate browser APIs; a full interactive browser session has not been exercised.

The authenticated web-app export was also refreshed under `/app/` from the Spanish-enabled app release candidate (`riaanptrs/VivaPantry`, `fe5cbbb`). It was built with Expo's `experiments.baseUrl` set to `/app` during export, then regenerated through the existing static route builder. The app's root entry remains the existing web-access status page. Direct sign-in, language settings, recipe editing and meal-template routes were checked against their generated `/app/_expo/` bundle references. Existing hashed assets are retained for visitors with cached HTML. The new web bundle includes the released `es` option and the completed Spanish resource.
