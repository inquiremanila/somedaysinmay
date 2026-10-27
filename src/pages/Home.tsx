import ProductListing from '../components/product-listing';
import type { ProductActions } from '../types/store';

export default function Home(props: ProductActions) {
  return <ProductListing kind="Artwork" {...props} />;
}
