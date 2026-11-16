(function () {
  document.documentElement.classList.add('js-enabled');
  var storageKey = 'vivapantry.locale';
  function normalizeLocale(value) {
    var base = String(value || '').toLowerCase().split('-')[0];
    return base === 'es' ? 'es' : base === 'pt' ? 'pt-BR' : base === 'en' ? 'en' : null;
  }
  function remember(locale) {
    try { localStorage.setItem(storageKey, locale); } catch (_) { /* Browsing still works without storage. */ }
  }
  document.querySelectorAll('.language-nav a, .utility-language-nav a').forEach(function (link) {
    link.addEventListener('click', function () {
      var locale = normalizeLocale(link.getAttribute('hreflang'));
      if (locale) remember(locale);
    });
  });
  var explicit = /^\/(en|es|pt-BR)(?:\/|$)/i.exec(window.location.pathname);
  if (explicit) {
    remember(normalizeLocale(explicit[1]));
  } else {
    // Only public marketing routes use language detection. Never redirect auth callbacks or the app.
    var page = /^\/(privacy|terms|support|delete-account|pricing)\/?$/.exec(window.location.pathname);
    if (window.location.pathname === '/' || page) {
      var preferred;
      try { preferred = normalizeLocale(localStorage.getItem(storageKey)); } catch (_) {}
      var languages = navigator.languages || [navigator.language];
      for (var index = 0; !preferred && index < languages.length; index++) {
        preferred = normalizeLocale(languages[index]);
      }
      preferred = preferred || 'en';
      if (preferred !== 'en') {
        var target = '/' + preferred + '/' + (page ? page[1] + '/' : '');
        window.location.replace(target + window.location.search + window.location.hash);
      }
    }
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var selector = link.getAttribute('href');
      if (selector === '#') return;
      var target = document.querySelector(selector);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    });
  });
})();
