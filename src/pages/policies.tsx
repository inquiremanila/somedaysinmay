import AccordionPage from '../components/accordion-page';
import { policyGroups } from '../data/policy-content';

function Policies() {
  return (
    <AccordionPage
      title="Policies"
      intro="Clear, considered information for your visit to the studio."
      groups={policyGroups}
    />
  );
}

export default Policies;
