import { useEffect, useState, type FormEvent } from 'react';
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
} from 'firebase/auth';
import { Mail } from 'lucide-react';
import { useAuth } from './use-auth';
import { ensureUserProfile, getUserOrders, type OrderRequestSummary } from './store';
import { firebaseAuth, firebaseConfigured } from './firebase';
import './login-signup.css';

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
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [isEmailLinkPending, setIsEmailLinkPending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [orders, setOrders] = useState<OrderRequestSummary[]>([]);
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
      setOrdersLoading(false);
      return;
    }

    let cancelled = false;
    setOrdersLoading(true);
    Promise.all([ensureUserProfile(user.uid, user.email), getUserOrders(user.uid)])
      .then(([, recentOrders]) => {
        if (!cancelled) setOrders(recentOrders);
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
        <span className="eyebrow">SOMEDAYS IN MAY · YOUR ACCOUNT</span>
        <h1>{user ? 'Welcome back.' : presentation === 'overlay' ? 'Sign in or create account' : 'A quieter way to sign in.'}</h1>

        {user ? (
          <>
            <p className="account-auth-intro">
              Signed in as <strong>{user.email}</strong>
            </p>
            <p className="auth-success-note">Your studio account is ready.</p>
            <button className="outline-button auth-submit" type="button" onClick={handleSignOut}>
              SIGN OUT
            </button>

            <section className="account-orders" aria-labelledby="account-orders-title">
              <h2 id="account-orders-title">Your order requests</h2>
              {ordersLoading ? (
                <p role="status">Loading your order requests…</p>
              ) : orders.length ? (
                <ul className="account-order-list">
                  {orders.map((order) => (
                    <li key={order.id}>
                      <span>
                        <strong>Request {order.id.slice(0, 8).toUpperCase()}</strong>
                        {formatOrderDate(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                      </span>
                      <span className="account-order-status">Inquiry</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Your order requests will appear here. Payments are not enabled yet.</p>
              )}
            </section>
          </>
        ) : (
          <>
            <p className="account-auth-intro">
              Enter your email and we’ll send you a secure sign-in link. If this is your first visit, your
              account is created when you confirm the link.
            </p>

            <form className="account-auth-form" onSubmit={handleSubmit}>
              <label htmlFor="account-email">{isEmailLinkPending ? 'Confirm your email' : 'Email address'}</label>
              <div className="account-email-field">
                <Mail size={15} aria-hidden="true" />
                <input
                  id="account-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <button
                className="primary-button auth-submit"
                type="submit"
                disabled={loading || isSubmitting || !firebaseConfigured}
              >
                {isSubmitting
                  ? 'PLEASE WAIT…'
                  : isEmailLinkPending
                    ? 'CONFIRM SIGN IN'
                    : 'EMAIL ME A SIGN-IN LINK'}
              </button>
            </form>

            {!firebaseConfigured && (
              <p className="auth-setup-note">
                Firebase is not connected yet. Add <code>VITE_FIREBASE_API_KEY</code>,{' '}
                <code>VITE_FIREBASE_AUTH_DOMAIN</code>, and <code>VITE_FIREBASE_APP_ID</code> to the
                environment, then enable email-link sign-in and publish the Firestore rules.
              </p>
            )}
          </>
        )}

        {notice && (
          <p className={`auth-notice ${notice.kind}`} role="status" aria-live="polite">
            {notice.message}
          </p>
        )}
      </section>
    </Container>
  );
}

export default LoginSignup;
