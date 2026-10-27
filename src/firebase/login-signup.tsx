import { useLocalization } from '../localization/provider';
import { useEffect, useState, type FormEvent } from 'react';
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
} from 'firebase/auth';
import { Mail } from 'lucide-react';
import { useAuth } from './use-auth';
import { ensureUserProfile, getUserOrders, getUserInquiries, type OrderRequestSummary } from './store';
import { firebaseAuth, firebaseConfigured } from './firebase';
import './login-signup.css';
import { products } from '../data/products';

const EMAIL_STORAGE_KEY = 'somedays-firebase-email';
const RETURN_PATH_KEY = 'somedays-firebase-return-path';

type Notice = { kind: 'success' | 'error' | 'info'; message: string };
type LoginSignupProps = { presentation?: 'page' | 'overlay' };

function formatOrderDate(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(date)
    : 'Date pending';
}

function LoginSignup({ presentation = 'page' }: LoginSignupProps) {
  const { t } = useLocalization();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [isEmailLinkPending, setIsEmailLinkPending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [orders, setOrders] = useState<OrderRequestSummary[]>([]);
  const [inquiries, setInquiries] = useState<Awaited<ReturnType<typeof getUserInquiries>>>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  async function completeEmailSignIn(address: string) {
    if (!firebaseAuth) return;

    setIsSubmitting(true);
    try {
      await signInWithEmailLink(firebaseAuth, address, window.location.href);
      window.localStorage.removeItem(EMAIL_STORAGE_KEY);
      const returnPath = window.localStorage.getItem(RETURN_PATH_KEY);

      if (returnPath?.startsWith('/') && !returnPath.startsWith('//')) {
        window.localStorage.removeItem(RETURN_PATH_KEY);
        window.location.assign(returnPath);
        return;
      }

      window.history.replaceState({}, document.title, '/account');
      setIsEmailLinkPending(false);
      setNotice({ kind: 'success', message: 'You are signed in. Welcome to the studio.' });
    } catch {
      setNotice({
        kind: 'error',
        message: 'That sign-in link could not be verified. Request a new link and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!firebaseAuth || !isSignInWithEmailLink(firebaseAuth, window.location.href)) return;

    setIsEmailLinkPending(true);
    const savedEmail = window.localStorage.getItem(EMAIL_STORAGE_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      void completeEmailSignIn(savedEmail);
      return;
    }

    setNotice({
      kind: 'info',
      message: 'Enter the same email address you used to request this link to finish signing in.',
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setInquiries([]);
      setOrdersLoading(false);
      return;
    }

    let cancelled = false;
    setOrdersLoading(true);
    Promise.all([ensureUserProfile(user.uid, user.email), getUserOrders(user.uid), getUserInquiries(user.uid)])
      .then(([, recentOrders, recentInquiries]) => {
        if (!cancelled) { setOrders(recentOrders); setInquiries(recentInquiries); }
      })
      .catch(() => {
        if (!cancelled) {
          setNotice({
            kind: 'error',
            message: 'You are signed in, but your account data could not be loaded. Check the Firestore rules.',
          });
        }
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid, user?.email]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firebaseAuth) return;

    const address = email.trim();
    if (!address) return;

    if (isEmailLinkPending) {
      await completeEmailSignIn(address);
      return;
    }

    setIsSubmitting(true);
    setNotice(null);
    try {
      await sendSignInLinkToEmail(firebaseAuth, address, {
        url: `${window.location.origin}/account`,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(EMAIL_STORAGE_KEY, address);
      setNotice({
        kind: 'success',
        message: `A secure sign-in link is on its way to ${address}. New accounts are created automatically.`,
      });
    } catch {
      setNotice({
        kind: 'error',
        message: 'We could not send a sign-in link. Check that email-link sign-in is enabled in Firebase and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth);
    window.localStorage.removeItem(RETURN_PATH_KEY);
    setNotice({ kind: 'info', message: 'You have been signed out.' });
  }

  const Container = presentation === 'overlay' ? 'section' : 'main';

  return (
    <Container className={`account-auth page-enter${presentation === 'overlay' ? ' account-auth-overlay' : ''}`}>
      <section className="account-auth-card">
        <span className="eyebrow">{t("SOMEDAYS IN MAY · YOUR ACCOUNT")}</span>
        <h1>{user ? t("Welcome back.") : presentation === 'overlay' ? t("Sign in or create account") : t("A quieter way to sign in.")}</h1>

        {user ? (
          <>
            <p className="account-auth-intro"> {t("Signed in as")} <strong>{user.email}</strong>
            </p>
            <p className="auth-success-note">{t("Your studio account is ready.")}</p>
            <button className="outline-button auth-submit" type="button" onClick={handleSignOut}> {t("SIGN OUT")} </button>

            <section className="account-orders" aria-labelledby="account-orders-title">
              <h2 id="account-orders-title">{t("Your purchase requests")}</h2>
              {ordersLoading ? (
                <p role="status">{t("Loading your order requests…")}</p>
              ) : orders.length ? (
                <ul className="account-order-list">
                  {orders.map((order) => (
                    <li key={order.id}>
                      <span>
                        <strong>{t("Request")} {order.id.slice(0, 8).toUpperCase()}</strong>
                        {formatOrderDate(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? t("item") : t("items")}
                      </span>
                      <span className="account-order-status">{order.intent === 'purchase' ? t("Purchase request") : t("Inquiry")}</span>
                      {order.message && <p>{order.message}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{t("Your purchase requests will appear here. Payment details are confirmed by the studio.")}</p>
              )}
            </section>
            <section className="account-orders" aria-labelledby="account-inquiries-title">
              <h2 id="account-inquiries-title">{t("Your artwork inquiries")}</h2>
              {ordersLoading ? <p role="status">{t("Loading inquiries…")}</p> : inquiries.length ? (
                <ul className="account-inquiry-list">{inquiries.map((inquiry) => (
                  <li key={inquiry.id}>
                    <strong>{products.find((product) => product.id === inquiry.productId)?.name || inquiry.productId}</strong>
                    <p className="request-message">{inquiry.message}</p>
                  </li>
                ))}</ul>
              ) : <p>{t("Your artwork inquiries will appear here.")}</p>}
            </section>
          </>
        ) : (
          <>
            <p className="account-auth-intro"> {t("Enter your email and we’ll send you a secure sign-in link. If this is your first visit, your account is created when you confirm the link.")} </p>

            <form className="account-auth-form" onSubmit={handleSubmit}>
              <label htmlFor="account-email">{isEmailLinkPending ? t("Confirm your email") : t("Email address")}</label>
              <div className="account-email-field">
                <Mail size={15} aria-hidden="true" />
                <input
                  id="account-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t("you@example.com")}
                />
              </div>
              <button
                className="primary-button auth-submit"
                type="submit"
                disabled={loading || isSubmitting || !firebaseConfigured}
              >
                {isSubmitting
                  ? t("PLEASE WAIT…")
                  : isEmailLinkPending
                    ? t("CONFIRM SIGN IN")
                    : t("EMAIL ME A SIGN-IN LINK")}
              </button>
            </form>

            {!firebaseConfigured && (
              <p className="auth-setup-note"> {t("Firebase is not connected yet. Add")} <code>{t("VITE_FIREBASE_API_KEY")}</code>,{' '}
                <code>{t("VITE_FIREBASE_AUTH_DOMAIN")}</code>{t(", and")} <code>{t("VITE_FIREBASE_APP_ID")}</code> {t("to the environment, then enable email-link sign-in and publish the Firestore rules.")} </p>
            )}
          </>
        )}

        {notice && (
          <p className={`auth-notice ${notice.kind}`} role="status" aria-live="polite">
            {t(notice.message)}
          </p>
        )}
      </section>
    </Container>
  );
}

export default LoginSignup;
