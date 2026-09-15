import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteUrl = 'https://vivapantry.com';
const supportEmail = 'support@vivapantry.com';
const logoPath = '/assets/Mainicon.png';
const ogImage = `${siteUrl}${logoPath}`;
const appVersion = '1.0.2';
const androidPackage = 'com.riaan.vivapantry';
const currentYear = new Date().getFullYear();
const webAccessRoutes = {
  app: '/app/',
  signIn: '/app/sign-in/',
  createAccount: '/app/create-account/',
  resetPassword: '/reset-password/',
  updatePassword: '/update-password/',
};
// Temporary static pages keep public CTAs from 404ing until the authenticated Expo Web app has dedicated hosting.
const locales = {
  en: {
    folder: 'en',
    lang: 'en',
    data: JSON.parse(readFileSync(path.join(root, 'src/locales/en.json'), 'utf8')),
  },
  es: {
    folder: 'es',
    lang: 'es',
    data: JSON.parse(readFileSync(path.join(root, 'src/locales/es.json'), 'utf8')),
  },
  'pt-BR': {
    folder: 'pt-BR',
    lang: 'pt-BR',
    data: JSON.parse(readFileSync(path.join(root, 'src/locales/pt-BR.json'), 'utf8')),
  },
};

const pageKeys = ['pricing', 'privacy', 'terms', 'support', 'delete-account'];
const pageSlugs = {
  home: '',
  pricing: 'pricing',
  privacy: 'privacy',
  terms: 'terms',
  support: 'support',
  'delete-account': 'delete-account',
};

const canonicalPaths = {
  en: {
    home: '/',
    pricing: '/en/pricing/',
    privacy: '/privacy/',
    terms: '/terms/',
    support: '/support/',
    'delete-account': '/delete-account/',
  },
  es: {
    home: '/es/',
    pricing: '/es/pricing/',
    privacy: '/es/privacy/',
    terms: '/es/terms/',
    support: '/es/support/',
    'delete-account': '/es/delete-account/',
  },
  'pt-BR': {
    home: '/pt-BR/',
    pricing: '/pt-BR/pricing/',
    privacy: '/pt-BR/privacy/',
    terms: '/pt-BR/terms/',
    support: '/pt-BR/support/',
    'delete-account': '/pt-BR/delete-account/',
  },
};

const h1Overrides = {
  en: {
    privacy: 'VivaPantry Privacy Policy',
    terms: 'VivaPantry Terms of Use',
    support: 'VivaPantry Support',
    'delete-account': 'Delete your VivaPantry account',
  },
};

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function attr(value) {
  return esc(value);
}

function urlFor(locale, key) {
  return `${siteUrl}${canonicalPaths[locale][key]}`;
}

function homeUrlFor(locale) {
  return locale === 'en' ? `${siteUrl}/en/` : urlFor(locale, 'home');
}

function hrefFor(locale, key) {
  return canonicalPaths[locale][key];
}

function localeSwitchPath(locale, key) {
  return hrefFor(locale, key);
}

function formatCopyright(value) {
  return esc(String(value ?? '').replaceAll('{year}', String(currentYear)));
}

function alternates(key) {
  if (key === 'home') {
    return [
      ['en', homeUrlFor('en')],
      ['es', homeUrlFor('es')],
      ['pt-BR', homeUrlFor('pt-BR')],
      ['x-default', urlFor('en', 'home')],
    ];
  }

  return [
    ['en', urlFor('en', key)],
    ['es', urlFor('es', key)],
    ['pt-BR', urlFor('pt-BR', key)],
    ['x-default', urlFor('en', key)],
  ];
}

function layout({ locale, key, title, description, canonical, body, noindex = false }) {
  const { data, lang } = locales[locale];
  const nav = data.nav;
  const alternateTags = alternates(key)
    .map(([hreflang, href]) => `  <link rel="alternate" hreflang="${hreflang}" href="${attr(href)}">`)
    .join('\n');
  const robots = noindex ? '  <meta name="robots" content="noindex, nofollow">\n' : '';
  const schema = noindex ? '' : `\n${jsonLdTags(locale, key)}`;
  const pageTitle = `${title}`;

  return `<!DOCTYPE html>
<html lang="${attr(lang)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(pageTitle)}</title>
  <meta name="description" content="${attr(description)}">
${robots}  <link rel="canonical" href="${attr(canonical)}">
${alternateTags}
  <meta property="og:site_name" content="VivaPantry">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${attr(pageTitle)}">
  <meta property="og:description" content="${attr(description)}">
  <meta property="og:url" content="${attr(canonical)}">
  <meta property="og:image" content="${attr(ogImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${attr(pageTitle)}">
  <meta name="twitter:description" content="${attr(description)}">
  <meta name="twitter:image" content="${attr(ogImage)}">
  <meta name="theme-color" content="#4CAF50">
  <link rel="icon" type="image/png" href="${logoPath}">
  <link rel="apple-touch-icon" href="${logoPath}">
  <link rel="stylesheet" href="/styles.css">
${schema}</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <a class="brand" href="${hrefFor(locale, 'home')}" aria-label="${attr(nav.homeAria ?? 'VivaPantry home')}">
      <img src="${logoPath}" width="40" height="40" alt="">
      <span>VivaPantry</span>
    </a>
    <nav class="nav" aria-label="${attr(nav.primary ?? 'Primary navigation')}">
      <a href="${hrefFor(locale, 'home')}">${esc(nav.home)}</a>
      <a href="${hrefFor(locale, 'home')}#features">${esc(nav.features)}</a>
      <a href="${hrefFor(locale, 'home')}#how-it-works">${esc(nav.howItWorks)}</a>
      <a href="${hrefFor(locale, 'pricing')}">${esc(nav.pricing)}</a>
      <a href="${hrefFor(locale, 'support')}">${esc(nav.support)}</a>
    </nav>
    <nav class="app-cta-nav" aria-label="${attr(data.webAccess.navLabel)}">
      <a class="app-cta primary" href="${webAccessRoutes.app}">${esc(data.webAccess.openWeb)}</a>
      <a class="app-cta" href="${webAccessRoutes.signIn}">${esc(data.webAccess.signIn)}</a>
      <a class="app-cta" href="${webAccessRoutes.createAccount}">${esc(data.webAccess.createAccount)}</a>
    </nav>
    <details class="language-menu">
      <summary>${esc(data.language[locale])}</summary>
      <nav class="language-nav" aria-label="${attr(data.language.label)}">
      ${Object.keys(locales)
        .map((code) => `<a href="${localeSwitchPath(code, key)}" hreflang="${code}" lang="${code}"${code === locale ? ' aria-current="true"' : ''}>${esc(locales[locale].data.language[code])}</a>`)
        .join('\n      ')}
    </nav>
    </details>
  </header>
  <main id="main">
${body}
  </main>
  <footer class="site-footer">
    <p>${esc(data.footer.tagline)}</p>
    <nav aria-label="${attr(data.footer.navigation)}">
      <a href="${hrefFor(locale, 'privacy')}">${esc(data.footer.privacy)}</a>
      <a href="${hrefFor(locale, 'pricing')}">${esc(data.footer.pricing)}</a>
      <a href="${hrefFor(locale, 'terms')}">${esc(data.footer.terms)}</a>
      <a href="${hrefFor(locale, 'support')}">${esc(data.footer.support)}</a>
      <a href="${hrefFor(locale, 'delete-account')}">${esc(data.footer.deleteAccount)}</a>
    </nav>
    <p><a href="mailto:${supportEmail}">${supportEmail}</a></p>
    <p>${formatCopyright(data.footer.copyright)}</p>
  </footer>
  <script src="/script.js" defer></script>
</body>
</html>
`;
}

function jsonLdTags(locale, key) {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VivaPantry',
    url: siteUrl,
    logo: ogImage,
    email: supportEmail,
  };
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VivaPantry',
    url: siteUrl,
    inLanguage: ['en', 'es', 'pt-BR'],
  };
  const app = {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: 'VivaPantry',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Android',
    softwareVersion: appVersion,
    identifier: androidPackage,
    url: siteUrl,
    description: locales[locale].data.meta.home.description,
  };
  const nodes = key === 'home' ? [organization, website, app] : [organization];
  return nodes
    .map((node) => `  <script type="application/ld+json">${JSON.stringify(node)}</script>`)
    .join('\n');
}

function homeBody(locale) {
  const t = locales[locale].data.home;
  const featureIcons = {
    pantryTracking: '/assets/icons/pantry.svg',
    receiptScanning: '/assets/icons/receipt-scan.svg',
    aiMealPlanning: '/assets/icons/ai-spark.svg',
    groceryLists: '/assets/icons/shopping-list.svg',
    shoppingVoiceCommands: '/assets/icons/shopping-list.svg',
    recipes: '/assets/icons/recipes.svg',
    householdPreferences: '/assets/icons/household.svg',
  };

  return `    <section class="hero product-hero">
      <div class="hero-copy">
        <p class="eyebrow">${esc(t.eyebrow)}</p>
        <h1>${esc(t.heroTitle)}</h1>
        <p class="lead">${esc(t.heroText)}</p>
        <div class="hero-actions" aria-label="${attr(t.primaryActions)}">
          <a class="button primary" href="mailto:${supportEmail}?subject=VivaPantry%20Android%20access">${esc(t.primaryCta)}</a>
          <a class="button secondary" href="${hrefFor(locale, 'privacy')}">${esc(t.secondaryCta)}</a>
        </div>
        <p class="trust-note">${esc(t.trustNote)}</p>
      </div>
      <div class="hero-showcase" aria-label="${attr(t.previewAria)}">
        <img class="hero-phone primary-phone" src="/assets/images/app-home-en.png" width="458" height="994" alt="${attr(t.previewAria)}" fetchpriority="high" decoding="async">
        <img class="hero-phone secondary-phone" src="/assets/images/app-shop-console-en.png" width="900" height="2000" alt="${attr(t.features.groceryLists.title)}" fetchpriority="high" decoding="async">
      </div>
    </section>
    <section class="flow-strip" aria-label="${attr(t.flowAria)}">
      ${Object.values(t.flow).map((item) => `<span><strong>${esc(item.icon)}</strong>${esc(item.label)}</span>`).join('\n      ')}
    </section>
    <section class="proof-strip" aria-label="${attr(t.featuresEyebrow)}">
      <article>
        <strong>${esc(t.flow.plan.label)}</strong>
        <span>${esc(t.features.aiMealPlanning.title)}</span>
      </article>
      <article>
        <strong>${esc(t.flow.shop.label)}</strong>
        <span>${esc(t.features.groceryLists.title)}</span>
      </article>
      <article>
        <strong>${esc(t.flow.store.label)}</strong>
        <span>${esc(t.features.pantryTracking.title)}</span>
      </article>
      <article>
        <strong>${esc(t.flow.repeat.label)}</strong>
        <span>${esc(t.features.receiptScanning.title)}</span>
      </article>
    </section>
    <section id="how-it-works" class="split-section">
      <div>
        <p class="eyebrow">${esc(t.loopEyebrow)}</p>
        <h2>${esc(t.loopTitle)}</h2>
        <p>${esc(t.loopText)}</p>
        <p>${esc(t.loopBenefit)}</p>
      </div>
      <img src="/assets/images/viva-loop.png" width="1600" height="900" loading="lazy" alt="${attr(t.loopAria)}">
    </section>
    <section class="screenshot-section">
      <div class="screenshot-copy">
        <p class="eyebrow">${esc(t.features.groceryLists.title)}</p>
        <h2>${esc(t.features.groceryLists.text)}</h2>
        <p>${esc(t.loopBenefit)}</p>
      </div>
      <img class="wide-screenshot" src="/assets/images/app-shop-console-en.png" width="900" height="2000" loading="lazy" alt="${attr(t.features.groceryLists.title)}">
    </section>
    <section id="features" class="content-section">
      <p class="eyebrow">${esc(t.featuresEyebrow)}</p>
      <h2>${esc(t.featuresTitle)}</h2>
      <div class="feature-grid">
        ${Object.entries(t.features).map(([id, item]) => `<article class="feature-card">
          <img src="${featureIcons[id] ?? '/assets/icons/ai-spark.svg'}" width="32" height="32" alt="">
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.text)}</p>
        </article>`).join('\n        ')}
      </div>
    </section>
    <section class="split-section app-preview">
      <div>
        <p class="eyebrow">${esc(t.readinessEyebrow)}</p>
        <h2>${esc(t.readinessTitle)}</h2>
        <p>${esc(t.readinessText)}</p>
        <ul class="readiness-list">
          ${Object.values(t.readiness).map((item) => `<li>${esc(item)}</li>`).join('\n          ')}
        </ul>
        <div class="hero-actions">
          <a class="button primary" href="mailto:${supportEmail}?subject=VivaPantry%20Android%20release">${esc(t.readinessCta)}</a>
          <a class="button secondary" href="${hrefFor(locale, 'privacy')}">${esc(t.readinessSecondary)}</a>
        </div>
      </div>
      <img src="/assets/images/app-home-en.png" width="458" height="994" loading="lazy" alt="${attr(t.previewAria)}">
    </section>
    <section class="content-section trust-section">
      <p class="eyebrow">${esc(t.trustEyebrow)}</p>
      <h2>${esc(t.trustTitle)}</h2>
      <p>${esc(t.trustText)}</p>
    </section>`;
}

function parseSections(value) {
  return String(value ?? '')
    .split('|||')
    .map((block) => block.split('||').map((part) => part.trim()).filter(Boolean))
    .filter((parts) => parts.length);
}

function legalBody(locale, key) {
  const t = locales[locale].data[key];
  const title = h1Overrides[locale]?.[key] ?? t.title;
  const sections = parseSections(t.sections);
  return `    <section class="page-hero">
      <p class="eyebrow">${esc(t.eyebrow)}</p>
      <h1>${esc(title)}</h1>
      <p class="lead">${esc(t.lead)}</p>
    </section>
    <section class="legal-content">
      ${sections.map((parts) => {
        const [heading, ...items] = parts;
        return `<article>
        <h2>${esc(heading)}</h2>
        ${items.map((item) => renderLegalItem(item)).join('\n        ')}
      </article>`;
      }).join('\n      ')}
    </section>`;
}

function pricingBody(locale) {
  const t = locales[locale].data.pricing;
  return `    <section class="page-hero">
      <p class="eyebrow">${esc(t.eyebrow)}</p>
      <h1>${esc(t.title)}</h1>
      <p class="lead">${esc(t.lead)}</p>
      <div class="hero-actions">
        <a class="button primary" href="${webAccessRoutes.createAccount}">${esc(locales[locale].data.webAccess.createAccount)}</a>
        <a class="button secondary" href="${webAccessRoutes.signIn}">${esc(locales[locale].data.webAccess.signIn)}</a>
      </div>
    </section>
    <section class="pricing-grid" aria-label="${attr(t.cardsLabel)}">
      <article class="pricing-card">
        <p class="eyebrow">${esc(t.freeEyebrow)}</p>
        <h2>${esc(t.freeTitle)}</h2>
        <p class="price-line">${esc(t.freePrice)}</p>
        <ul>${t.freeItems.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
      </article>
      <article class="pricing-card featured">
        <p class="eyebrow">${esc(t.premiumEyebrow)}</p>
        <h2>${esc(t.premiumTitle)}</h2>
        <p class="price-line">${esc(t.premiumPrice)}</p>
        <ul>${t.premiumItems.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
      </article>
    </section>
    <section class="content-section pricing-note">
      <p>${esc(t.note)}</p>
    </section>`;
}

function renderLegalItem(item) {
  const listItems = item.split('|').map((part) => part.trim()).filter(Boolean);
  if (listItems.length > 1) {
    return `<ul>${listItems.map((part) => `<li>${safeInline(part)}</li>`).join('')}</ul>`;
  }
  return `<p>${safeInline(item)}</p>`;
}

function pageBody(locale, key) {
  if (key === 'pricing') {
    return pricingBody(locale);
  }

  return legalBody(locale, key);
}

function safeInline(value) {
  return esc(value)
    .replaceAll('&lt;a href=&quot;mailto:support@vivapantry.com&quot;&gt;support@vivapantry.com&lt;/a&gt;', `<a href="mailto:${supportEmail}">${supportEmail}</a>`)
    .replaceAll('&lt;a href=&quot;/en/delete-account/&quot;&gt;English&lt;/a&gt;', '<a href="/delete-account/">English</a>')
    .replaceAll('&lt;a href=&quot;/pt-BR/delete-account/&quot;&gt;português&lt;/a&gt;', '<a href="/pt-BR/delete-account/">português</a>')
    .replaceAll('&lt;br&gt;', '<br>');
}

function pageMeta(locale, key) {
  const meta = locales[locale].data.meta[key];
  return {
    title: meta.title,
    description: meta.description,
  };
}

function writePage(filePath, html) {
  const fullPath = path.join(root, filePath);
  mkdirSync(path.dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, html, 'utf8');
}

function aliasPage({ filePath, lang = 'en', title, description, canonical, refresh = false }) {
  const refreshTag = refresh ? `  <meta http-equiv="refresh" content="0; url=${attr(canonical.replace(siteUrl, ''))}">\n` : '';
  return `<!DOCTYPE html>
<html lang="${attr(lang)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${attr(description)}">
  <meta name="robots" content="noindex, follow">
${refreshTag}  <link rel="canonical" href="${attr(canonical)}">
  <link rel="icon" type="image/png" href="${logoPath}">
</head>
<body>
  <main>
    <h1>${esc(title)}</h1>
    <p><a href="${attr(canonical.replace(siteUrl, ''))}">Continue to VivaPantry</a></p>
  </main>
</body>
</html>
`;
}

function writeCanonicalPages() {
  for (const locale of Object.keys(locales)) {
    const homeMeta = pageMeta(locale, 'home');
    const homeHtml = layout({
      locale,
      key: 'home',
      title: homeMeta.title,
      description: homeMeta.description,
      canonical: urlFor(locale, 'home'),
      body: homeBody(locale),
    });
    writePage(locale === 'en' ? 'index.html' : `${locales[locale].folder}/index.html`, homeHtml);
    if (locale === 'en') {
      writePage('en/index.html', layout({
        locale,
        key: 'home',
        title: homeMeta.title,
        description: homeMeta.description,
        canonical: homeUrlFor('en'),
        body: homeBody(locale),
      }));
    }

    for (const key of pageKeys) {
      const meta = pageMeta(locale, key);
      const html = layout({
        locale,
        key,
        title: meta.title,
        description: meta.description,
        canonical: urlFor(locale, key),
        body: pageBody(locale, key),
      });
      const canonicalPath = canonicalPaths[locale][key].replace(/^\/|\/$/g, '');
      writePage(`${canonicalPath}/index.html`, html);

      if (locale === 'en') {
        writePage(`${pageSlugs[key]}.html`, aliasPage({
          filePath: `${pageSlugs[key]}.html`,
          title: meta.title,
          description: meta.description,
          canonical: urlFor(locale, key),
          refresh: true,
        }));
        const enAliasPath = `/en/${pageSlugs[key]}/`;
        if (canonicalPaths.en[key] !== enAliasPath) {
          writePage(`en/${pageSlugs[key]}/index.html`, aliasPage({
            filePath: `en/${pageSlugs[key]}/index.html`,
            title: meta.title,
            description: meta.description,
            canonical: urlFor(locale, key),
            refresh: true,
          }));
        }
      }
    }
  }

  for (const key of ['home', ...pageKeys]) {
    const target = urlFor('pt-BR', key);
    const filePath = key === 'home' ? 'pt/index.html' : `pt/${pageSlugs[key]}/index.html`;
    writePage(filePath, aliasPage({
      filePath,
      lang: 'pt-BR',
      title: locales['pt-BR'].data.meta[key].title,
      description: locales['pt-BR'].data.meta[key].description,
      canonical: target,
      refresh: true,
    }));
  }
}

function writeUtilityPages() {
  const utilityLocalePaths = {
    en: '',
    es: 'es/',
    'pt-BR': 'pt-BR/',
  };
  const utilityRoutes = {
    app: 'app/',
    signIn: 'sign-in/',
    createAccount: 'create-account/',
    resetPassword: 'reset-password/',
    updatePassword: 'update-password/',
  };
  const utilityPathFor = (locale, key) => `/${utilityLocalePaths[locale]}${utilityRoutes[key]}`;
  const utilityLanguageLinks = (currentLocale, key) => Object.keys(locales)
    .map((code) => {
      const active = code === currentLocale ? ' aria-current="true"' : '';
      return `<a href="${utilityPathFor(code, key)}" hreflang="${code}" lang="${code}"${active}>${esc(locales[currentLocale].data.language[code])}</a>`;
    })
    .join('\n      ');
  const utilityLayout = ({
    locale = 'en',
    key,
    title,
    description,
    eyebrow,
    heading,
    text,
    actions = [],
    formHtml = '',
    scriptHtml = '',
  }) => {
    const canonical = `${siteUrl}${utilityPathFor(locale, key)}`;
    return `<!DOCTYPE html>
<html lang="${attr(locales[locale].lang)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${attr(description)}">
  <meta name="robots" content="noindex, nofollow">
  <link rel="canonical" href="${attr(canonical)}">
  <link rel="icon" type="image/png" href="${logoPath}">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <main class="utility-page web-access-page">
    <img src="${logoPath}" width="48" height="48" alt="">
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h1>${esc(heading)}</h1>
    <p>${esc(text)}</p>
${formHtml}
    <div class="hero-actions">
      ${actions.map((action) => `<a class="button ${action.kind ?? 'secondary'}" href="${attr(action.href)}">${esc(action.label)}</a>`).join('\n      ')}
    </div>
    <nav class="utility-language-nav" aria-label="${attr(locales[locale].data.language.label)}">
      ${utilityLanguageLinks(locale, key)}
    </nav>
  </main>
${scriptHtml}</body>
</html>
`;
  };

  const accessPages = [
    {
      key: 'app',
      subject: 'VivaPantry web access',
      actions: (t) => [
        { kind: 'primary', href: `mailto:${supportEmail}?subject=VivaPantry%20web%20access`, label: t.contactSupport },
        { href: '/', label: t.backHome },
      ],
    },
    {
      key: 'signIn',
      actions: (t, locale) => [
        { kind: 'primary', href: utilityPathFor(locale, 'resetPassword'), label: t.resetPassword },
        { href: `mailto:${supportEmail}?subject=VivaPantry%20account%20access`, label: t.contactSupport },
      ],
    },
    {
      key: 'createAccount',
      actions: (t) => [
        { kind: 'primary', href: `mailto:${supportEmail}?subject=VivaPantry%20account%20access`, label: t.contactSupport },
        { href: '/', label: t.backHome },
      ],
    },
  ];

  for (const locale of Object.keys(locales)) {
    const t = locales[locale].data.accountAccess;

    for (const page of accessPages) {
      const copy = t[page.key];
      writePage(`${utilityLocalePaths[locale]}${utilityRoutes[page.key]}index.html`, utilityLayout({
        locale,
        key: page.key,
        title: copy.title,
        description: copy.description,
        eyebrow: t.eyebrow,
        heading: copy.heading,
        text: copy.text,
        actions: page.actions(t, locale),
      }));
    }

    const resetCopy = t.resetPasswordPage;
    writePage(`${utilityLocalePaths[locale]}${utilityRoutes.resetPassword}index.html`, utilityLayout({
      locale,
      key: 'resetPassword',
      title: resetCopy.title,
      description: resetCopy.description,
      eyebrow: t.eyebrow,
      heading: resetCopy.heading,
      text: resetCopy.text,
      actions: [{ href: utilityPathFor(locale, 'signIn'), label: t.backToAccountAccess }],
      formHtml: `    <form class="account-form" id="reset-password-form" data-config-error="${attr(resetCopy.configError)}" data-sending-message="${attr(resetCopy.sendingMessage)}" data-success-message="${attr(resetCopy.successMessage)}" data-failure-message="${attr(resetCopy.failureMessage)}">
      <label for="reset-email">${esc(t.emailLabel)}</label>
      <input id="reset-email" name="email" type="email" autocomplete="email" required placeholder="${attr(t.emailPlaceholder)}">
      <button class="button primary" type="submit">${esc(resetCopy.submitLabel)}</button>
      <p class="form-status" id="reset-password-status" role="status" aria-live="polite">${esc(resetCopy.readyMessage)}</p>
    </form>`,
      scriptHtml: `  <script src="/supabase-web-config.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.105.1/dist/umd/supabase.min.js" defer></script>
  <script src="/password-reset.js" defer></script>
`,
    }));

    const updateCopy = t.updatePasswordPage;
    writePage(`${utilityLocalePaths[locale]}${utilityRoutes.updatePassword}index.html`, utilityLayout({
      locale,
      key: 'updatePassword',
      title: updateCopy.title,
      description: updateCopy.description,
      eyebrow: t.eyebrow,
      heading: updateCopy.heading,
      text: updateCopy.text,
      actions: [{ href: utilityPathFor(locale, 'signIn'), label: t.backToAccountAccess }],
      formHtml: `    <form class="account-form" id="update-password-form" data-config-error="${attr(updateCopy.configError)}" data-token-error="${attr(updateCopy.tokenError)}" data-session-ready-message="${attr(updateCopy.sessionReadyMessage)}" data-updating-message="${attr(updateCopy.updatingMessage)}" data-success-message="${attr(updateCopy.successMessage)}" data-failure-message="${attr(updateCopy.failureMessage)}">
      <label for="new-password">${esc(t.newPasswordLabel)}</label>
      <input id="new-password" name="password" type="password" autocomplete="new-password" required minlength="8" placeholder="${attr(t.newPasswordPlaceholder)}">
      <button class="button primary" type="submit">${esc(updateCopy.submitLabel)}</button>
      <p class="form-status" id="update-password-status" role="status" aria-live="polite">${esc(updateCopy.readyMessage)}</p>
    </form>`,
      scriptHtml: `  <script src="/supabase-web-config.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.105.1/dist/umd/supabase.min.js" defer></script>
  <script src="/password-update.js" defer></script>
`,
    }));
  }

  writePage('google-drive-auth.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connecting Google Drive | VivaPantry</title>
  <meta name="description" content="VivaPantry Google Drive connection callback.">
  <meta name="robots" content="noindex, nofollow">
  <link rel="canonical" href="${siteUrl}/google-drive-auth.html">
  <link rel="icon" type="image/png" href="${logoPath}">
</head>
<body>
  <main class="utility-page">
    <img src="${logoPath}" width="48" height="48" alt="">
    <h1>Connecting Google Drive</h1>
    <p>You can return to the VivaPantry app to finish this connection.</p>
  </main>
</body>
</html>
`);

  writePage('404.html', layout({
    locale: 'en',
    key: 'home',
    title: locales.en.data.meta['404'].title,
    description: locales.en.data.meta['404'].description,
    canonical: `${siteUrl}/404.html`,
    noindex: true,
    body: `    <section class="page-hero">
      <p class="eyebrow">${esc(locales.en.data.notFound.eyebrow)}</p>
      <h1>${esc(locales.en.data.notFound.title)}</h1>
      <p class="lead">${esc(locales.en.data.notFound.lead)}</p>
      <a class="button primary" href="/">${esc(locales.en.data.notFound.cta)}</a>
    </section>`,
  }));
}

function writeRobotsAndSitemap() {
  const sitemapUrls = [
    ['en-root', 'home'],
    ['en', 'home'],
    ['es', 'home'],
    ['pt-BR', 'home'],
    ...pageKeys.flatMap((key) => [
      ['en', key],
      ['es', key],
      ['pt-BR', key],
    ]),
  ];
  const unique = new Map();
  sitemapUrls.forEach(([locale, key]) => {
    const loc = locale === 'en-root' ? urlFor('en', key) : key === 'home' ? homeUrlFor(locale) : urlFor(locale, key);
    unique.set(loc, { locale, key });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...unique.entries()].map(([loc, { key }]) => `  <url>
    <loc>${loc}</loc>
${alternates(key).map(([hreflang, href]) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`).join('\n')}
  </url>`).join('\n')}
</urlset>
`;

  writePage('robots.txt', `User-agent: *
Allow: /
Disallow: /callback
Disallow: /callback.html
Disallow: /google-drive-auth.html
Disallow: /app/
Disallow: /sign-in/
Disallow: /create-account/
Disallow: /reset-password/
Disallow: /update-password/
Disallow: /es/app/
Disallow: /es/sign-in/
Disallow: /es/create-account/
Disallow: /es/reset-password/
Disallow: /es/update-password/
Disallow: /pt-BR/app/
Disallow: /pt-BR/sign-in/
Disallow: /pt-BR/create-account/
Disallow: /pt-BR/reset-password/
Disallow: /pt-BR/update-password/
Disallow: /household-invite
Disallow: /dev/
Disallow: /(auth)/
Disallow: /(tabs)/
Disallow: /auth/
Disallow: /onboarding
Disallow: /pantry
Disallow: /grocery
Disallow: /recipes/
Disallow: /meal-plan
Disallow: /settings
Disallow: /shop

Sitemap: ${siteUrl}/sitemap.xml
`);
  writePage('sitemap.xml', sitemap);
}

function writeAssets() {
  writePage('styles.css', readFileSync(path.join(root, 'styles/site.css'), 'utf8'));

  writePage('script.js', `document.documentElement.classList.add('js-enabled');
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (event) {
    var target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  });
});
`);

  writePage('supabase-web-config.js', `window.VivaPantrySupabaseConfig = {
  supabaseUrl: '',
  supabaseAnonKey: ''
};
`);

  writePage('password-reset.js', `(function () {
  var form = document.getElementById('reset-password-form');
  var status = document.getElementById('reset-password-status');
  if (!form || !status) return;

  function setStatus(message) {
    status.textContent = message;
  }

  function getClient() {
    var config = window.VivaPantrySupabaseConfig || {};
    if (!config.supabaseUrl || !config.supabaseAnonKey || !window.supabase) {
      throw new Error(form.getAttribute('data-config-error') || 'Password reset is not configured yet.');
    }
    return window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var email = String(new FormData(form).get('email') || '').trim();
    if (!email) return;

    try {
      setStatus(form.getAttribute('data-sending-message') || 'Sending reset email...');
      getClient().auth.resetPasswordForEmail(email, {
        redirectTo: 'https://vivapantry.com/update-password/'
      }).then(function (result) {
        if (result.error) throw result.error;
        form.reset();
        setStatus(form.getAttribute('data-success-message') || 'If an account exists for that email, a password reset link has been sent.');
      }).catch(function (error) {
        setStatus(error && error.message ? error.message : form.getAttribute('data-failure-message') || 'Password reset could not be started.');
      });
    } catch (error) {
      setStatus(error && error.message ? error.message : form.getAttribute('data-failure-message') || 'Password reset could not be started.');
    }
  });
})();
`);

  writePage('password-update.js', `(function () {
  var form = document.getElementById('update-password-form');
  var status = document.getElementById('update-password-status');
  if (!form || !status) return;

  var client;

  function setStatus(message) {
    status.textContent = message;
  }

  function setFormDisabled(disabled) {
    Array.prototype.forEach.call(form.elements, function (element) {
      element.disabled = disabled;
    });
  }

  function getParams() {
    var params = new URLSearchParams(window.location.search || '');
    var hash = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
    hash.forEach(function (value, key) {
      if (!params.has(key)) params.set(key, value);
    });
    return params;
  }

  function getClient() {
    var config = window.VivaPantrySupabaseConfig || {};
    if (!config.supabaseUrl || !config.supabaseAnonKey || !window.supabase) {
      throw new Error(form.getAttribute('data-config-error') || 'Password update is not configured yet.');
    }
    if (!client) {
      client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });
    }
    return client;
  }

  function prepareSession() {
    var params = getParams();
    var error = params.get('error_description') || params.get('error');
    if (error) {
      return Promise.reject(new Error(error));
    }

    var auth = getClient().auth;
    var code = params.get('code');
    var tokenHash = params.get('token_hash');
    var accessToken = params.get('access_token');
    var refreshToken = params.get('refresh_token');

    if (code) return auth.exchangeCodeForSession(code);
    if (tokenHash) return auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
    if (accessToken && refreshToken) return auth.setSession({ access_token: accessToken, refresh_token: refreshToken });

    return Promise.reject(new Error(form.getAttribute('data-token-error') || 'Open the reset link from your email before setting a password.'));
  }

  try {
    prepareSession().then(function (result) {
      if (result.error) throw result.error;
      setFormDisabled(false);
      setStatus(form.getAttribute('data-session-ready-message') || 'Enter a new password to finish the reset.');
    }).catch(function (error) {
      setFormDisabled(true);
      setStatus(error && error.message ? error.message : 'The reset link could not be verified.');
    });
  } catch (error) {
    setFormDisabled(true);
    setStatus(error && error.message ? error.message : 'The reset link could not be verified.');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var password = String(new FormData(form).get('password') || '');
    if (!password) return;

    try {
      setStatus(form.getAttribute('data-updating-message') || 'Updating password...');
      getClient().auth.updateUser({ password: password }).then(function (result) {
        if (result.error) throw result.error;
        form.reset();
        setStatus(form.getAttribute('data-success-message') || 'Your password has been updated. You can return to VivaPantry account access.');
      }).catch(function (error) {
        setStatus(error && error.message ? error.message : form.getAttribute('data-failure-message') || 'Password could not be updated.');
      });
    } catch (error) {
      setStatus(error && error.message ? error.message : form.getAttribute('data-failure-message') || 'Password could not be updated.');
    }
  });
})();
`);
}

writeCanonicalPages();
writeUtilityPages();
writeRobotsAndSitemap();
writeAssets();
