import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import EditorialLayout from '../components/editorial-layout';
import { editorialContent } from '../data/editorial-content';

function Journal() {
  const [openEntry, setOpenEntry] = useState<string | null>(null);
  const entries = editorialContent.journal.body;

  return (
    <EditorialLayout content={editorialContent.journal}>
      <div className="journal-entries">
        {entries.map((entry, index) => (
          <article key={entry}>
            <span className="eyebrow">May {12 + index}, 2025</span>
            <h2>{entry.split(' — ')[0]}</h2>
            <p>{entry.split(' — ')[1]}</p>
            <button onClick={() => setOpenEntry(openEntry === entry ? null : entry)}>
              {openEntry === entry ? 'Close note' : 'Read note'} <ArrowRight size={13} />
            </button>
            {openEntry === entry && (
              <p className="entry-expanded">
                Some things ask to be noticed slowly. In the studio, colour and texture are a way of keeping those everyday moments close — a small reminder that beauty can be found without looking far.
              </p>
            )}
          </article>
        ))}
      </div>
    </EditorialLayout>
  );
}

export default Journal;
