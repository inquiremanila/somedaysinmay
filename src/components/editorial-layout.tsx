import type { ReactNode } from 'react';
import type { EditorialContent } from '../data/editorial-content';

type EditorialLayoutProps = {
  content: EditorialContent;
  children?: ReactNode;
};

function EditorialLayout({ content, children }: EditorialLayoutProps) {
  return (
    <main className="editorial-page page-enter">
      <div className="editorial-banner">
        <img src={content.image} alt={`${content.title} from the Somedays in May studio`} />
      </div>
      <div className="editorial-copy">
        <span className="eyebrow">{content.kicker}</span>
        <h1>{content.title}</h1>
        <p className="editorial-intro">{content.intro}</p>
        {content.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {children}
      </div>
    </main>
  );
}

export default EditorialLayout;
