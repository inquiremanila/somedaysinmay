import { useEffect, useState } from 'react';
import { Route, Switch } from 'wouter';
import SiteHeader from './components/site-header';
import SiteFooter from './components/site-footer';
import Home from './pages/Home';
import About from './pages/about';
import Contact from './pages/contact';
import ArtworkListing from './pages/artwork-listing';
import PaperGoodsListing from './pages/paper-goods-listing';
import ProductDetail from './pages/product-detail';
import CartPage from './pages/cart';
import Checkout from './pages/checkout';
import LoginSignup from './firebase/login-signup';
import Process from './pages/process';
import Commissions from './pages/commissions';
import CollectingGuide from './pages/collecting-guide';
import Journal from './pages/journal';
import FAQ from './pages/faq';
import Policies from './pages/policies';
import MailClub from './pages/mail-club';
import Auctions from './pages/auctions';
import ThankYou from './pages/thank-you';
import NotFound from './pages/not-found';
import type { CartLine } from './types/store';
import type { Product } from './data/products';

const CART_STORAGE_KEY = 'somedays-cart';

function App() {
  const [cart, setCart] = useState<CartLine[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) as CartLine[] : [];
    } catch {
      return [];
    }
  });
  const [favourites, setFavourites] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((line) => line.id === product.id);
      return existing
        ? current.map((line) => line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line)
        : [...current, { id: product.id, quantity: 1 }];
    });
  }

  function toggleFavourite(id: string) {
    setFavourites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <div className="app-shell">
      <SiteHeader cart={cart} setCart={setCart} />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/biography" component={About} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/artworks">{() => <ArtworkListing addToCart={addToCart} favourites={favourites} onFavourite={toggleFavourite} />}</Route>
        <Route path="/paper-goods">{() => <PaperGoodsListing addToCart={addToCart} favourites={favourites} onFavourite={toggleFavourite} />}</Route>
        <Route path="/product/:id">{(params) => <ProductDetail id={params.id} addToCart={addToCart} />}</Route>
        <Route path="/cart">{() => <CartPage cart={cart} setCart={setCart} />}</Route>
        <Route path="/checkout">{() => <Checkout cart={cart} clearCart={() => setCart([])} />}</Route>
        <Route path="/account">{() => <LoginSignup />}</Route>
        <Route path="/process" component={Process} />
        <Route path="/commissions" component={Commissions} />
        <Route path="/collecting-guide" component={CollectingGuide} />
        <Route path="/journal" component={Journal} />
        <Route path="/faq" component={FAQ} />
        <Route path="/policies" component={Policies} />
        <Route path="/mail-club" component={MailClub} />
        <Route path="/auctions" component={Auctions} />
        <Route path="/thank-you">{() => <ThankYou />}</Route>
        <Route component={NotFound} />
      </Switch>
      <SiteFooter />
    </div>
  );
}

export default App;
