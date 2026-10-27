import { useLocalization } from '../localization/provider';
import AccordionPage from '../components/accordion-page';
import { policyGroups } from '../data/policy-content';

function Policies() {
  const { t } = useLocalization();
  return (
    <AccordionPage
      title={t("Policies")}
      intro="Clear, considered information for your visit to the studio."
      groups={policyGroups}
    />
  );
}

export default Policies;
