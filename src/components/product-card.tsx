import { useState, type CSSProperties } from 'react';
import { Link } from 'wouter';
import { ArtworkPrice } from './artwork-price';
import { useLocalization } from '../localization/provider';
import type { Product } from '../data/products';

export default function ProductCard({ product }: { product: Product }) {
  const { t } = useLocalization();
  const [imageRatio, setImageRatio] = useState(1.42);
  return (
    <article className="gallery-card">
      <Link href={`/product/${product.id}`} className="gallery-card-image" aria-label={product.name}>
        <span className="gallery-artwork" style={{ '--artwork-ratio': imageRatio } as CSSProperties}>
          <img src={product.image} alt={product.description || product.name} loading="lazy" onLoad={(event) => {
            const image = event.currentTarget;
            setImageRatio(image.naturalWidth / image.naturalHeight);
          }} />
          {product.availability === 'Sold' && <span className="sold-label">{t('Sold out')}</span>}
        </span>
      </Link>
      <div className="gallery-card-caption">
        <Link href={`/product/${product.id}`}>{product.name}</Link>
        <ArtworkPrice product={product} />
      </div>
    </article>
  );
}
