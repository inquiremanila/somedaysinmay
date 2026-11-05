import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
const output = await build({ entryPoints: ['src/lib/send-inquiry.ts'], bundle: true, write: false, format: 'esm', platform: 'node' });
const { sendInquiry } = await import('data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64'));
const originalFetch = globalThis.fetch;
test('preserves the safe server error and diagnostic code', async () => {
  try {
    globalThis.fetch = async () => Response.json({ error: 'Requests are temporarily unavailable.', code: 'EMAIL_NOT_CONFIGURED' }, { status: 503 });
    await assert.rejects(sendInquiry({}), (error) => error.code === 'EMAIL_NOT_CONFIGURED' && error.message === 'Requests are temporarily unavailable.');
  } finally { globalThis.fetch = originalFetch; }
});
test('detects missing deployment endpoints and connection failures', async () => {
  try {
    globalThis.fetch = async () => new Response('<html>App</html>', { status: 200 });
    await assert.rejects(sendInquiry({}), (error) => error.code === 'ENDPOINT_MISSING');
    globalThis.fetch = async () => { throw new Error('offline'); };
    await assert.rejects(sendInquiry({}), (error) => error.code === 'NETWORK_ERROR');
    globalThis.fetch = async () => Response.json({ sent: true });
    await assert.doesNotReject(sendInquiry({}));
  } finally { globalThis.fetch = originalFetch; }
});
