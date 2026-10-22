import AccordionPage from '../components/accordion-page';
import { faqGroups } from '../data/faq-content';

function FAQ() {
  return (
    <AccordionPage
      title="Frequently Asked Questions"
      intro="A few helpful details, gathered in one place."
      groups={faqGroups}
    />
  );
}

export default FAQ;
