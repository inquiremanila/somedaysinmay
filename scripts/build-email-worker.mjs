import { build } from 'esbuild';
await build({
  entryPoints: ['cloudflare/email-worker/index.js'],
  outfile: 'dist/email-worker/index.js',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  external: ['cloudflare:email'],
});
console.log('Built dist/email-worker/index.js for Cloudflare Workers.');
