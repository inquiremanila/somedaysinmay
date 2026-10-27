import { biography } from '../data/biography';
import { useLocalization } from '../localization/provider';

function About() {
  const { t } = useLocalization();
  return (
    <main className="artist-bio page-enter" data-testid="page-biography">
      <article className="artist-bio-copy">
        <h1>Somedays<br />in May</h1>
        {biography.map((paragraph) => <p key={paragraph}>{t(paragraph)}</p>)}
      </article>
      <figure className="artist-bio-image">
        <img src="/images/artist-portrait.png" alt={t('Portrait of the artist behind Somedays in May')} width={1024} height={1536} data-testid="image-biography-studio" />
      </figure>
    </main>
  );
}
export default About;
