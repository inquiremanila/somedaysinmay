import { useState } from 'react';
import { ChevronRight, Minus, Plus } from 'lucide-react';
import { Link } from 'wouter';
import { products } from '../data/products';
import type { Product } from '../data/products';
import NotFoundPage from './not-found';

type ProductDetailProps = {
  id: string;
  addToCart: (product: Product) => void;
};

function ProductDetail({ id, addToCart }: ProductDetailProps) {
  const [added, setAdded] = useState(false);
  const [openSection, setOpenSection] = useState('Description');
  const [activeImage, setActiveImage] = useState(0);
  const product = products.find((item) => item.id === id);

  if (!product) return <NotFoundPage />;

  const detailSections = ['Description', 'Materials', 'Size', 'Shipping', 'Care', 'Authenticity', 'View in a space'];
  const gallery = [product.image, '/images/room-blue.jpg', '/images/room-tide.jpg'];

  return (
    <main className="product-detail page-enter">
      <div className="breadcrumbs">
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <Link href={product.kind === 'Artwork' ? '/artworks' : '/paper-goods'}>
          {product.kind === 'Artwork' ? 'Artworks' : 'Paper Goods'}
        </Link>
        <ChevronRight size={12} />
        <span>{product.name}</span>
      </div>
      <div className="detail-layout">
        <div className="detail-thumbs">
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              aria-label={`View product image ${index + 1}`}
              aria-pressed={activeImage === index}
              onClick={() => setActiveImage(index)}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>
        <div className="detail-image">
          <img src={gallery[activeImage]} alt={`${product.name}, an original textured piece by Somedays in May`} />
        </div>
        <div className="detail-copy">
          <span className="eyebrow">{product.kind === 'Artwork' ? 'Original artwork' : 'Made for little moments'}</span>
          <h1>{product.name}</h1>
          <p className="detail-size">{product.size}</p>
          <p className="detail-material">
            {product.kind === 'Artwork' ? 'Textured acrylic on canvas' : 'Printed on premium paper'}
          </p>
          <p className="availability"><span />{product.availability}</p>
          <p className="detail-price">Price on request</p>
          <button
            className="solid-button full-button"
            onClick={() => { addToCart(product); setAdded(true); }}
          >
            {added ? 'Added to your bag' : 'Add to cart'}
          </button>
          <Link href="/contact" className="outline-button full-button">Inquire about this piece</Link>
          <p className="demo-disclaimer">Demo storefront. Payment and order processing are not connected.</p>
          <div className="detail-accordions">
            {detailSections.map((section) => (
              <div className="detail-row" key={section}>
                <button
                  onClick={() => setOpenSection(openSection === section ? '' : section)}
                  aria-expanded={openSection === section}
                >
                  {section}
                  <span>{openSection === section ? <Minus size={13} /> : <Plus size={13} />}</span>
                </button>
                {openSection === section && (
                  <p>
                    {section === 'Description'
                      ? product.description
                      : section === 'Materials'
                        ? product.kind === 'Artwork'
                          ? 'Textured acrylic on canvas, made by hand in the studio.'
                          : 'Printed on carefully selected, tactile paper stock.'
                        : section === 'Size'
                          ? `${product.size}.`
                          : section === 'Shipping'
                            ? 'Carefully wrapped for its journey. Shipping details will be confirmed before launch.'
                            : section === 'Care'
                              ? 'Keep out of direct sunlight and handle gently with clean, dry hands.'
                              : section === 'Authenticity'
                                ? 'Each original artwork is one of a kind and accompanied by a studio certificate.'
                                : 'Images are for inspiration; colour can vary slightly between screens.'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductDetail;
