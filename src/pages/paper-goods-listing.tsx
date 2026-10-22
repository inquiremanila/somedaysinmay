import type { ProductActions } from '../types/store';
import ProductListing from '../components/product-listing';

function PaperGoodsListing(props: ProductActions) {
  return <ProductListing kind="Paper goods" {...props} />;
}

export default PaperGoodsListing;
