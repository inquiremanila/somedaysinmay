import { useRef } from 'react';
import { useLocalization } from '../localization/provider';
import { languages, type Language } from '../localization/preferences';

export default function LocaleControls() {
  const { language, setLanguage, t } = useLocalization();
  const menu = useRef<HTMLDetailsElement>(null);
  function selectLanguage(code: Language) {
    setLanguage(code);
    if (menu.current) {
      menu.current.open = false;
      menu.current.querySelector('summary')?.focus();
    }
  }
  return (
    <details className="footer-language" ref={menu} onKeyDown={(event) => {
      if (event.key === 'Escape' && menu.current) { menu.current.open = false; menu.current.querySelector('summary')?.focus(); }
    }}>
      <summary aria-label={t('Display language')}>Language : <span>{language.toUpperCase()}</span></summary>
      <div className="footer-language-options" role="group" aria-label={t('Display language')}>
        {Object.entries(languages).map(([code, name]) => (
          <button key={code} type="button" lang={code} aria-pressed={language === code}
            onClick={() => selectLanguage(code as Language)}>{name}</button>
        ))}
      </div>
    </details>
  );
}
