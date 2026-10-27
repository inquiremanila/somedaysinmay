import { ArtworkPrice, CartPrice } from '../components/artwork-price';
import { useLocalization } from '../localization/provider';
import { ArrowRight, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';
import { products, type Product } from '../data/products';
import type { CartLine } from '../types/store';

type CartPageProps = {
  cart: CartLine[];
  setCart: (cart: CartLine[]) => void;
  syncError?: string;
};

function CartPage({ cart, setCart, syncError }: CartPageProps) {
  const { t } = useLocalization();
  const cartProducts = cart
    .map((line) => ({ line, product: products.find((product) => product.id === line.id) }))
    .filter((item): item is { line: CartLine; product: Product } => Boolean(item.product));

  function changeQuantity(id: string, amount: number) {
    setCart(cart.map((line) =>
      line.id === id ? { ...line, quantity: Math.min(99, Math.max(1, line.quantity + amount)) } : line,
    ));
  }

  function removeProduct(id: string) {
    setCart(cart.filter((line) => line.id !== id));
  }

  return (
    <main className="cart-page page-enter">
      <span className="eyebrow">{t("A little something for your space")}</span>
      <h1>{t("Your Cart")}</h1>
      {syncError && <p className="checkout-alert" role="alert">{syncError}</p>}
      {cartProducts.length ? (
        <div className="cart-content">
          <div>
            {cartProducts.map(({ line, product }) => (
              <article className="cart-line" key={line.id}>
                <img src={product.image} alt={product.name} />
                <div className="cart-line-title">
                  <Link href={`/product/${product.id}`}>{product.name}</Link>
                  <small>{product.size}</small>
                  <span><ArtworkPrice product={product} quantity={line.quantity} /></span>
                </div>
                <div className="quantity-control">
                  <button
                    aria-label={`Decrease ${product.name} quantity`}
                    onClick={() => line.quantity === 1 ? removeProduct(line.id) : changeQuantity(line.id, -1)}
                  >
                    <Minus size={12} />
                  </button>
                  <span>{line.quantity}</span>
                  <button
                    aria-label={`Increase ${product.name} quantity`}
                    onClick={() => changeQuantity(line.id, 1)}
                    disabled={line.quantity >= 99}
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <button className="remove-item" onClick={() => removeProduct(line.id)} aria-label={`Remove ${product.name}`}> {t("Remove")} </button>
              </article>
            ))}
          </div>
          <aside className="cart-summary">
            <p>{t("Subtotal")} <span><CartPrice cart={cart} /></span></p>
            <small>{t("Final pricing and shipping can be confirmed with the studio.")}</small>
            <Link href="/checkout" className="solid-button full-button">{t("Checkout")}</Link>
            <Link href="/artworks" className="text-button">{t("Continue shopping")} <ArrowRight size={13} /></Link>
            <p className="demo-disclaimer">{t("Send a purchase request to confirm availability and arrange payment with the studio.")}</p>
          </aside>
        </div>
      ) : (
        <div className="empty-cart">
          <ShoppingBag size={25} />
          <h2>{t("Your cart is taking a quiet moment.")}</h2>
          <p>{t("There’s nothing here just yet.")}</p>
          <Link href="/artworks" className="outline-button">{t("Explore artworks")}</Link>
        </div>
      )}
    </main>
  );
}

export default CartPage;
