import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import EditorialLayout from '../components/editorial-layout';
import { editorialContent } from '../data/editorial-content';

function Commissions() {
  return (
    <EditorialLayout content={editorialContent.commissions}>
      <Link href="/contact" className="outline-button">
        Inquire for a commission <ArrowRight size={14} />
      </Link>
    </EditorialLayout>
  );
}

export default Commissions;
