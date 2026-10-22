export type Product = {
  id: string;
  name: string;
  kind: 'Artwork' | 'Paper goods';
  price: null;
  size: string;
  image: string;
  description: string;
  availability: 'Available' | 'Sold';
  category: string;
};

export const products: Product[] = [
  {
    id: 'under-tow',
    name: 'Under Tow',
    kind: 'Artwork',
    price: null,
    size: '100 × 75 cm',
    image: '/images/under-tow.jpg',
    description: 'A textured acrylic painting inspired by the rhythm of the sea and the quiet moments in between.',
    availability: 'Available',
    category: 'Ocean Inspired',
  },
  {
    id: 'tidal-shift',
    name: 'Tidal Shift',
    kind: 'Artwork',
    price: null,
    size: '100 × 75 cm',
    image: '/images/room-tide.jpg',
    description: 'A study in shifting light, layered blue and the steady pull of a changing tide.',
    availability: 'Available',
    category: 'Blue Series',
  },
  {
    id: 'sand-and-stone',
    name: 'Sand and Stone',
    kind: 'Artwork',
    price: null,
    size: '70 × 50 cm',
    image: '/images/room-blue.jpg',
    description: 'Quiet earth tones and tactile marks made slowly by hand.',
    availability: 'Available',
    category: 'Earth Tones',
  },
  {
    id: 'quiet-bay',
    name: 'Quiet Bay',
    kind: 'Artwork',
    price: null,
    size: '70 × 75 cm',
    image: '/images/under-tow.jpg',
    description: 'An abstracted glimpse of water in the soft light of an ordinary day.',
    availability: 'Available',
    category: 'Ocean Inspired',
  },
  {
    id: 'blue-scales-bookmark',
    name: 'Blue Scales Bookmark',
    kind: 'Paper goods',
    price: null,
    size: '5 × 18 cm',
    image: '/images/under-tow.jpg',
    description: 'A little artwork for wherever you left off. Printed on premium textured paper.',
    availability: 'Available',
    category: 'Bookmarks',
  },
  {
    id: 'rose-bookmark',
    name: 'Rose Bookmark',
    kind: 'Paper goods',
    price: null,
    size: '5 × 18 cm',
    image: '/images/room-tide.jpg',
    description: 'A single rose, gathered from the garden and printed on softly textured paper.',
    availability: 'Available',
    category: 'Bookmarks',
  },
  {
    id: 'postcard-set',
    name: 'Postcard Set',
    kind: 'Paper goods',
    price: null,
    size: 'Set of 5',
    image: '/images/room-blue.jpg',
    description: 'Small works of art made to send, keep, or pin somewhere you can see them.',
    availability: 'Available',
    category: 'Postcards',
  },
  {
    id: 'sticker-sheet',
    name: 'Sticker Sheet',
    kind: 'Paper goods',
    price: null,
    size: 'A5 sheet',
    image: '/images/under-tow.jpg',
    description: 'A collection of tiny studio favourites, printed on matte paper.',
    availability: 'Available',
    category: 'Stationery',
  },
];
