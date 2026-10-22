import { Link } from 'wouter';

function About() {
  return (
    <main className="biography-page editorial-page page-enter" data-testid="page-biography">
      <div className="editorial-banner">
        <img src="/images/room-blue.jpg" alt="A textured blue painting resting in a sunlit studio interior" data-testid="image-biography-studio" />
      </div>
      <article className="editorial-copy">
        <span className="eyebrow">A little about the studio</span>
        <h1>Biography</h1>
        <p className="editorial-intro">Somedays in May is a textured art practice rooted in quiet moments and a deep appreciation for the natural world. My work explores texture, color, and repetition—finding beauty in the in-between, in the subtle shifts, and in the things that often go unnoticed.</p>
        <p>I work with layered textures, using a mix of materials to create depth and rhythm. Each piece is a reflection of personal experiences, emotions, and the calm I find in familiar landscapes—the sea, the seasons, and the constant change within them.</p>
        <p>Through my work, I hope to create pieces that bring a sense of stillness, warmth, and quiet presence into your space.</p>
        <Link href="/artworks" className="text-button" data-testid="link-biography-originals">Explore the originals <span aria-hidden="true">→</span></Link>
      </article>
      <div className="biography-details" aria-label="Details from the studio">
        <figure><img src="/images/room-tide.jpg" alt="A textured painting displayed in a softly lit living room" loading="lazy" /><figcaption>Art finding a place in the everyday.</figcaption></figure>
        <figure><img src="/images/tidal-lines.jpg" alt="Layered marks and repeating lines in a textured artwork" loading="lazy" /><figcaption>Texture, color, and repetition.</figcaption></figure>
        <figure><img src="/images/under-tow.jpg" alt="Close detail of layered, tide-inspired paint texture" loading="lazy" /><figcaption>Marks gathered slowly, one layer at a time.</figcaption></figure>
      </div>
    </main>
  );
}

export default About;
