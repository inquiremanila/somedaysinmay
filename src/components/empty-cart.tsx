import { ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';
import { useLocalization } from '../localization/provider';

type Props = { email: string | null; signedIn: boolean; loading: boolean; onLogin: () => void; onContinue: () => void };
export default function EmptyCart({ email, signedIn, loading, onLogin, onContinue }: Props) {
  const { t } = useLocalization();
  return <div className="cart-drawer-empty" data-testid="state-empty-cart">
    <ShoppingBag size={24} strokeWidth={1.2} />
    <h3>{t('Your cart is empty')}</h3>
    {loading ? <p role="status">{t('Loading your account…')}</p> : signedIn
      ? <p>{t('Signed in as')} {email}</p>
      : <p>{t('Have an account?')} <button type="button" onClick={onLogin} data-testid="button-cart-login">{t('Log in')}</button> {t('to check out faster.')}</p>}
    <p>{t('Availability and price requests are sent by email and do not add items to your bag.')}</p>
    <Link href="/artworks" className="outline-button" onClick={onContinue} data-testid="link-continue-shopping">{t('Continue shopping')}</Link>
  </div>;
}
