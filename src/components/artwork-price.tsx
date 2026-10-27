import { useLocalization } from '../localization/provider';
import { products, type Product } from '../data/products';
import type { CartLine } from '../types/store';

export function ArtworkPrice({ product, quantity = 1 }: { product: Product; quantity?: number }) {
  const { formatProductPrice, formatLocalPrice } = useLocalization();
  const local = formatLocalPrice(product, quantity);
  return <span className="price-stack"><span className="price-main">{formatProductPrice(product, quantity)}</span>
    {local && <small className="price-local">{local}</small>}</span>;
}
export function CartPrice({ cart }: { cart: CartLine[] }) {
  const { cartPriceSummary, localCartSummary } = useLocalization();
  const local = localCartSummary(cart, products);
  return <span className="price-stack"><span className="price-main">{cartPriceSummary(cart, products)}</span>
    {local && <small className="price-local">{local}</small>}</span>;
}
