import { useLocalization } from '../localization/provider';
import AccordionPage from '../components/accordion-page';
import { faqGroups } from '../data/faq-content';

function FAQ() {
  const { t } = useLocalization();
  return (
    <AccordionPage
      title={t("Frequently Asked Questions")}
      intro="A few helpful details, gathered in one place."
      groups={faqGroups}
    />
  );
}

export default FAQ;
