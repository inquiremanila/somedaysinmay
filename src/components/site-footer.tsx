import { useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { Link } from 'wouter';
import { socials } from '../data/social-links';

function SiteFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubscribed(true);
  }

  return (
    <footer className="site-footer">
      <section className="newsletter" aria-labelledby="newsletter-title">
        <div className="footer-copy">
          <h2 id="newsletter-title">Be <em>the first</em> to know whenever<br className="desktop-break" /> a new painting is introduced.</h2>
          {subscribed ? (
            <p className="newsletter-feedback" role="status"><Check size={14} /> Thank you. This demo form does not send emails.</p>
          ) : (
            <form onSubmit={handleSubscribe}>
              <label className="sr-only" htmlFor="footer-newsletter-email">Enter your email address</label>
              <input
                id="footer-newsletter-email"
                type="email"
                required
                placeholder="Enter your e-mail here *"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                data-testid="input-footer-newsletter"
              />
              <button type="submit" data-testid="button-footer-signup">Sign up</button>
            </form>
          )}
        </div>
        <div className="socials" aria-label="Social media">
          {socials.slice(0, 3).map((social) => (
            <a href={social.url} key={social.name} aria-label={social.name} target="_blank" rel="noreferrer" data-testid={`link-footer-${social.name.toLowerCase()}`}>
              {social.name === 'Instagram' ? (
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle className="fill" cx="17.5" cy="6.8" r="1" /></svg>
              ) : social.name === 'TikTok' ? (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v11.2a4.1 4.1 0 1 1-3.6-4.1M14 3c.5 3.1 2.2 4.8 5 5" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path className="dark-stroke" d="M13.4 20v-7.1h2.4l.4-2.8h-2.8V8.3c0-.8.2-1.4 1.4-1.4h1.5V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v1.9H8v2.8h2.2V20" /></svg>
              )}
            </a>
          ))}
        </div>
      </section>
      <div className="site-footer-bottom">
        <Link href="/" className="footer-wordmark" aria-label="Somedays in May home">
          <span>Somedays in May</span>
          <small>Original textured art</small>
        </Link>
      </div>
    </footer>
  );
}

export default SiteFooter;
