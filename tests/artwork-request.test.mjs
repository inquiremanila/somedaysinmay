import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
const output = await build({
  stdin: { contents: `import React from 'react'; import { renderToStaticMarkup } from 'react-dom/server'; import ArtworkInquiry from './src/components/artwork-inquiry'; import ProductDetail from './src/pages/product-detail'; import EmptyCart from './src/components/empty-cart'; import { Router } from 'wouter'; import { products } from './src/data/products'; import { LocalizationProvider } from './src/localization/provider'; export function render(sent, mode = 'form') { globalThis.navigator = { language: 'en-US', languages: ['en-US'] }; globalThis.localStorage = { getItem(key) { return key === 'artwork-request-sent-swirls' && sent ? 'sent' : null; } }; return renderToStaticMarkup(<Router ssrPath='/'><LocalizationProvider>{mode === 'product' ? <ProductDetail id={products[0].id} addToCart={() => {}} /> : mode === 'cart-user' || mode === 'cart-guest' || mode === 'cart-loading' ? <EmptyCart email={mode === 'cart-user' ? 'buyer@example.com' : null} signedIn={mode === 'cart-user'} loading={mode === 'cart-loading'} onLogin={() => {}} onContinue={() => {}} /> : <ArtworkInquiry product={{id:'swirls',name:'Swirls'}} />}</LocalizationProvider></Router>); }`, resolveDir: process.cwd(), loader: 'tsx' },
  bundle: true, write: false, platform: 'node', format: 'esm', jsx: 'automatic', define: { 'import.meta.env': '{}' },
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(process.cwd() + '/package.json');" },
});
const { render } = await import('data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64'));
test('request form has contact fields and does not require account sign-in', () => {
  const html = render(false);
  for (const field of ['First Name', 'Last Name', 'Address', 'Email']) assert.ok(html.includes(field));
  assert.doesNotMatch(html, /Sign in to send|textarea/);
  assert.match(html, /type="email"/);
});
test('persisted success replaces the form after a fresh render', () => {
  const html = render(true);
  assert.match(html, /Thank you for your interest/);
  assert.doesNotMatch(html, /<form|<input|<button/);
});

test('artwork request form is visible immediately without a request trigger', () => {
  const html = render(false, 'product');
  assert.match(html, /Availability &amp; Price Request/);
  assert.match(html, /first-/);
  assert.doesNotMatch(html, />Request<|aria-expanded/);
});
test('cart displays login only for guests, and waits while auth loads', () => {
  assert.match(render(false, 'cart-guest'), /button-cart-login/);
  const signedIn = render(false, 'cart-user');
  assert.match(signedIn, /buyer@example.com/);
  assert.doesNotMatch(signedIn, /button-cart-login/);
  assert.doesNotMatch(render(false, 'cart-loading'), /button-cart-login/);
});
