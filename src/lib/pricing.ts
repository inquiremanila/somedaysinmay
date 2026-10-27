import type { Product } from '../data/products';
import type { CartLine } from '../types/store';

export type PriceOptions = {
  locale?: string;
  currency?: string;
  rates?: Record<string, number>;
  t?: (text: string) => string;
};
function formatAmount(amount: number, source: string, options: PriceOptions): string {
  const requested = options.currency || source;
  const sourceRate = source === 'USD' ? 1 : options.rates?.[source];
  const targetRate = requested === 'USD' ? 1 : options.rates?.[requested];
  const converted = requested !== source && Boolean(sourceRate && targetRate);
  const currency = converted ? requested : source;
  const value = converted ? amount * targetRate! / sourceRate! : amount;
  return `${converted ? '≈ ' : ''}${new Intl.NumberFormat(options.locale || 'en', { style: 'currency', currency, currencyDisplay: 'code' }).format(value)}`;
}
export function formatProductPrice(product: Product, quantity = 1, options: PriceOptions = {}): string {
  if (product.price === null) return options.t?.('Price on request') || 'Price on request';
  return formatAmount(product.price * quantity, product.currency, options);
}
export function cartPriceSummary(cart: CartLine[], products: Product[], options: PriceOptions = {}): string {
  const totals = new Map<string, number>();
  let onRequest = false;
  for (const line of cart) {
    const product = products.find((item) => item.id === line.id);
    if (!product || product.price === null) { onRequest = true; continue; }
    totals.set(product.currency, (totals.get(product.currency) || 0) + product.price * line.quantity);
  }
  const known = [...totals].map(([currency, total]) => formatAmount(total, currency, options)).join(' + ');
  const t = options.t || ((text: string) => text);
  return known ? `${known}${onRequest ? ` + ${t('artwork priced on request')}` : ''}` : t('Price on request');
}
