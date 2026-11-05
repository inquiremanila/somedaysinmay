import { createInquiryHandler } from '../../server/inquiry.js';
import { products } from '../../src/data/products.ts';
const handle = createInquiryHandler({ catalog: products });
export function onRequest({ request, env }) {
  return handle(request, env);
}
