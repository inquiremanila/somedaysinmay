import { ArtworkPrice } from './artwork-price';
import { useLocalization } from '../localization/provider';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { products } from '../data/products';
import type { CartLine } from '../types/store';
import LoginSignup from '../firebase/login-signup';

type SiteHeaderProps = {
  cart: CartLine[];
  setCart: (cart: CartLine[]) => void;
};

function SiteHeader({ cart, setCart }: SiteHeaderProps) {
  const { t } = useLocalization();
  const [path] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<'search' | 'account' | 'cart' | null>(null);
  const [query, setQuery] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const searchTerm = query.trim().toLocaleLowerCase();
  const results = products.filter((product) => {
    return searchTerm && `${product.name} ${t(product.kind)} ${product.category} ${product.description}`.toLocaleLowerCase().includes(searchTerm);
  });
  const visibleResults = searchTerm ? results : products.slice(0, 4);

  function openOverlay(next: 'search' | 'account' | 'cart') {
    previousFocus.current = document.activeElement as HTMLElement;
    setActiveOverlay(next);
  }

  function closeOverlay() {
    setActiveOverlay(null);
    previousFocus.current?.focus();
  }

  useEffect(() => {
    if (!activeOverlay) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (activeOverlay === 'search') searchInputRef.current?.focus();
    else closeRef.current?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') closeOverlay();
      if (event.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select, textarea');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [activeOverlay]);

  const navLinks = [
    { label: 'Originals', href: '/artworks' },
    { label: 'Biography', href: '/biography' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="site-header">
      <div className="header-inner">
        <button
          className="icon-button mobile-menu"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          data-testid="button-mobile-navigation"
        >
          {menuOpen ? <X size={17} /> : <Menu size={17} />}
        </button>
        <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`} aria-label={t("Main navigation")}>
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className={path === item.href || (item.href === '/biography' && path === '/about') ? 'active' : ''} onClick={() => setMenuOpen(false)} data-testid={`link-nav-${item.label.toLowerCase()}`}>
              {t(item.label)}
            </Link>
          ))}
        </nav>
        <Link href="/" className="wordmark" aria-label={t("Somedays in May home")} data-testid="link-brand-home">
          <span>{t("Somedays in May")}</span>
        </Link>
        <div className="header-actions">
          <button className="icon-button" type="button" aria-label={t("Search the shop")} onClick={() => openOverlay('search')} data-testid="button-open-search">
            <Search size={16} />
          </button>
          <button className="icon-button" type="button" aria-label={t("Your account")} onClick={() => openOverlay('account')} data-testid="button-open-account">
            <UserRound size={16} />
          </button>
          <button className="icon-button bag-link" type="button" aria-label={`Shopping bag, ${cartCount} items`} onClick={() => openOverlay('cart')} data-testid="button-open-cart">
            <ShoppingBag size={16} /><span className="bag-count" data-testid="text-cart-count">{cartCount}</span>
          </button>
        </div>
      </div>

      {activeOverlay === 'search' && (
        <div className="site-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) closeOverlay(); }}>
          <div className="overlay-panel search-dialog" role="dialog" aria-modal="true" aria-label={t("Search artworks and paper goods")} ref={dialogRef} data-testid="dialog-search">
            <button className="overlay-close" ref={closeRef} type="button" onClick={closeOverlay} aria-label={t("Close search")} data-testid="button-close-search"><X size={18} /></button>
            <label className="search-field">
              <Search size={17} aria-hidden="true" />
              <input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search artworks and paper goods")} aria-label={t("Search products")} data-testid="input-product-search" />
            </label>
            <p className="search-section-label">{query.trim() ? t("Search results") : t("Products")}</p>
            {visibleResults.length ? (
              <div className="search-results" aria-live="polite">
                {visibleResults.map((product) => (
                  <Link className="search-result" href={`/product/${product.id}`} key={product.id} onClick={closeOverlay} data-testid={`link-search-result-${product.id}`}>
                    <img src={product.image} alt={t("")} />
                    <span>{product.name}</span>
                    <small>{t(product.kind)} · {product.size}</small>
                  </Link>
                ))}
              </div>
            ) : <p className="search-empty" role="status">{t("Nothing found for “")}{query}{t("”. Try another word.")}</p>}
          </div>
        </div>
      )}

      {activeOverlay === 'account' && (
        <div className="site-overlay account-overlay-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeOverlay(); }}>
          <div className="overlay-panel account-dialog" role="dialog" aria-modal="true" aria-label={t("Sign in or create an account")} ref={dialogRef} data-testid="dialog-account">
            <button className="overlay-close" ref={closeRef} type="button" onClick={closeOverlay} aria-label={t("Close account dialog")} data-testid="button-close-account"><X size={18} /></button>
            <LoginSignup presentation="overlay" />
          </div>
        </div>
      )}

      {activeOverlay === 'cart' && (
        <div className="cart-drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeOverlay(); }}>
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" ref={dialogRef} data-testid="dialog-cart">
            <div className="cart-drawer-head">
              <h2 id="cart-drawer-title">{t("Your bag")} <span>({cartCount})</span></h2>
              <button className="icon-button" ref={closeRef} type="button" onClick={closeOverlay} aria-label={t("Close cart")} data-testid="button-close-cart"><X size={18} /></button>
            </div>
            {cartCount === 0 ? (
              <div className="cart-drawer-empty" data-testid="state-empty-cart">
                <ShoppingBag size={24} strokeWidth={1.2} />
                <h3>{t("Your cart is empty")}</h3>
                <p>{t("Have an account?")} <button type="button" onClick={() => setActiveOverlay('account')} data-testid="button-cart-login">{t("Log in")}</button> {t("to check out faster.")}</p>
                <Link href="/artworks" className="outline-button" onClick={closeOverlay} data-testid="link-continue-shopping">{t("Continue shopping")}</Link>
              </div>
            ) : (
              <div>
                {cart.map((line) => {
                  const product = products.find((item) => item.id === line.id);
                  if (!product) return null;
                  return (
                    <article className="drawer-line" key={line.id} data-testid={`cart-line-${line.id}`}>
                      <img src={product.image} alt={product.name} />
                      <div><strong>{product.name}</strong><small>{product.size} {t("· Quantity")} {line.quantity}</small><small><ArtworkPrice product={product} quantity={line.quantity} /></small></div>
                      <button className="drawer-remove" type="button" onClick={() => setCart(cart.filter((item) => item.id !== line.id))} aria-label={`Remove ${product.name}`} data-testid={`button-remove-${line.id}`}>{t("Remove")}</button>
                    </article>
                  );
                })}
                <Link href="/cart" className="outline-button drawer-cart-link" onClick={closeOverlay} data-testid="link-view-cart">{t("View your bag")}</Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </header>
  );
}

export default SiteHeader;
