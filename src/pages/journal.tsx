import { useLocalization } from '../localization/provider';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import EditorialLayout from '../components/editorial-layout';
import { editorialContent } from '../data/editorial-content';

function Journal() {
  const { t } = useLocalization();
  const [openEntry, setOpenEntry] = useState<string | null>(null);
  const entries = editorialContent.journal.body;

  return (
    <EditorialLayout content={editorialContent.journal}>
      <div className="journal-entries">
        {entries.map((entry, index) => (
          <article key={entry}>
            <span className="eyebrow">{t("May")} {12 + index}, 2025</span>
            <h2>{t(entry.split(' — ')[0])}</h2>
            <p>{t(entry.split(' — ')[1])}</p>
            <button onClick={() => setOpenEntry(openEntry === entry ? null : entry)}>
              {openEntry === entry ? t("Close note") : t("Read note")} <ArrowRight size={13} />
            </button>
            {openEntry === entry && (
              <p className="entry-expanded"> {t("Some things ask to be noticed slowly. In the studio, colour and texture are a way of keeping those everyday moments close — a small reminder that beauty can be found without looking far.")} </p>
            )}
          </article>
        ))}
      </div>
    </EditorialLayout>
  );
}

export default Journal;
