import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { products, type Product } from '../data/products';
import type { ProductActions } from '../types/store';
import ProductCard from './product-card';

type ProductListingProps = ProductActions & {
  kind: Product['kind'];
};

function ProductListing({ kind, addToCart, favourites, onFavourite }: ProductListingProps) {
  const [category, setCategory] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [sort, setSort] = useState('Featured');
  const collection = products.filter((product) => product.kind === kind);
  const categories = ['All', ...Array.from(new Set(collection.map((product) => product.category)))];
  const visibleProducts = collection.filter(
    (product) =>
      (category === 'All' || product.category === category) &&
      (availability === 'All' || product.availability === availability),
  );

  return (
    <main className="catalog-page page-enter">
      <div className="catalog-intro">
        <div>
          <span className="eyebrow">A considered collection</span>
          <h1>{kind === 'Artwork' ? 'Artworks' : 'Paper Goods'}</h1>
          <p>
            {kind === 'Artwork'
              ? 'Textured pieces inspired by the sea, natural forms and everyday stillness.'
              : 'Little art to take with you.'}
          </p>
        </div>
        <label className="sort-control">
          Sort by
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option>Featured</option>
          </select>
          <ChevronDown size={13} />
        </label>
      </div>
      <div className="catalog-layout">
        <aside className="filter-sidebar">
          <span className="eyebrow">Collection</span>
          {categories.map((item) => (
            <button
              className={category === item ? 'filter-active' : ''}
              key={item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
          <div className="filter-divider" />
          <span className="eyebrow">Availability</span>
          {['All', 'Available', 'Sold'].map((item) => (
            <label className="radio-filter" key={item}>
              <input
                type="radio"
                name="availability"
                checked={availability === item}
                onChange={() => setAvailability(item)}
              />
              {item}
            </label>
          ))}
        </aside>
        <div className="catalog-results">
          <div className="mobile-filter-row">
            <select
              aria-label="Filter by collection"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select
              aria-label="Filter by availability"
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
            >
              {['All', 'Available', 'Sold'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={addToCart}
                favourite={favourites.includes(product.id)}
                onFavourite={onFavourite}
              />
            ))}
          </div>
          {visibleProducts.length === 0 && (
            <div className="empty-state">
              <p>No pieces in this little corner just now.</p>
              <button onClick={() => { setCategory('All'); setAvailability('All'); }}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default ProductListing;
