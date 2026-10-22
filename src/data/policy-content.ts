import type { FAQGroup } from './faq-content';

export const policyGroups: FAQGroup[] = [
  {
    title: 'Terms and Conditions',
    questions: [
      {
        question: 'Terms and Conditions',
        answer: 'This storefront is a visual demo. Purchases, payment, subscriptions and order processing are not connected.',
      },
    ],
  },
  {
    title: 'Privacy Policy',
    questions: [
      {
        question: 'Privacy Policy',
        answer: 'This demo does not submit or store contact form details. Cart contents and favourites are saved locally in your browser.',
      },
    ],
  },
  {
    title: 'Shipping Policy',
    questions: [
      {
        question: 'Shipping Policy',
        answer: 'Shipping options and delivery timing will be confirmed before the shop opens for orders.',
      },
    ],
  },
  {
    title: 'Return and Exchange Policy',
    questions: [
      {
        question: 'Return and Exchange Policy',
        answer: 'Please contact the studio before purchasing an original work. Final return terms will be published before launch.',
      },
    ],
  },
  {
    title: 'Copyright and Image Use',
    questions: [
      {
        question: 'Copyright and Image Use',
        answer: 'All artwork and images remain the property of Somedays in May. Please do not reproduce without permission.',
      },
    ],
  },
];
