import { useState, type FormEvent } from 'react';
import type { User } from 'firebase/auth';
import { sendInquiry } from '../lib/send-inquiry';
import { useLocalization } from '../localization/provider';

export default function CommissionRequest({ user }: { user: User }) {
  const { t } = useLocalization();
  const [values, setValues] = useState({ name: '', location: '', size: '', budget: '', message: '' });
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(() => {
    try { return localStorage.getItem(`commission-request-sent-${user.uid}`) === 'sent'; } catch { return false; }
  });
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !user.email) return;
    setPending(true);
    setError('');
    try {
      await sendInquiry({ ...values, kind: 'commission', contactEmail: user.email, requestId: crypto.randomUUID() });
      try { localStorage.setItem(`commission-request-sent-${user.uid}`, 'sent'); } catch { /* Confirmation remains visible. */ }
      setSent(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Your commission request could not be sent. Please try again.');
    } finally { setPending(false); }
  }
  if (sent) return <p role="status">{t('Thank you for your interest. One of our team members will contact you shortly.')}</p>;
  return (
    <form className="commission-request-form" onSubmit={submit}>
      <p>{t('Tell us about the piece you have in mind. We’ll reply by email.')}</p>
      <label>{t('Name')}<input autoComplete="name" required maxLength={120} value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} /></label>
      <label>{t('Email')}<input type="email" readOnly value={user.email || ''} /></label>
      <label>{t('Country / City')}<input maxLength={150} value={values.location} onChange={(e) => setValues({ ...values, location: e.target.value })} /></label>
      <label>{t('Preferred size')}<input maxLength={150} value={values.size} onChange={(e) => setValues({ ...values, size: e.target.value })} /></label>
      <label>{t('Budget (optional)')}<input maxLength={150} value={values.budget} onChange={(e) => setValues({ ...values, budget: e.target.value })} /></label>
      <label>{t('Message')}<textarea required rows={4} maxLength={4000} value={values.message} onChange={(e) => setValues({ ...values, message: e.target.value })} /></label>
      {error && <p role="alert">{t(error)}</p>}
      <button className="solid-button" disabled={pending || !user.email}>{t(pending ? 'Sending…' : 'Send')}</button>
    </form>
  );
}
