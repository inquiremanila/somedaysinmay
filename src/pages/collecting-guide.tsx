import EditorialLayout from '../components/editorial-layout';
import { editorialContent } from '../data/editorial-content';

function CollectingGuide() {
  return <EditorialLayout content={editorialContent['collecting-guide']} />;
}

export default CollectingGuide;
