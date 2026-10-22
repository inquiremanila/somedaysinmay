import type { ProductActions } from '../types/store';
import ProductListing from '../components/product-listing';

function ArtworkListing(props: ProductActions) {
  return <ProductListing kind="Artwork" {...props} />;
}

export default ArtworkListing;
