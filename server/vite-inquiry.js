import { createInquiryHandler } from './inquiry.js';

// Run the same endpoint in Vite so local previews don't silently post to HTML.
// Server-only values are loaded from .env.local and never returned to the client.
export function inquiryDevPlugin(catalog, env) {
  const handle = createInquiryHandler({ catalog });
  return {
    name: 'local-inquiry-endpoint',
    configureServer(server) {
      server.middlewares.use('/api/inquiry', (req, res) => {
        const chunks = [];
        let size = 0;
        req.on('data', (chunk) => {
          size += chunk.length;
          if (size <= 16384) chunks.push(chunk);
        });
        req.on('end', async () => {
          if (size > 16384) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Request is too large.' }));
            return;
          }
          try {
            const headers = new Headers();
            for (const [key, value] of Object.entries(req.headers)) {
              if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
            }
            const request = new Request(`http://${req.headers.host}/api/inquiry`, {
              method: req.method, headers,
              ...(!['GET', 'HEAD'].includes(req.method) ? { body: Buffer.concat(chunks) } : {}),
            });
            const response = await handle(request, env);
            res.writeHead(response.status, Object.fromEntries(response.headers));
            res.end(await response.text());
          } catch {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unable to send your request.' }));
          }
        });
      });
    },
  };
}
