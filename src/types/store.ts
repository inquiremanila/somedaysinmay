import type { Product } from '../data/products';

export type CartLine = {
  id: string;
  quantity: number;
};

export type ProductActions = {
  addToCart: (product: Product) => void;
  favourites: string[];
  onFavourite: (id: string) => void;
};
