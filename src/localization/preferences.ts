export const currencies = ['PHP', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'JPY', 'KRW', 'CNY', 'HKD', 'INR', 'AED', 'NZD', 'CHF', 'THB', 'MYR', 'IDR', 'VND', 'TWD'] as const;
export type Currency = typeof currencies[number];
export const languages = {
  en: 'English', fil: 'Filipino', es: 'Español', fr: 'Français',
  de: 'Deutsch', ja: '日本語', ko: '한국어', zh: '简体中文',
};
export type Language = keyof typeof languages;
export const isCurrency = (value: unknown): value is Currency => typeof value === 'string' && (currencies as readonly string[]).includes(value);
export const isLanguage = (value: unknown): value is Language => typeof value === 'string' && Object.prototype.hasOwnProperty.call(languages, value);
export function detectLanguage(locales: readonly string[], country?: string): Language {
  for (const locale of locales) {
    const base = locale.toLowerCase().split('-')[0];
    if (base === 'fil' || base === 'tl') return 'fil';
    if (isLanguage(base)) return base;
  }
  return 'en';
}
export function browserCurrency(locale: string): Currency {
  const country = locale.split('-').slice(1).find((part) => /^[a-z]{2}$/i.test(part))?.toUpperCase();
  const byCountry: Record<string, Currency> = { PH: 'PHP', US: 'USD', GB: 'GBP', AU: 'AUD', CA: 'CAD', SG: 'SGD', JP: 'JPY', KR: 'KRW', CN: 'CNY', HK: 'HKD', IN: 'INR', AE: 'AED', NZ: 'NZD', CH: 'CHF', TH: 'THB', MY: 'MYR', ID: 'IDR', VN: 'VND', TW: 'TWD', FR: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', IE: 'EUR', PT: 'EUR', AT: 'EUR', BE: 'EUR', FI: 'EUR', GR: 'EUR' };
  return byCountry[country || ''] || 'USD';
}
export function readStorage(key: string): unknown {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : null; } catch { return null; }
}
export function saveStorage(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Preferences remain usable without browser storage. */ }
}
export async function fetchJson(url: string, signal?: AbortSignal) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort);
  try {
    const response = await fetch(url, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
    if (!response.ok) throw new Error('Service unavailable');
    return await response.json();
  } finally { clearTimeout(timeout); signal?.removeEventListener('abort', abort); }
}
export function parseRates(data: unknown): { rates: Record<string, number>; date: string } {
  if (!Array.isArray(data) || !data.length) throw new Error('Invalid exchange rates');
  const rates: Record<string, number> = { USD: 1 };
  let date = '';
  for (const row of data) {
    if (row?.base === 'USD' && isCurrency(row.quote) && typeof row.rate === 'number' && Number.isFinite(row.rate) && row.rate > 0 && /^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
      rates[row.quote] = row.rate;
      if (!date || row.date < date) date = row.date;
    }
  }
  if (Object.keys(rates).length < 2) throw new Error('Invalid exchange rates');
  return { rates, date };
}

export async function detectCountry(signal?: AbortSignal) {
  try {
    const geo = await fetchJson('https://api.country.is/', signal);
    if (typeof geo.country === 'string' && /^[A-Z]{2}$/.test(geo.country)) {
      return { country: geo.country, currency: browserCurrency(`und-${geo.country}`) };
    }
  } catch { if (signal?.aborted) throw new Error('Cancelled'); }
  const geo = await fetchJson('https://ipapi.co/json/', signal);
  if (geo.error || !/^[A-Z]{2}$/.test(geo.country_code)) throw new Error('Country unavailable');
  return { country: geo.country_code, currency: isCurrency(geo.currency) ? geo.currency : browserCurrency(`und-${geo.country_code}`) };
}
