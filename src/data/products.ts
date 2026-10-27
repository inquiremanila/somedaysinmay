export type Product = {
  id: string;
  name: string;
  kind: 'Artwork' | 'Paper goods';
  size: string;
  image: string;
  description: string;
  material?: string;
  availability: 'Available' | 'Sold';
  category: string;
  collection?: string;
} & ({ price: null; currency?: never } | { price: number; currency: string });

const sizes: Record<string, string> = {
  'space-in-between': '40 × 40 cm',
  tiled: '50 × 70 cm',
  swirls: '100 × 145 cm',
};
const descriptions: Record<string, string> = {
  'undertow-1': 'Undertow 1 is an original textured abstract painting with rows of sculptural marks graduating from deep blue to white.',
  'undertow-2': 'Undertow 2 is an original textured abstract painting exploring a gradient of white, olive and deep green in repeated raised marks.',
  'undertow-3': 'Undertow 3 is an original textured abstract painting with repeated raised marks shifting from soft pink to deep red.',
  'undertow-4': 'Undertow 4 is an original textured abstract painting with horizontal rows of raised marks in white and shades of blue.',
  'space-in-between': 'Space in Between is an original textured abstract painting from the Lines collection, pairing vertical blue marks with open white space.',
  tiled: 'Tiled is an original textured abstract painting from the Lines collection, with a grid of blue and white textured forms.',
  swirls: 'Swirls is an original textured abstract painting from the Swirls & Sand collection, featuring flowing black and cream forms.',
};

export const products: Product[] = [
  { id: 'undertow-1', name: 'Undertow 1', image: '/images/undertow-blue.png', collection: 'Undertow' },
  { id: 'undertow-2', name: 'Undertow 2', image: '/images/undertow-olive.png', collection: 'Undertow' },
  { id: 'undertow-3', name: 'Undertow 3', image: '/images/undertow-pink.jpg', collection: 'Undertow' },
  { id: 'undertow-4', name: 'Undertow 4', image: '/images/undertow.png', collection: 'Undertow' },
  { id: 'space-in-between', name: 'Space in Between', image: '/images/space-in-between.jpg', collection: 'Lines' },
  { id: 'tiled', name: 'Tiled', image: '/images/tiled.jpg', collection: 'Lines' },
  { id: 'swirls', name: 'Swirls', image: '/images/swirls.jpg', collection: 'Swirls & Sand' },
].map((painting): Product => ({
  ...painting, kind: 'Artwork',
  price: null,
  size: sizes[painting.id] || '100 × 75 cm',
  description: `${descriptions[painting.id]} Mixed media acrylic on canvas, ${sizes[painting.id] || '100 × 75 cm'}.`,
  material: 'Mixed Media Acrylic on Canvas',
  availability: ['undertow-3', 'space-in-between', 'swirls'].includes(painting.id) ? 'Available' : 'Sold',
  category: painting.collection,
}));
