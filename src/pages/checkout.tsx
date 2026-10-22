import { useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import type { CartLine } from '../types/store';
import type { ShippingDetails } from '../firebase/store';
import { firebaseConfigured } from '../firebase/firebase';
import { useAuth } from '../firebase/use-auth';
import ThankYou from './thank-you';

const RETURN_PATH_KEY = 'somedays-firebase-return-path';

type CheckoutProps = {
  cart: CartLine[];
  clearCart: () => void;
};

function Checkout({ cart, clearCart }: CheckoutProps) {
  const { user, loading } = useAuth();
  const [demoConfirmed, setDemoConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [shipping, setShipping] = useState<ShippingDetails>({
    name: '',
    address: '',
    city: '',
    postcode: '',
    email: '',
    phone: '',
  });

  async function placeDemoOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !firebaseConfigured) return;

    setIsSubmitting(true);
    setError('');
    try {
      const { createOrderInquiry } = await import('../firebase/store');
      await createOrderInquiry(user.uid, shipping, cart);
      clearCart();
      setSubmitted(true);
    } catch {
      setError('Your order request could not be saved. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) return <ThankYou checkout />;

  return (
    <main className="checkout-page page-enter">
      <span className="eyebrow">A little something, on its way</span>
      <h1>Checkout</h1>
      <p className="checkout-alert">
        Order requests are saved to your Firebase account. Payments and fulfilment are not connected, so this does not confirm a purchase.
      </p>
      {!user && (
        <p className="checkout-alert">
          Sign in to save your order request.{' '}
          <Link
            href="/account"
            onClick={() => window.localStorage.setItem(RETURN_PATH_KEY, '/checkout')}
          >
            Sign in or create an account
          </Link>
          .
        </p>
      )}
      {error && <p className="checkout-alert" role="alert">{error}</p>}
      <div className="checkout-layout">
        <form onSubmit={placeDemoOrder}>
          <section>
            <h2>1. Shipping</h2>
            <label>
              Full name
              <input
                autoComplete="name"
                required
                value={shipping.name}
                onChange={(event) => setShipping({ ...shipping, name: event.target.value })}
              />
            </label>
            <label>
              Address
              <input
                autoComplete="street-address"
                required
                value={shipping.address}
                onChange={(event) => setShipping({ ...shipping, address: event.target.value })}
              />
            </label>
            <div className="form-pair">
              <label>
                City
                <input
                  autoComplete="address-level2"
                  required
                  value={shipping.city}
                  onChange={(event) => setShipping({ ...shipping, city: event.target.value })}
                />
              </label>
              <label>
                Postcode
                <input
                  autoComplete="postal-code"
                  required
                  value={shipping.postcode}
                  onChange={(event) => setShipping({ ...shipping, postcode: event.target.value })}
                />
              </label>
            </div>
            <label>
              Email
              <input
                type="email"
                autoComplete="email"
                required
                value={shipping.email}
                onChange={(event) => setShipping({ ...shipping, email: event.target.value })}
              />
            </label>
            <label>
              Phone number
              <input
                type="tel"
                autoComplete="tel"
                value={shipping.phone}
                onChange={(event) => setShipping({ ...shipping, phone: event.target.value })}
              />
            </label>
          </section>
          <section>
            <h2>2. Payment</h2>
            <p>Payment is not enabled on this preview.</p>
            <label className="demo-checkbox">
              <input
                type="checkbox"
                checked={demoConfirmed}
                onChange={(event) => setDemoConfirmed(event.target.checked)}
                required
              />
              I understand this is a demo and no payment will be taken.
            </label>
          </section>
          <button
            className="solid-button full-button"
            disabled={loading || isSubmitting || !user || !firebaseConfigured || cart.length === 0}
          >
            {isSubmitting ? 'SAVING…' : 'SEND ORDER INQUIRY'}
          </button>
        </form>
        <aside>
          <h2>Before you continue</h2>
          <p>This checkout is included to show how the buying experience will look.</p>
          <p>No payment will be collected and the “thank you” screen does not mean an order has been purchased.</p>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;
