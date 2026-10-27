import type { Language } from './preferences';
import { filipino } from './translations';
import { international } from './international';
const columns = { es: 0, fr: 1, de: 2, ja: 3, ko: 4, zh: 5 } as const;
export function translate(text: string, language: Language): string {
  if (language === 'en') return text;
  if (language === 'fil') return typeof filipino[text] === 'string' ? filipino[text] : text;
  return international[text]?.[columns[language]] || text;
}
