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
      <span className="eyebrow">A little something for your space</span>
      <h1>Your Cart</h1>
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
                  <span>Price on request</span>
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
                <button className="remove-item" onClick={() => removeProduct(line.id)} aria-label={`Remove ${product.name}`}>
                  Remove
                </button>
              </article>
            ))}
          </div>
          <aside className="cart-summary">
            <p>Subtotal <span>Price on request</span></p>
            <small>Final pricing and shipping can be confirmed with the studio.</small>
            <Link href="/checkout" className="solid-button full-button">Checkout</Link>
            <Link href="/artworks" className="text-button">Continue shopping <ArrowRight size={13} /></Link>
            <p className="demo-disclaimer">Demo only — payments and actual checkout are not connected.</p>
          </aside>
        </div>
      ) : (
        <div className="empty-cart">
          <ShoppingBag size={25} />
          <h2>Your cart is taking a quiet moment.</h2>
          <p>There’s nothing here just yet.</p>
          <Link href="/artworks" className="outline-button">Explore artworks</Link>
        </div>
      )}
    </main>
  );
}

export default CartPage;
