export type EditorialContent = {
  title: string;
  kicker: string;
  intro: string;
  image: string;
  body: string[];
};

export const editorialContent: Record<string, EditorialContent> = {
  about: {
    title: 'About',
    kicker: 'A quiet corner of the everyday',
    intro: 'Somedays in May is a quiet corner for art, inspired by the sea, nature, and the in-between days.',
    image: '/images/swirls.jpg',
    body: [
      'Each piece is a reminder to slow down, find beauty in the ordinary, and hold on to the little things that make a day brighter.',
      'A small independent art studio making original paintings and paper goods with a thoughtful, tactile approach.',
    ],
  },
  process: {
    title: 'The Process',
    kicker: 'Textured layers, simple materials, and a lot of time.',
    intro: 'A look into how each piece comes to life — from texture, to colour, to the final details.',
    image: '/images/undertow-pink.jpg',
    body: [
      'The studio begins with a feeling, a place, or the colour of the light on a certain day.',
      'Layers gather slowly. Paint is added, drawn back, and added again until each mark has room to breathe.',
      'The final work is sealed, considered, and prepared to find its home.',
    ],
  },
  'collecting-guide': {
    title: 'Collecting Guide',
    kicker: 'A simple guide for first-time and growing collectors.',
    intro: 'Choosing a piece for your home should feel personal, not complicated.',
    image: '/images/space-in-between.jpg',
    body: [
      'Choose the piece that keeps drawing your eye. Leave a little room around it, and think about the light the work will live with.',
      'For hanging, use a secure fixing appropriate to your wall. A frame can add a quiet boundary, but a canvas can also feel at home as it is.',
      'Original works are one of a kind. If you have questions about scale, colour, or a particular space, the studio would love to help.',
    ],
  },
  commissions: {
    title: 'Commissions',
    kicker: 'Let’s create something meaningful for your space.',
    intro: 'Custom sizes, colour palettes, or a piece inspired by a place or moment that matters to you.',
    image: '/images/swirls.jpg',
    body: [
      'Commission enquiries are considered individually. Share a little about your space, colours you are drawn to, and what you hope the piece might hold.',
      'A reply from the studio will outline timing, size, materials, and next steps.',
    ],
  },
  journal: {
    title: 'Journal',
    kicker: 'Thoughts, process, and the in-between days.',
    intro: 'A few notes on making, looking, and noticing what is already here.',
    image: '/images/undertow-pink.jpg',
    body: [
      'In Every Season, a Little Grace — Notes on finding small anchors in the changing light.',
      'Textures and Tides — The marks water leaves behind, and the ones paint keeps.',
      'The Beauty in the Ordinary — A cup on the table, late afternoon, one quiet colour.',
    ],
  },
};
