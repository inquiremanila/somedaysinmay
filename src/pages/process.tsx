import EditorialLayout from '../components/editorial-layout';
import { editorialContent } from '../data/editorial-content';

function Process() {
  return <EditorialLayout content={editorialContent.process} />;
}

export default Process;
