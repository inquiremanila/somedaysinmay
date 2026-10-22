import { Heart, Plus } from 'lucide-react';
import { Link } from 'wouter';
import type { Product } from '../data/products';

type ProductCardProps = {
  product: Product;
  onAdd: (product: Product) => void;
  favourite: boolean;
  onFavourite: (id: string) => void;
};

function ProductCard({ product, onAdd, favourite, onFavourite }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className={`product-image product-${product.id}`}>
        <Link href={`/product/${product.id}`} aria-label={`View ${product.name}`}>
          <img
            src={product.image}
            alt={`${product.name}, ${product.kind === 'Artwork' ? 'original textured artwork' : 'paper goods'}`}
            loading="lazy"
          />
        </Link>
        <button
          className={`heart-button ${favourite ? 'is-favourite' : ''}`}
          onClick={() => onFavourite(product.id)}
          aria-label={favourite ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}
        >
          <Heart size={15} fill={favourite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="product-caption">
        <Link href={`/product/${product.id}`}>
          <span>{product.name}</span>
          <small>{product.size}</small>
        </Link>
        <span className="product-price">Inquire</span>
      </div>
      {product.kind === 'Paper goods' && (
        <button className="quick-add" onClick={() => onAdd(product)}>
          Add to bag <Plus size={12} />
        </button>
      )}
    </article>
  );
}

export default ProductCard;
