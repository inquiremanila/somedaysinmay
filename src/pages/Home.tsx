import { useEffect, useRef, useState } from 'react';

type Piece = { title: string; size: string; image: string; category: 'Large' | 'Medium' | 'Small' };

const pieces: Piece[] = [
  { title: 'Between Seasons', size: '75 × 100 cm', image: 'between-seasons.jpg', category: 'Medium' },
  { title: 'A Quieter Place', size: '70 × 50 cm', image: 'a-quieter-place.jpg', category: 'Small' },
  { title: 'Tidal Lines', size: '75 × 140 cm', image: 'tidal-lines.jpg', category: 'Large' },
  { title: 'Deeper Still', size: '82 × 56 cm', image: 'deeper-still.jpg', category: 'Medium' },
  { title: 'Further In', size: '75 × 140 cm', image: 'further-in.jpg', category: 'Large' },
  { title: 'Still Here', size: '70 × 50 cm', image: 'still-here.jpg', category: 'Small' },
  { title: 'In Between', size: '75 × 120 cm', image: 'in-between.jpg', category: 'Large' },
  { title: 'The Calm', size: '70 × 50 cm', image: 'the-calm.jpg', category: 'Small' },
  { title: 'A Different Light', size: '75 × 120 cm', image: 'a-different-light.jpg', category: 'Large' },
  { title: 'Some Kind of Peace', size: '82 × 56 cm', image: 'some-kind-of-peace.jpg', category: 'Medium' },
  { title: 'Stillness', size: '75 × 140 cm', image: 'stillness.jpg', category: 'Large' },
  { title: 'Another Season', size: '70 × 50 cm', image: 'another-season.jpg', category: 'Small' },
];

const slides = [
  { title: 'Tidal Lines', size: '75 × 140 cm', image: 'hero.jpg' },
  { title: 'Further In', size: '75 × 140 cm', image: 'further-in.jpg' },
  { title: 'A Different Light', size: '75 × 120 cm', image: 'a-different-light.jpg' },
  { title: 'Stillness', size: '75 × 140 cm', image: 'stillness.jpg' },
  { title: 'Between Seasons', size: '75 × 100 cm', image: 'between-seasons.jpg' },
];

function Home() {
  const [filter, setFilter] = useState('All');
  const [visible, setVisible] = useState(12);
  const [gridMessage, setGridMessage] = useState('');
  const [slide, setSlide] = useState(0);
  const [selected, setSelected] = useState<Piece | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const shownPieces = pieces.filter((piece) => filter === 'All' || piece.category.toLowerCase() === filter.toLowerCase());

  useEffect(() => {
    if (!selected) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button, a, input, textarea');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, [selected]);

  function chooseFilter(next: string) { setFilter(next); setVisible(12); setGridMessage(''); }
  return (
    <main>
      <section className="featured" aria-label="Featured artwork">
        <img className="feature-image" src={`/images/${slides[slide].image}`} alt={`${slides[slide].title}, original textured artwork`} />
        <div className="feature-info">
          <div className="feature-details">
            <strong>{slides[slide].title}</strong><span>{slides[slide].size}</span><span>Oil on Canvas</span><span>Price on request</span>
          </div>
          <div className="slide-controls">
            <span>{slide + 1} / {slides.length}</span>
            <button type="button" aria-label="Previous featured artwork" data-testid="button-previous-artwork" onClick={() => setSlide((slide + slides.length - 1) % slides.length)}>‹</button>
            <button type="button" aria-label="Next featured artwork" data-testid="button-next-artwork" onClick={() => setSlide((slide + 1) % slides.length)}>›</button>
          </div>
        </div>
      </section>

      <section className="collection" id="originals">
        <div className="collection-head">
          <h1>Originals</h1>
          <div className="filters" role="group" aria-label="Filter artworks by size">
            {['All', 'Large', 'Medium', 'Small'].map((item) => (
              <button key={item} type="button" className={filter === item ? 'active' : ''} data-testid={`button-filter-${item.toLowerCase()}`} aria-pressed={filter === item} onClick={() => chooseFilter(item)}>{item}</button>
            ))}
          </div>
        </div>
        <div className="art-grid">
          {shownPieces.slice(0, visible).map((piece) => (
            <button className="art-card" key={piece.title} type="button" data-testid={`button-artwork-${piece.image.replace('.jpg', '')}`} onClick={() => setSelected(piece)} aria-label={`View ${piece.title}, ${piece.size}`}>
              <span className="art-image"><img src={`/images/${piece.image}`} alt={piece.title} loading="lazy" /></span>
              <span className="art-title">{piece.title}</span>
              <span>{piece.size}</span><span>Oil on Canvas</span><span>Price on request</span>
            </button>
          ))}
        </div>
        <button className="load-more" type="button" data-testid="button-load-more" onClick={() => {
          if (visible < shownPieces.length) setVisible((count) => count + 3);
          else setGridMessage('All available originals are shown.');
        }}>Load more</button>
        {gridMessage && <p className="grid-feedback" role="status">{gridMessage}</p>}
      </section>
      {selected && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <div className="art-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={dialogRef}>
             <button className="modal-close" ref={closeRef} type="button" data-testid="button-close-artwork-details" onClick={() => setSelected(null)} aria-label="Close artwork details">×</button>
            <img src={`/images/${selected.image}`} alt={selected.title} />
            <div className="modal-copy">
              <h2 id="modal-title">{selected.title}</h2><p>{selected.size} · Oil on Canvas</p>
               <p>Price on request</p><a data-testid="link-enquire-artwork" href={`mailto:hello@somedaysinmay.com?subject=${encodeURIComponent(`Enquiry about ${selected.title}`)}`}>Enquire about this painting</a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Home;
