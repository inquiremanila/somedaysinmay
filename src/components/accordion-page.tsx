import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import type { FAQGroup } from '../data/faq-content';

type AccordionPageProps = {
  title: string;
  intro: string;
  groups: FAQGroup[];
};

function AccordionPage({ title, intro, groups }: AccordionPageProps) {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <main className="basic-editorial page-enter">
      <span className="eyebrow">Somedays in May</span>
      <h1>{title}</h1>
      <p className="basic-intro">{intro}</p>
      <div className="accordion-list">
        {groups.map((group) => (
          <section className="accordion-group" key={group.title}>
            <h2>{group.title}</h2>
            {group.questions.map((item) => (
              <div className="faq-row" key={item.question}>
                <button
                  onClick={() => setOpenQuestion(openQuestion === item.question ? null : item.question)}
                  aria-expanded={openQuestion === item.question}
                >
                  {item.question}
                  {openQuestion === item.question ? <Minus size={14} /> : <Plus size={14} />}
                </button>
                {openQuestion === item.question && <p>{item.answer}</p>}
              </div>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}

export default AccordionPage;
