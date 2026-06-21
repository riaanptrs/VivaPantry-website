import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve('pantrypal-website');
const siteUrl = 'https://vivapantry.com';
const supportEmail = 'support@vivapantry.com';
const logoPath = '/assets/Mainicon.png';
const ogImage = `${siteUrl}${logoPath}`;
const appVersion = '1.0.1';
const androidPackage = 'com.riaan.vivapantry';
const currentYear = new Date().getFullYear();
const webAccessRoutes = {
  app: '/app/',
  signIn: '/sign-in/',
  createAccount: '/create-account/',
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
      <a href="${hrefFor(locale, 'privacy')}">${esc(nav.privacy)}</a>
      <a href="${hrefFor(locale, 'terms')}">${esc(nav.terms)}</a>
      <a href="${hrefFor(locale, 'support')}">${esc(nav.support)}</a>
      <a href="${hrefFor(locale, 'delete-account')}">${esc(nav.deleteAccount)}</a>
    </nav>
    <nav class="app-cta-nav" aria-label="${attr(data.webAccess.navLabel)}">
      <a class="app-cta primary" href="${webAccessRoutes.app}">${esc(data.webAccess.openWeb)}</a>
      <a class="app-cta" href="${webAccessRoutes.signIn}">${esc(data.webAccess.signIn)}</a>
      <a class="app-cta" href="${webAccessRoutes.createAccount}">${esc(data.webAccess.createAccount)}</a>
    </nav>
    <nav class="language-nav" aria-label="${attr(data.language.label)}">
      ${Object.keys(locales)
        .map((code) => `<a href="${localeSwitchPath(code, key)}" hreflang="${code}" lang="${code}">${esc(locales[locale].data.language[code])}</a>`)
        .join('\n      ')}
    </nav>
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
  const accessPages = [
    {
      path: 'app/index.html',
      title: 'Open VivaPantry Web',
      heading: 'VivaPantry Web access',
      text: 'The authenticated VivaPantry Web app is being prepared for a dedicated deployment. For now, use the Android app or contact support for access help.',
      primaryLabel: 'Sign in',
      primaryHref: webAccessRoutes.signIn,
    },
    {
      path: 'sign-in/index.html',
      title: 'Sign in | VivaPantry',
      heading: 'Sign in to VivaPantry',
      text: 'Web sign-in is not yet hosted on this static public site. The mobile app remains the production sign-in surface while dedicated web hosting is prepared.',
      primaryLabel: 'Contact support',
      primaryHref: `mailto:${supportEmail}?subject=VivaPantry%20web%20sign-in`,
    },
    {
      path: 'create-account/index.html',
      title: 'Create account | VivaPantry',
      heading: 'Create a VivaPantry account',
      text: 'Account creation currently happens in the VivaPantry app. Dedicated web account creation should move to the future hosted web app.',
      primaryLabel: 'Contact support',
      primaryHref: `mailto:${supportEmail}?subject=VivaPantry%20account%20access`,
    },
  ];

  for (const page of accessPages) {
    writePage(page.path, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(page.title)}</title>
  <meta name="description" content="VivaPantry web app access information.">
  <meta name="robots" content="noindex, nofollow">
  <link rel="canonical" href="${siteUrl}/${page.path.replace(/index\.html$/, '')}">
  <link rel="icon" type="image/png" href="${logoPath}">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <main class="utility-page web-access-page">
    <img src="${logoPath}" width="48" height="48" alt="">
    <p class="eyebrow">VivaPantry Web</p>
    <h1>${esc(page.heading)}</h1>
    <p>${esc(page.text)}</p>
    <div class="hero-actions">
      <a class="button primary" href="${attr(page.primaryHref)}">${esc(page.primaryLabel)}</a>
      <a class="button secondary" href="/">Back to VivaPantry</a>
    </div>
  </main>
</body>
</html>
`);
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
  writePage('styles.css', `:root {
  color-scheme: light;
  --green: #4caf50;
  --green-dark: #14532d;
  --green-soft: #eaf7ea;
  --ink: #172016;
  --muted: #5f6f63;
  --line: #dfe8df;
  --paper: #fffef9;
  --white: #ffffff;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--paper); color: var(--ink); }
a { color: var(--green-dark); }
img { max-width: 100%; height: auto; }
.skip-link { position: absolute; left: -999px; top: 12px; background: var(--white); padding: 10px 14px; border-radius: 8px; z-index: 10; }
.skip-link:focus { left: 12px; }
.site-header { display: flex; align-items: center; gap: 20px; justify-content: space-between; padding: 18px clamp(18px, 5vw, 64px); border-bottom: 1px solid var(--line); background: rgba(255, 254, 249, 0.94); position: sticky; top: 0; z-index: 5; backdrop-filter: blur(12px); }
.brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; text-decoration: none; color: var(--ink); }
.brand img { border-radius: 12px; }
.nav, .app-cta-nav, .language-nav, .site-footer nav { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }
.nav a, .language-nav a, .site-footer a { font-size: 14px; text-decoration: none; font-weight: 650; }
.app-cta { display: inline-flex; min-height: 38px; align-items: center; justify-content: center; border: 1px solid var(--line); border-radius: 999px; padding: 0 14px; background: var(--white); color: var(--green-dark); font-size: 13px; font-weight: 800; text-decoration: none; }
.app-cta.primary { border-color: var(--green); background: var(--green); color: var(--white); }
.language-nav { padding-left: 12px; border-left: 1px solid var(--line); }
main { overflow: hidden; }
.hero, .split-section, .content-section, .page-hero, .legal-content { width: min(1120px, calc(100% - 36px)); margin-inline: auto; }
.hero { min-height: 74vh; display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(280px, 0.95fr); gap: clamp(28px, 6vw, 72px); align-items: center; padding: clamp(48px, 8vw, 96px) 0 42px; }
.hero-visual { display: grid; justify-items: center; }
.hero-image { width: min(100%, 360px); max-height: 74vh; object-fit: contain; border-radius: 28px; box-shadow: 0 24px 80px rgba(20, 83, 45, 0.14); }
.eyebrow { margin: 0 0 12px; color: var(--green-dark); font-weight: 850; text-transform: uppercase; letter-spacing: 0; font-size: 13px; }
h1, h2, h3 { letter-spacing: 0; line-height: 1.08; margin: 0; }
h1 { font-size: clamp(42px, 6vw, 76px); max-width: 900px; }
h2 { font-size: clamp(30px, 4vw, 48px); margin-bottom: 16px; }
h3 { font-size: 20px; margin-bottom: 8px; }
p, li { color: var(--muted); line-height: 1.65; font-size: 17px; }
.lead { font-size: clamp(18px, 2vw, 22px); max-width: 720px; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin: 26px 0 14px; }
.button { display: inline-flex; min-height: 48px; align-items: center; justify-content: center; border-radius: 999px; padding: 0 22px; font-weight: 800; text-decoration: none; }
.button.primary { background: var(--green); color: var(--white); }
.button.secondary { border: 1px solid var(--line); background: var(--white); color: var(--green-dark); }
.trust-note { font-size: 14px; }
.flow-strip { width: min(920px, calc(100% - 36px)); margin: 0 auto 44px; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.flow-strip span { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--line); border-radius: 999px; padding: 8px 14px; background: var(--white); color: var(--muted); font-weight: 700; }
.flow-strip strong { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: var(--green-soft); color: var(--green-dark); }
.split-section { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(24px, 5vw, 64px); align-items: center; padding: 72px 0; }
.split-section img { width: 100%; border-radius: 20px; border: 1px solid var(--line); background: var(--white); }
.content-section { padding: 72px 0; }
.feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 28px; }
.feature-card { background: var(--white); border: 1px solid var(--line); border-radius: 14px; padding: 22px; }
.feature-card img { margin-bottom: 18px; }
.app-preview img { width: min(100%, 360px); max-height: 620px; object-fit: contain; justify-self: center; }
.trust-section { border-top: 1px solid var(--line); }
.page-hero { padding: 72px 0 28px; }
.page-hero h1 { font-size: clamp(38px, 5vw, 64px); }
.legal-content { padding: 20px 0 72px; display: grid; gap: 22px; }
.legal-content article { background: var(--white); border: 1px solid var(--line); border-radius: 14px; padding: clamp(20px, 4vw, 34px); }
.legal-content ul { padding-left: 22px; }
.pricing-grid { width: min(1120px, calc(100% - 36px)); margin: 0 auto 28px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.pricing-card { background: var(--white); border: 1px solid var(--line); border-radius: 14px; padding: clamp(22px, 4vw, 36px); }
.pricing-card.featured { border-color: var(--green); box-shadow: 0 18px 60px rgba(20, 83, 45, 0.12); }
.pricing-card ul { padding-left: 22px; }
.price-line { color: var(--green-dark); font-size: 20px; font-weight: 850; }
.pricing-note { padding-top: 10px; }
.site-footer { border-top: 1px solid var(--line); padding: 28px clamp(18px, 5vw, 64px); display: grid; gap: 10px; background: var(--white); }
.site-footer p { margin: 0; font-size: 14px; }
.utility-page { min-height: 100vh; display: grid; place-content: center; padding: 24px; text-align: center; }
.web-access-page { width: min(720px, calc(100% - 36px)); margin: 0 auto; justify-items: center; }
@media (max-width: 860px) {
  .site-header { align-items: flex-start; flex-direction: column; }
  .language-nav { border-left: 0; padding-left: 0; }
  .hero, .split-section { grid-template-columns: 1fr; }
  .hero { min-height: auto; padding-top: 36px; }
  .feature-grid, .pricing-grid { grid-template-columns: 1fr; }
}
`);

  writePage('script.js', `document.documentElement.classList.add('js-enabled');
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (event) {
    var target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
`);
}

writeCanonicalPages();
writeUtilityPages();
writeRobotsAndSitemap();
writeAssets();
