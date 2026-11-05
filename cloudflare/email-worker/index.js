import { EmailMessage } from 'cloudflare:email';
import { createInquiryHandler } from '../../server/inquiry.js';
import { products } from '../../src/data/products.ts';
import { emailMime } from './mime.js';

const handle = createInquiryHandler({
  catalog: products,
  sendEmail: (payload, env) => env.EMAIL.send(new EmailMessage(payload.from, payload.to[0], emailMime(payload))),
});
export default { fetch: (request, env) => handle(request, env) };
