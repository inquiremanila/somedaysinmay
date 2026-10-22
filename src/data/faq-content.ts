export type FAQQuestion = {
  question: string;
  answer: string;
};

export type FAQGroup = {
  title: string;
  questions: FAQQuestion[];
};

export const faqGroups: FAQGroup[] = [
  {
    title: 'Ordering and Payment',
    questions: [
      {
        question: 'How do I place an order?',
        answer: 'Choose a piece or paper good and add it to your cart. This is a demo storefront: payment and checkout are not connected.',
      },
      {
        question: 'Which payment methods do you accept?',
        answer: 'A secure payment provider will be added before launch. No payment is collected on this demo site.',
      },
    ],
  },
  {
    title: 'Shipping and Delivery',
    questions: [
      {
        question: 'Where do you ship?',
        answer: 'Original works and paper goods are intended to ship worldwide from the studio. Final shipping rates and delivery estimates will be confirmed at launch.',
      },
      {
        question: 'How long will my order take?',
        answer: 'Paper goods are carefully packed in a few studio days. Original works need a little extra time to prepare safely.',
      },
    ],
  },
  {
    title: 'Artwork Care',
    questions: [
      {
        question: 'How should I care for my artwork?',
        answer: 'Keep your piece out of direct sunlight and away from damp spaces. A soft, dry cloth is all that is needed for the frame.',
      },
      {
        question: 'Can I see the artwork in a room?',
        answer: 'The collecting guide shares ideas for imagining scale and placement. Get in touch if you would like help with a particular space.',
      },
    ],
  },
  {
    title: 'Framing',
    questions: [
      {
        question: 'Does artwork arrive framed?',
        answer: 'Framing details are listed on each artwork page. Please inquire before purchasing if you would like to discuss framing.',
      },
    ],
  },
  {
    title: 'Commissions',
    questions: [
      {
        question: 'Are commissions open?',
        answer: 'Occasionally. Share a little about your space, palette, and hopes through the commissions inquiry form.',
      },
    ],
  },
  {
    title: 'Returns and Exchanges',
    questions: [
      {
        question: 'Can I return a piece?',
        answer: 'Because every original work is one of a kind, please review the collecting guide and contact the studio with any questions before purchase.',
      },
    ],
  },
];
