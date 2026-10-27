import { Facebook, Instagram } from 'lucide-react';
import { Link } from 'wouter';
import { useLocalization } from '../localization/provider';
import LocaleControls from './locale-controls';
import { socials } from '../data/social-links';

function SiteFooter() {
  const { t } = useLocalization();
  return (
    <footer className="site-footer">
      <div className="site-footer-bottom">
        <span className="footer-copyright">© {new Date().getFullYear()} Somedays in May</span>
        <Link href="/policies" className="footer-policies">{t('Terms and Policies')}</Link>
        <div className="footer-right">
          <LocaleControls />
          <nav className="footer-socials" aria-label={t('Social media')}>
            {socials.slice(0, 3).map((social) => (
              <a href={social.url} key={social.name} aria-label={social.name} target="_blank" rel="noreferrer" data-testid={`link-footer-${social.name.toLowerCase()}`}>
                {social.name === 'Instagram' ? <Instagram aria-hidden="true" />
                  : social.name === 'Facebook' ? <Facebook aria-hidden="true" />
                  : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v11.2a4.1 4.1 0 1 1-3.6-4.1M14 3c.5 3.1 2.2 4.8 5 5" /></svg>}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
