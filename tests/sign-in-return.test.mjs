import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
const output = await build({ entryPoints: ['src/firebase/sign-in-return.ts'], bundle: true, write: false, platform: 'node', format: 'esm' });
const { safeReturnPath, signInDestination, LAST_PAGE_KEY, RETURN_PATH_KEY } = await import('data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64'));
const origin = 'https://somedaysinmay.com';

test('returns to the artwork, homepage, and checkout including filters', () => {
  for (const path of ['/', '/product/blue', '/artworks?collection=paintings#works', '/checkout']) {
    assert.equal(safeReturnPath(path, origin), path);
  }
});

test('rejects external destinations and authentication callback loops', () => {
  for (const path of ['https://example.com', '//example.com', '/\\example.com', '/account', '/account/', '/%61ccount', '/artworks?oobCode=secret', '/\n/example.com']) {
    assert.equal(safeReturnPath(path, origin), null, path);
  }
});

test('prefers the current page, then explicit checkout destination, then last visited page', () => {
  const saved = new Map([[RETURN_PATH_KEY, '/checkout'], [LAST_PAGE_KEY, '/artworks']]);
  globalThis.window = { localStorage: { getItem: (key) => saved.get(key) ?? null } };
  assert.equal(signInDestination('/product/blue', origin), '/product/blue');
  assert.equal(signInDestination('/account', origin), '/checkout');
  saved.delete(RETURN_PATH_KEY);
  assert.equal(signInDestination('/account', origin), '/artworks');
  window.localStorage.getItem = () => { throw new Error('blocked'); };
  assert.equal(signInDestination('/account', origin), '/');
  delete globalThis.window;
});
