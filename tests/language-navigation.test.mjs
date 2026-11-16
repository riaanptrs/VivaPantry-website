import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/language-navigation.js', import.meta.url), 'utf8');
function visit({ path = '/', languages = ['en-US'], stored = null, blockedStorage = false, search = '', hash = '' } = {}) {
  const storage = new Map(stored ? [['vivapantry.locale', stored]] : []);
  const redirects = [];
  const links = ['en', 'es', 'pt-BR'].map((locale) => ({
    locale, handler: null,
    getAttribute: () => locale,
    addEventListener(event, handler) { this.handler = handler; },
  }));
  runInNewContext(source, {
    document: {
      documentElement: { classList: { add() {} } },
      querySelectorAll: (selector) => selector.includes('language-nav') ? links : [],
    },
    window: { location: { pathname: path, search, hash, replace: (target) => redirects.push(target) } },
    navigator: { languages, language: languages[0] },
    localStorage: {
      getItem(key) { if (blockedStorage) throw Error('Storage blocked'); return storage.get(key); },
      setItem(key, value) { if (blockedStorage) throw Error('Storage blocked'); storage.set(key, value); },
    },
  });
  return { storage, redirects, links };
}

test('regional Spanish browsers reach the Spanish homepage', () => {
  for (const language of ['es-MX', 'es-AR', 'es-CO', 'es-CL', 'es-419']) {
    assert.deepEqual(visit({ languages: [language] }).redirects, ['/es/']);
  }
});

test('saved language overrides browser language and keeps the current page, query and fragment', () => {
  assert.deepEqual(visit({ path: '/privacy/', stored: 'es', search: '?source=footer', hash: '#contact', languages: ['pt-BR'] }).redirects, ['/es/privacy/?source=footer#contact']);
  assert.deepEqual(visit({ stored: 'en', languages: ['es-MX'] }).redirects, []);
  assert.deepEqual(visit({ stored: 'pt-BR', languages: ['en-US'] }).redirects, ['/pt-BR/']);
});

test('explicit localized pages stay selected and manual switches are saved', () => {
  const result = visit({ path: '/es/support/', stored: 'pt-BR' });
  assert.deepEqual(result.redirects, []);
  assert.equal(result.storage.get('vivapantry.locale'), 'es');
  result.links[0].handler();
  assert.equal(result.storage.get('vivapantry.locale'), 'en');
});

test('unsupported languages fall back and unavailable storage does not break navigation', () => {
  assert.deepEqual(visit({ languages: ['fr-FR'] }).redirects, []);
  assert.deepEqual(visit({ languages: ['fr-FR', 'es-CO'] }).redirects, ['/es/']);
  const result = visit({ languages: ['es-MX'], blockedStorage: true });
  assert.deepEqual(result.redirects, ['/es/']);
  assert.doesNotThrow(() => result.links[0].handler());
});

test('auth callbacks, password resets, unknown routes and the app are never redirected', () => {
  for (const path of ['/callback/', '/app/', '/app/sign-in/', '/reset-password/', '/update-password/', '/not-found/']) {
    assert.deepEqual(visit({ path, languages: ['es-MX'] }).redirects, [], path);
  }
});

test('generated Spanish marketing and policy pages have Spanish metadata, skip links and locale navigation', () => {
  for (const route of ['', 'pricing/', 'privacy/', 'terms/', 'support/', 'delete-account/']) {
    const html = readFileSync(new URL(`../es/${route}index.html`, import.meta.url), 'utf8');
    assert.match(html, /<html lang="es">/);
    assert.match(html, /Saltar al contenido/);
    assert.doesNotMatch(html, /Skip to content|English version|This page is also available|builds móviles/);
    for (const locale of ['en', 'es', 'pt-BR', 'x-default']) assert.ok(html.includes(`hreflang="${locale}"`));
    assert.match(html, /<script src="\/script.js" defer><\/script>/);
  }
  assert.equal(readFileSync(new URL('../script.js', import.meta.url), 'utf8'), source);
});
