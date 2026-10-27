import { useLocalization } from '../localization/provider';
import { useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import type { Product } from '../data/products';
import { useAuth } from '../firebase/use-auth';
import { firebaseConfigured } from '../firebase/firebase';
import { createArtworkInquiry } from '../firebase/store';

export default function ArtworkInquiry({ product }: { product: Product }) {
  const { t } = useLocalization();
  const { user, loading } = useAuth();
  const draftKey = `artwork-inquiry-${product.id}`;
  const [message, setMessage] = useState(() => sessionStorage.getItem(draftKey) || '');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user?.email || !message.trim()) return;
    setPending(true);
    setError('');
    try {
      await createArtworkInquiry(user.uid, user.email, product.id, message);
      sessionStorage.removeItem(draftKey);
      setSent(true);
    } catch {
      setError('Your inquiry could not be saved. Please try again.');
    } finally {
      setPending(false);
    }
  }

  if (sent) return <p role="status">{t("Your inquiry about")} {product.name} {t("has been saved.")} <Link href="/account">{t("View your inquiries")}</Link>.</p>;

  return (
    <form className="contact-form artwork-inquiry" onSubmit={submit}>
      <h2>{t("Inquire about")} {product.name}</h2>
      <label htmlFor={`inquiry-${product.id}`}>{t("Your message")}</label>
      <textarea id={`inquiry-${product.id}`} required maxLength={4000} rows={4}
        placeholder={t("Ask about price, availability, shipping, or the artwork itself.")}
        value={message} onChange={(event) => {
          setMessage(event.target.value);
          sessionStorage.setItem(draftKey, event.target.value);
        }} />
      {!user ? <p><Link href="/account" onClick={() => localStorage.setItem('somedays-firebase-return-path', `/product/${product.id}`)}>{t("Sign in to send your inquiry")}</Link>{t(". Your message will be kept on this browser tab.")}</p>
        : <p>{t("Reply email:")} {user.email}</p>}
      {error && <p role="alert">{t(error)}</p>}
      <button className="solid-button" disabled={loading || pending || !user || !firebaseConfigured || !message.trim()}>
        {pending ? t("Sending…") : t("Send inquiry")}
      </button>
    </form>
  );
}
