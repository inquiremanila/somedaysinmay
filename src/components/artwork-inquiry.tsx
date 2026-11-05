import { useLocalization } from '../localization/provider';
import { useState, type FormEvent } from 'react';
import { sendInquiry } from '../lib/send-inquiry';
import type { Product } from '../data/products';

export function artworkRequestSent(productId: string) {
  try { return localStorage.getItem(`artwork-request-sent-${productId}`) === 'sent'; }
  catch { return false; }
}

function requestIdFor(productId: string) {
  const key = `artwork-request-pending-${productId}`;
  try {
    const saved = sessionStorage.getItem(key);
    if (saved) return saved;
    const id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
    return id;
  } catch { return crypto.randomUUID(); }
}

export default function ArtworkInquiry({ product }: { product: Product }) {
  const { t } = useLocalization();
  const [details, setDetails] = useState({ firstName: '', lastName: '', address: '', contactEmail: '', website: '' });
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(() => artworkRequestSent(product.id));
  const [error, setError] = useState('');

  function updateDetails(field: keyof typeof details, value: string) {
    setDetails((current) => ({ ...current, [field]: value }));
    try { sessionStorage.removeItem(`artwork-request-pending-${product.id}`); } catch { /* Optional retry storage. */ }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError('');
    try {
      await sendInquiry({ ...details, kind: 'artwork', productId: product.id, requestId: requestIdFor(product.id) });
      try {
        localStorage.setItem(`artwork-request-sent-${product.id}`, 'sent');
        sessionStorage.removeItem(`artwork-request-pending-${product.id}`);
      } catch { /* Keep the confirmation visible if browser storage is unavailable. */ }
      setSent(true);
      setDetails({ firstName: '', lastName: '', address: '', contactEmail: '', website: '' });
    } catch {
      setError('Your request could not be sent. Please try again shortly.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="artwork-request" aria-labelledby={`request-title-${product.id}`}>
      <h2 id={`request-title-${product.id}`}>{t('Availability & Price Request')}</h2>
      {sent ? (
        <p className="artwork-request-thanks" role="status">{t('Thank you for your interest. One of our team members will contact you shortly.')}</p>
      ) : (
        <form onSubmit={submit}>
          <div className="artwork-request-names">
            <label htmlFor={`first-${product.id}`}>{t('First Name')} <span aria-hidden="true">*</span>
              <input id={`first-${product.id}`} autoComplete="given-name" required maxLength={120} value={details.firstName}
                onChange={(event) => updateDetails('firstName', event.target.value)} />
            </label>
            <label htmlFor={`last-${product.id}`}>{t('Last Name')} <span aria-hidden="true">*</span>
              <input id={`last-${product.id}`} autoComplete="family-name" required maxLength={120} value={details.lastName}
                onChange={(event) => updateDetails('lastName', event.target.value)} />
            </label>
          </div>
          <label htmlFor={`address-${product.id}`}>{t('Address')}
            <input id={`address-${product.id}`} autoComplete="street-address" maxLength={500} value={details.address}
              onChange={(event) => updateDetails('address', event.target.value)} />
          </label>
          <label htmlFor={`email-${product.id}`}>{t('Email')} <span aria-hidden="true">*</span>
            <input id={`email-${product.id}`} type="email" autoComplete="email" required maxLength={254} value={details.contactEmail}
              onChange={(event) => updateDetails('contactEmail', event.target.value)} />
          </label>
          <div className="artwork-request-trap" aria-hidden="true">
            <label>Website<input tabIndex={-1} autoComplete="off" value={details.website} onChange={(event) => updateDetails('website', event.target.value)} /></label>
          </div>
          {error && <p role="alert">{t(error)}</p>}
          <button type="submit" disabled={pending}>{t(pending ? 'Sending…' : 'Send')}</button>
        </form>
      )}
    </section>
  );
}
