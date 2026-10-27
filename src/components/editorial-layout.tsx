import { useLocalization } from '../localization/provider';
import type { ReactNode } from 'react';
import type { EditorialContent } from '../data/editorial-content';

type EditorialLayoutProps = {
  content: EditorialContent;
  children?: ReactNode;
};

function EditorialLayout({ content, children }: EditorialLayoutProps) {
  const { t } = useLocalization();
  return (
    <main className="editorial-page page-enter">
      <div className="editorial-banner">
        <img src={content.image} alt={`${t(content.title)} from the Somedays in May studio`} />
      </div>
      <div className="editorial-copy">
        <span className="eyebrow">{t(content.kicker)}</span>
        <h1>{t(content.title)}</h1>
        <p className="editorial-intro">{t(content.intro)}</p>
        {content.body.map((paragraph) => <p key={t(paragraph)}>{t(paragraph)}</p>)}
        {children}
      </div>
    </main>
  );
}

export default EditorialLayout;
