import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { formatProductPrice as formatPrice, cartPriceSummary as cartSummary } from '../lib/pricing';
import { browserCurrency, currencies, detectLanguage, detectCountry, fetchJson, isCurrency, isLanguage, parseRates, readStorage, saveStorage, type Currency, type Language } from './preferences';
import { translate } from './messages';
import type { Product } from '../data/products';
import type { CartLine } from '../types/store';

const PREFERENCE_KEY = 'somedays-locale-v1';
const RATE_KEY = 'somedays-usd-exchange-rates-v2';
function savedPreferences(): { language?: Language } {
  const saved = readStorage(PREFERENCE_KEY) as Record<string, unknown> | null;
  return { language: isLanguage(saved?.language) ? saved.language : undefined };
}
function usePreferences() {
  const saved = useRef(savedPreferences());
  const [currency, setCurrencyState] = useState<Currency>(browserCurrency(navigator.language));
  const [language, setLanguageState] = useState<Language>(saved.current.language || detectLanguage(navigator.languages));
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [rateDate, setRateDate] = useState('');
  const [rateStatus, setRateStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [retry, setRetry] = useState(0);
  const [country, setCountry] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    detectCountry(controller.signal).then((geo) => {
      if (controller.signal.aborted) return;
      setCountry(geo.country);
      if (isCurrency(geo.currency)) setCurrencyState(geo.currency);
      if (!saved.current.language) setLanguageState(detectLanguage(navigator.languages, geo.country));
    }).catch(() => { /* Browser preferences provide the offline fallback. */ });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const cached = readStorage(RATE_KEY) as { fetchedAt?: number; rows?: unknown } | null;
    if (cached?.fetchedAt && Date.now() - cached.fetchedAt >= 0 && Date.now() - cached.fetchedAt < 86400000) {
      try { const parsed = parseRates(cached.rows); setRates(parsed.rates); setRateDate(parsed.date); setRateStatus('ready'); return; } catch { /* Refresh invalid cache. */ }
    }
    const controller = new AbortController();
    setRateStatus('loading');
    fetchJson(`https://api.frankfurter.dev/v2/rates?base=USD&quotes=${currencies.filter((code) => code !== 'USD').join(',')}`, controller.signal)
      .then((rows) => {
        if (controller.signal.aborted) return;
        const parsed = parseRates(rows);
        setRates(parsed.rates); setRateDate(parsed.date); setRateStatus('ready');
        saveStorage(RATE_KEY, { fetchedAt: Date.now(), rows });
      }).catch(() => { if (!controller.signal.aborted) setRateStatus('unavailable'); });
    return () => controller.abort();
  }, [retry]);

  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const t = (text: string) => translate(text, language);
  const options = { locale: language === 'fil' ? 'fil-PH' : language === 'zh' ? 'zh-CN' : language, currency: 'USD', rates, t };
  const localOptions = { ...options, currency };
  const hasLocalEstimate = currency !== 'USD' && Boolean(rates[currency]);
  return {
    currency, language, country, rateDate, rateStatus, t,
    setLanguage(value: Language) { saved.current.language = value; setLanguageState(value); saveStorage(PREFERENCE_KEY, saved.current); },
    retryRates() { setRetry((value) => value + 1); },
    formatProductPrice: (product: Product, quantity = 1) => formatPrice(product, quantity, options),
    cartPriceSummary: (cart: CartLine[], products: Product[]) => cartSummary(cart, products, options),
    formatLocalPrice: (product: Product, quantity = 1) => product.price !== null && hasLocalEstimate ? formatPrice(product, quantity, localOptions) : null,
    localCartSummary: (cart: CartLine[], products: Product[]) => hasLocalEstimate && cart.some((line) => products.some((product) => product.id === line.id && product.price !== null)) ? cartSummary(cart, products, localOptions) : null,
  };
}
const LocalizationContext = createContext<ReturnType<typeof usePreferences> | null>(null);
export function LocalizationProvider({ children }: { children: ReactNode }) {
  const value = usePreferences();
  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}
export function useLocalization() {
  const value = useContext(LocalizationContext);
  if (!value) throw new Error('LocalizationProvider is missing');
  return value;
}
