import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const result = await build({ entryPoints: ['src/lib/catalog.ts'], bundle: true, write: false, format: 'esm', platform: 'node' });
const { selectProducts } = await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
const collection = [
  { id: 'quote', name: 'A', price: null, availability: 'Available' },
  { id: 'high', name: 'C', price: 350, availability: 'Available' },
  { id: 'sold', name: 'B', price: 200, availability: 'Sold' },
];
const defaults = { availability: 'All', price: 'all', min: '', max: '', sort: 'featured' };

test('availability and USD price filters work together', () => {
  assert.deepEqual(selectProducts(collection, { ...defaults, availability: 'Sold' }).map((p) => p.id), ['sold']);
  assert.deepEqual(selectProducts(collection, { ...defaults, price: 'request' }).map((p) => p.id), ['quote']);
  assert.deepEqual(selectProducts(collection, { ...defaults, min: '100', max: '300' }).map((p) => p.id), ['sold']);
  assert.deepEqual(selectProducts(collection, { ...defaults, availability: 'Available', max: '300' }), []);
});
test('sorting keeps quoted prices last and preserves the catalog source order', () => {
  assert.deepEqual(selectProducts(collection, { ...defaults, sort: 'low' }).map((p) => p.id), ['sold', 'high', 'quote']);
  assert.deepEqual(selectProducts(collection, { ...defaults, sort: 'high' }).map((p) => p.id), ['high', 'sold', 'quote']);
  assert.deepEqual(collection.map((p) => p.id), ['quote', 'high', 'sold']);
});
test('gallery and detail render without promotional sections or category sidebars', async () => {
  const output = await build({
    stdin: {
      contents: `import React from 'react';
        import { renderToStaticMarkup } from 'react-dom/server';
        import { Router } from 'wouter';
        import { LocalizationProvider } from './src/localization/provider';
        import ProductListing from './src/components/product-listing';
        import ProductDetail from './src/pages/product-detail';
        export function render(detail) {
          globalThis.navigator = {language:'en-US',languages:['en-US']};
          globalThis.localStorage = {getItem:()=>null,setItem(){}};
          globalThis.sessionStorage = {getItem:()=>null};
          return renderToStaticMarkup(<Router ssrPath="/"><LocalizationProvider>{detail ? <ProductDetail id="swirls" addToCart={()=>{}} /> : <ProductListing kind="Artwork" addToCart={()=>{}} favourites={[]} onFavourite={()=>{}} />}</LocalizationProvider></Router>);
        }`,
      loader: 'tsx', resolveDir: process.cwd(),
    },
    bundle: true, write: false, platform: 'node', format: 'esm', jsx: 'automatic',
    define: { 'import.meta.env': '{}' },
    banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(process.cwd() + '/package.json');" },
  });
  const module = await import('data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64'));
  const render = (...args) => { try {return module.render(...args);} catch(error) {error.stack=error.message;throw error;} };
  const gallery = render(false);
  assert.ok(gallery.includes('gallery-toolbar'));
  assert.ok(gallery.includes('gallery-grid'));
  assert.equal((gallery.match(/class="sold-label"/g) || []).length, 4);
  assert.equal((gallery.match(/class="gallery-card"/g) || []).length, 7);
  assert.doesNotMatch(gallery, /filter-sidebar|catalog-intro|class="featured"|quick-add|heart-button/);
  const detail = render(true);
  assert.equal((detail.match(/<img /g) || []).length, 1);
  assert.ok(detail.includes('Price on request'));
  assert.doesNotMatch(detail, /Request to purchase/);
  assert.ok(detail.includes('100 × 145 cm'));
  assert.ok(detail.includes('Mixed Media Acrylic on Canvas'));
  assert.ok(detail.includes('Description'));
  assert.doesNotMatch(detail, /breadcrumbs|detail-thumbs|Authenticity|View in a space/);
  delete globalThis.navigator;
  delete globalThis.localStorage;
  delete globalThis.sessionStorage;
});

test('new paintings use their supplied images and filter into the requested collections', async () => {
  const fs = await import('node:fs');
  const output = await build({ entryPoints: ['src/data/products.ts'], bundle: true, write: false, format: 'esm', platform: 'node' });
  const { products } = await import('data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64'));
  const undertow = selectProducts(products, { ...defaults, collection: 'Undertow' });
  assert.deepEqual(undertow.map((p) => p.name), ['Undertow 1', 'Undertow 2', 'Undertow 3', 'Undertow 4']);
  assert.deepEqual(undertow.map((p) => p.image), ['/images/undertow-blue.png', '/images/undertow-olive.png', '/images/undertow-pink.jpg', '/images/undertow.png']);
  const lines = selectProducts(products, { ...defaults, collection: 'Lines' });
  assert.deepEqual(lines.map((p) => p.name), ['Space in Between', 'Tiled']);
  const swirls = selectProducts(products, { ...defaults, collection: 'Swirls & Sand' });
  assert.deepEqual(swirls.map((p) => p.name), ['Swirls']);
  for (const painting of [...undertow, ...lines, ...swirls]) {
    assert.ok(fs.existsSync('public' + painting.image));
    assert.ok(selectProducts(products, { ...defaults, collection: 'All' }).some((p) => p.id === painting.id));
  }
  assert.equal(new Set(products.map((p) => p.id)).size, products.length);
  assert.equal(selectProducts(products, { ...defaults, collection: 'Undertow', price: 'fixed' }).length, 0);
});

test('only the seven new paintings remain, with confirmed sizes, medium, quote-only prices and the requested inventory states', async () => {
  const output = await build({ entryPoints: ['src/data/products.ts'], bundle: true, write: false, format: 'esm', platform: 'node' });
  const { products } = await import('data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64'));
  assert.equal(products.length, 7);
  assert.ok(products.every((p) => p.price === null));
  assert.deepEqual(products.map((p) => p.size), ['100 × 75 cm', '100 × 75 cm', '100 × 75 cm', '100 × 75 cm', '40 × 40 cm', '50 × 70 cm', '100 × 145 cm']);
  assert.ok(products.every((p) => p.material === 'Mixed Media Acrylic on Canvas'));
  assert.deepEqual(selectProducts(products, { ...defaults, availability: 'Available' }).map((p) => p.id), ['undertow-3', 'space-in-between', 'swirls']);
  assert.deepEqual(selectProducts(products, { ...defaults, availability: 'Sold' }).map((p) => p.id), ['undertow-1', 'undertow-2', 'undertow-4', 'tiled']);
});
