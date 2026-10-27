import { ArtworkPrice, CartPrice } from '../components/artwork-price';
import { useLocalization } from '../localization/provider';
import { useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import type { CartLine } from '../types/store';
import type { ShippingDetails } from '../firebase/store';
import { firebaseConfigured } from '../firebase/firebase';
import { useAuth } from '../firebase/use-auth';
import ThankYou from './thank-you';
import { products } from '../data/products';

const RETURN_PATH_KEY = 'somedays-firebase-return-path';

type CheckoutProps = {
  cart: CartLine[];
  clearCart: () => void;
};

function Checkout({ cart, clearCart }: CheckoutProps) {
  const { t } = useLocalization();
  const { user, loading } = useAuth();
  const [message, setMessage] = useState('');
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

  async function placeOrderRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !firebaseConfigured) return;

    setIsSubmitting(true);
    setError('');
    try {
      const { createOrderInquiry } = await import('../firebase/store');
      await createOrderInquiry(user.uid, shipping, cart, message);
      clearCart();
      setSubmitted(true);
    } catch {
      setError('Your order request could not be saved. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) return <ThankYou checkout />;
  if (!cart.length) return <main className="checkout-page page-enter"><h1>{t("Your bag is empty")}</h1><Link href="/artworks">{t("Explore artworks")}</Link></main>;

  return (
    <main className="checkout-page page-enter">
      <span className="eyebrow">{t("A little something, on its way")}</span>
      <h1>{t("Checkout")}</h1>
      <p className="checkout-alert"> {t("Request to purchase the artwork in your bag. The studio will confirm pricing, availability, shipping, and payment details by email.")} </p>
      {!user && (
        <p className="checkout-alert"> {t("Sign in to save your order request.")}{' '}
          <Link
            href="/account"
            onClick={() => window.localStorage.setItem(RETURN_PATH_KEY, '/checkout')}
          > {t("Sign in or create an account")} </Link>
          .
        </p>
      )}
      {error && <p className="checkout-alert" role="alert">{t(error)}</p>}
      <div className="checkout-layout">
        <form onSubmit={placeOrderRequest}>
          <section>
            <h2>{t("1. Shipping")}</h2>
            <label> {t("Full name")} <input
                autoComplete="name"
                required
                value={shipping.name}
                onChange={(event) => setShipping({ ...shipping, name: event.target.value })}
              />
            </label>
            <label> {t("Address")} <input
                autoComplete="street-address"
                required
                value={shipping.address}
                onChange={(event) => setShipping({ ...shipping, address: event.target.value })}
              />
            </label>
            <div className="form-pair">
              <label> {t("City")} <input
                  autoComplete="address-level2"
                  required
                  value={shipping.city}
                  onChange={(event) => setShipping({ ...shipping, city: event.target.value })}
                />
              </label>
              <label> {t("Postcode")} <input
                  autoComplete="postal-code"
                  required
                  value={shipping.postcode}
                  onChange={(event) => setShipping({ ...shipping, postcode: event.target.value })}
                />
              </label>
            </div>
            <label> {t("Email")} <input
                type="email"
                autoComplete="email"
                required
                value={shipping.email}
                onChange={(event) => setShipping({ ...shipping, email: event.target.value })}
              />
            </label>
            <label> {t("Phone number")} <input
                type="tel"
                autoComplete="tel"
                value={shipping.phone}
                onChange={(event) => setShipping({ ...shipping, phone: event.target.value })}
              />
            </label>
          </section>
          <section>
            <h2>{t("2. Message to the studio")}</h2>
            <label> {t("Message (optional)")} <textarea rows={5} maxLength={4000} value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={t("Questions about the artwork, delivery preferences, or anything you’d like us to know.")} />
            </label>
            <p>{t("No payment is collected here. We’ll confirm your request and arrange payment by email.")}</p>
          </section>
          <button
            className="solid-button full-button"
            disabled={loading || isSubmitting || !user || !firebaseConfigured || cart.length === 0}
          >
            {isSubmitting ? t("SAVING…") : t("SEND PURCHASE REQUEST")}
          </button>
        </form>
        <aside>
          <h2>{t("Your purchase request")}</h2>
          <ul>{cart.map((line) => <li key={line.id}>{products.find((product) => product.id === line.id)?.name || line.id} × {line.quantity} · {products.find((product) => product.id === line.id) && <ArtworkPrice product={products.find((product) => product.id === line.id)!} quantity={line.quantity} />}</li>)}</ul>
          <p>{t("Artwork subtotal:")} <CartPrice cart={cart} /></p>
          <p>{t("Shipping will be confirmed separately.")}</p>
          <h2>{t("Before you continue")}</h2>
          <p>{t("You can include a message with your purchase request.")}</p>
          <p>{t("Your artwork is not reserved until the studio confirms availability and payment.")}</p>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;
