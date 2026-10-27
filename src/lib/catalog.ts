import type { Product } from '../data/products';
export type CatalogFilters = { collection?: string; availability: string; price: string; min: string; max: string; sort: string };
export function selectProducts(products: Product[], filters: CatalogFilters): Product[] {
  const min = filters.min === '' ? null : Number(filters.min);
  const max = filters.max === '' ? null : Number(filters.max);
  const selected = products.filter((product) => {
    if (filters.collection && filters.collection !== 'All' && product.collection !== filters.collection) return false;
    if (filters.availability !== 'All' && product.availability !== filters.availability) return false;
    if (filters.price === 'fixed' && product.price === null) return false;
    if (filters.price === 'request' && product.price !== null) return false;
    if (min !== null || max !== null) {
      if (product.price === null) return false;
      if (min !== null && product.price < min) return false;
      if (max !== null && product.price > max) return false;
    }
    return true;
  });
  if (filters.sort === 'collection') selected.sort((a, b) => (a.collection || '\uffff').localeCompare(b.collection || '\uffff'));
  if (filters.sort === 'title') selected.sort((a, b) => a.name.localeCompare(b.name));
  if (filters.sort === 'low' || filters.sort === 'high') selected.sort((a, b) => {
    if (a.price === null) return b.price === null ? 0 : 1;
    if (b.price === null) return -1;
    return filters.sort === 'low' ? a.price - b.price : b.price - a.price;
  });
  return selected;
}
