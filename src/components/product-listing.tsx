import { useState } from 'react';
import { Grid2X2, Grip } from 'lucide-react';
import { useLocalization } from '../localization/provider';
import { products, type Product } from '../data/products';
import type { ProductActions } from '../types/store';
import { selectProducts, type CatalogFilters } from '../lib/catalog';
import ProductCard from './product-card';

type ProductListingProps = ProductActions & { kind: Product['kind'] };
const initialFilters: CatalogFilters = { collection: 'All', availability: 'All', price: 'all', min: '', max: '', sort: 'featured' };

function ProductListing({ kind }: ProductListingProps) {
  const { t } = useLocalization();
  const [filters, setFilters] = useState(initialFilters);
  const [columns, setColumns] = useState(3);
  const catalog = products.filter((product) => product.kind === kind);
  const collections = Array.from(new Set(catalog.flatMap((product) => product.collection ? [product.collection] : [])));
  const visibleProducts = selectProducts(catalog, filters);
  function update(key: keyof CatalogFilters, value: string) { setFilters((current) => ({ ...current, [key]: value })); }
  return (
    <main className="gallery-page page-enter" aria-label={t(kind === 'Artwork' ? 'Artworks' : 'Paper Goods')}>
      <h1 className="sr-only">{t(kind === 'Artwork' ? 'Artworks' : 'Paper Goods')}</h1>
      <div className="gallery-toolbar">
        <div className="gallery-filters">
          {collections.length > 0 && <details className="gallery-filter">
            <summary>{filters.collection === 'All' ? t('Collection') : filters.collection}</summary>
            <div className="gallery-filter-panel">
              {['All', ...collections].map((value) => <label key={value}>
                <input type="radio" name="collection" checked={filters.collection === value} onChange={() => update('collection', value)} />{value === 'All' ? t('All') : value}
              </label>)}
            </div>
          </details>}
          <details className="gallery-filter">
            <summary>{t('Availability')}</summary>
            <div className="gallery-filter-panel">
              {['All', 'Available', 'Sold'].map((value) => <label key={value}>
                <input type="radio" name="availability" checked={filters.availability === value} onChange={() => update('availability', value)} />{t(value)}
              </label>)}
            </div>
          </details>
          <details className="gallery-filter">
            <summary>{t('Price')}</summary>
            <div className="gallery-filter-panel price-filter-panel">
              {[['all', 'All'], ['fixed', 'Fixed price'], ['request', 'Price on request']].map(([value, label]) => <label key={value}>
                <input type="radio" name="price" checked={filters.price === value} onChange={() => update('price', value)} />{t(label)}
              </label>)}
              <div className="price-filter-range">
                <label>USD <input type="number" min="0" step="0.01" placeholder="0" aria-label={t('Minimum price in USD')} value={filters.min} onChange={(event) => update('min', event.target.value)} /></label>
                <span>–</span>
                <label>USD <input type="number" min="0" step="0.01" placeholder="∞" aria-label={t('Maximum price in USD')} value={filters.max} onChange={(event) => update('max', event.target.value)} /></label>
              </div>
            </div>
          </details>
        </div>
        <div className="gallery-view-controls">
          <span className="gallery-count" role="status">{visibleProducts.length} {t('items')}</span>
          <label className="gallery-sort"><span className="sr-only">{t('Sort by')}</span>
            <select aria-label={t('Sort by')} value={filters.sort} onChange={(event) => update('sort', event.target.value)}>
              <option value="featured">{t('Sort')}</option>
              {collections.length > 0 && <option value="collection">{t('Collection')}</option>}
              <option value="title">{t('Title')}</option>
              <option value="low">{t('Price: low to high')}</option>
              <option value="high">{t('Price: high to low')}</option>
            </select>
          </label>
          <div className="gallery-density" role="group" aria-label={t('Grid layout')}>
            <button type="button" aria-label={t('Three columns')} aria-pressed={columns === 3} onClick={() => setColumns(3)}><Grid2X2 size={15} /></button>
            <button type="button" aria-label={t('Four columns')} aria-pressed={columns === 4} onClick={() => setColumns(4)}><Grip size={15} /></button>
          </div>
        </div>
      </div>
      <div className={`gallery-grid gallery-columns-${columns}`}>
        {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      {!visibleProducts.length && <div className="gallery-empty"><p>{t('No artworks match your filters.')}</p><button type="button" onClick={() => setFilters(initialFilters)}>{t('Clear filters')}</button></div>}
    </main>
  );
}
export default ProductListing;
