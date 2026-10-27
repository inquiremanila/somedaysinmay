import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

async function loadModule(path) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: 'esm', platform: 'node' });
  return import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
}
const prefs = await loadModule('src/localization/preferences.ts');
const pricing = await loadModule('src/lib/pricing.ts');
const { filipino } = await loadModule('src/localization/translations.ts');
const work = { id: 'painting', price: 300, currency: 'USD' };
const quoted = { id: 'quote', price: null };
const options = { currency: 'PHP', rates: { USD: 1, PHP: 60 }, locale: 'en' };

test('detects supported browser languages and keeps English as the fallback', () => {
  assert.equal(prefs.detectLanguage(['fil-PH']), 'fil');
  assert.equal(prefs.detectLanguage(['tl-PH', 'en-US']), 'fil');
  assert.equal(prefs.detectLanguage(['en-PH'], 'PH'), 'en');
  assert.equal(prefs.detectLanguage(['ja-JP'], 'JP'), 'ja');
  assert.equal(prefs.detectLanguage(['ar-SA']), 'en');
  assert.equal(prefs.browserCurrency('en-US'), 'USD');
  assert.equal(prefs.browserCurrency('en-PH'), 'PHP');
  assert.equal(prefs.browserCurrency('de-DE'), 'EUR');
});
test('validates exchange rates, dropping invalid numbers and unexpected quotes', () => {
  const parsed = prefs.parseRates([
    { base: 'USD', quote: 'PHP', rate: 60, date: '2026-10-22' },
    { base: 'USD', quote: 'EUR', rate: -1, date: '2026-10-22' },
    { base: 'EUR', quote: 'GBP', rate: 1, date: '2026-10-22' },
    { base: 'USD', quote: 'ABC', rate: 1, date: '2026-10-22' },
  ]);
  assert.deepEqual(parsed.rates, { USD: 1, PHP: 60 });
  assert.throws(() => prefs.parseRates({ rates: { USD: 0.02 } }));
});
test('converts the amount and cart quantities, rather than only changing the symbol', () => {
  const price = pricing.formatProductPrice(work, 2, options);
  assert.match(price, /≈ PHP\s36,000\.00/);
  assert.equal(pricing.cartPriceSummary([{ id: 'painting', quantity: 2 }], [work], options), price);
});
test('falls back to the actual source currency when conversion is unavailable', () => {
  const price = pricing.formatProductPrice(work, 1, { currency: 'EUR', rates: {} });
  assert.match(price, /USD\s300\.00/);
  assert.doesNotMatch(price, /EUR|≈/);
});
test('translates quoted prices without treating them as zero in a mixed cart', () => {
  const t = (text) => filipino[text] || text;
  assert.equal(pricing.formatProductPrice(quoted, 1, { t }), 'Magtanong para sa presyo');
  const result = pricing.cartPriceSummary([{ id: 'painting', quantity: 1 }, { id: 'quote', quantity: 1 }], [work, quoted], { ...options, t });
  assert.match(result, /PHP\s18,000\.00/);
  assert.ok(result.includes(filipino['artwork priced on request']));
});
test('preferences remain usable when browser storage is blocked or corrupt', () => {
  globalThis.localStorage = { getItem() { return '{broken'; }, setItem() { throw new Error('blocked'); } };
  assert.equal(prefs.readStorage('test'), null);
  assert.doesNotThrow(() => prefs.saveStorage('test', { currency: 'USD' }));
  globalThis.localStorage = { getItem() { return '{"currency":"EUR"}'; }, setItem() {} };
  assert.deepEqual(prefs.readStorage('test'), { currency: 'EUR' });
  delete globalThis.localStorage;
});

test('renders the minimal Contact footer, language choices, socials, and USD primary prices', async () => {
  const output = await build({
    stdin: {
      contents: `import React from 'react';
        import { renderToStaticMarkup } from 'react-dom/server';
        import { Router } from 'wouter';
        import { LocalizationProvider } from './src/localization/provider';
        import SiteFooter from './src/components/site-footer';
        import { ArtworkPrice } from './src/components/artwork-price';
        export function render(language, path = '/contact') {
          globalThis.navigator = { language: 'en-PH', languages: ['en-PH'] };
          globalThis.localStorage = { getItem: () => JSON.stringify({language,currency:'PHP'}), setItem() {} };
          return renderToStaticMarkup(<Router ssrPath={path}><LocalizationProvider><SiteFooter /><ArtworkPrice product={{price:300,currency:'USD'}} /></LocalizationProvider></Router>);
        }`,
      resolveDir: process.cwd(), loader: 'tsx',
    },
    bundle: true, write: false, platform: 'node', format: 'esm', jsx: 'automatic',
    banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(process.cwd() + '/package.json');" },
  });
  const module = await import('data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64'));
  // Avoid very long data-URL stacks when a rendered component fails.
  const render = (...args) => { try { return module.render(...args); } catch (error) { error.stack = error.message; throw error; } };
  const english = render('en');
  assert.ok(english.includes('Language : <span>EN</span>'));
  assert.ok(english.includes('English') && english.includes('Filipino'));
  assert.doesNotMatch(english, /newsletter|Display currency|locale-bar/);
  assert.match(english, /<details class="footer-language">/);
  assert.ok(english.includes('link-footer-instagram'));
  assert.ok(english.includes('link-footer-facebook'));
  assert.ok(english.includes('link-footer-tiktok'));
  assert.match(english, /class="price-main">USD\s300\.00/);
  assert.doesNotMatch(english, /price-local/);
  assert.ok(!render('en', '/').includes('newsletter'));
  const translated = render('fil');
  assert.ok(translated.includes('Language : <span>FIL</span>'));
  assert.ok(translated.includes('Mga tuntunin at patakaran'));
  for (const language of ['es', 'fr', 'de', 'ja', 'ko', 'zh']) {
    const html = render(language);
    assert.ok(html.includes('Language : <span>' + language.toUpperCase() + '</span>'));
    assert.ok(html.includes('lang="' + language + '" aria-pressed="true"'));
  }
  delete globalThis.localStorage;
  delete globalThis.navigator;
});

test('falls back to the second country service after a rate-limit response', async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(url);
    return calls.length === 1
      ? { ok: false, status: 429 }
      : { ok: true, json: async () => ({ country_code: 'JP', currency: 'JPY' }) };
  };
  try {
    assert.deepEqual(await prefs.detectCountry(), { country: 'JP', currency: 'JPY' });
    assert.equal(calls.length, 2);
  } finally { globalThis.fetch = original; }
});
test('maps the primary country lookup to the matching currency', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ country: 'DE' }) });
  try { assert.deepEqual(await prefs.detectCountry(), { country: 'DE', currency: 'EUR' }); }
  finally { globalThis.fetch = original; }
});

test('every added language has real translations for storefront, contact, sign-in and checkout', async () => {
  const { translate } = await loadModule('src/localization/messages.ts');
  const added = ['es', 'fr', 'de', 'ja', 'ko', 'zh'];
  for (const language of added) {
    assert.ok(prefs.isLanguage(language));
    assert.equal(prefs.detectLanguage([language + '-XX', 'en-US']), language);
    for (const text of ['Price on request', 'Request to purchase', 'Send inquiry', 'EMAIL ME A SIGN-IN LINK', 'SEND PURCHASE REQUEST']) {
      assert.notEqual(translate(text, language), text, `${language} is missing ${text}`);
    }
    assert.equal(translate('Between Seasons', language), 'Between Seasons');
  }
  assert.equal(prefs.isLanguage('constructor'), false);
  assert.equal(prefs.isLanguage('__proto__'), false);
  assert.equal(translate('Price on request', 'en'), 'Price on request');
});
