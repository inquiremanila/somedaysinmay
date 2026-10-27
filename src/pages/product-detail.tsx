import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArtworkPrice } from '../components/artwork-price';
import { useLocalization } from '../localization/provider';
import ArtworkInquiry from '../components/artwork-inquiry';
import { products, type Product } from '../data/products';
import NotFoundPage from './not-found';

type ProductDetailProps = { id: string; addToCart: (product: Product) => void };

function ProductDetail({ id, addToCart }: ProductDetailProps) {
  const { t } = useLocalization();
  const [, navigate] = useLocation();
  const [inquiryOpen, setInquiryOpen] = useState(() => {
    try { return Boolean(sessionStorage.getItem(`artwork-inquiry-${id}`)); } catch { return false; }
  });
  const product = products.find((item) => item.id === id);
  if (!product) return <NotFoundPage />;
  const canPurchase = product.price !== null && product.availability === 'Available';
  return (
    <main className="artwork-page page-enter">
      <div className="artwork-layout">
        <div className="artwork-image"><img src={product.image} alt={product.description || product.name} />{product.availability === 'Sold' && <span className="sold-label">{t('Sold out')}</span>}</div>
        <div className="artwork-copy">
          <h1>{product.name}</h1>
          <div className="artwork-price"><ArtworkPrice product={product} /></div>
          <button type="button" className="solid-button full-button" aria-expanded={!canPurchase ? inquiryOpen : undefined}
            onClick={() => {
              if (canPurchase) { addToCart(product); navigate('/checkout'); }
              else setInquiryOpen(!inquiryOpen);
            }}>{t(canPurchase ? 'Request to purchase' : 'Request')}</button>
          {canPurchase && <button type="button" className="artwork-inquire-link" aria-expanded={inquiryOpen} onClick={() => setInquiryOpen(!inquiryOpen)}>{t('Inquire about this piece')}</button>}
          {inquiryOpen && <ArtworkInquiry key={product.id} product={product} />}
          <div className="artwork-details">
            <details open>
              <summary>{t('Description')}</summary>
              <div className="artwork-description">
                <strong>{product.name}</strong>
                {product.description && <p>{t(product.description)}</p>}
                <p>{product.size && <>{product.size}<br /></>}{t(product.material || (product.kind === 'Artwork' ? 'Textured acrylic on canvas' : 'Printed on premium paper'))}</p>
              </div>
            </details>
            <details><summary>{t('Shipping')}</summary><p>{t('Shipping and payment details are confirmed by the studio before purchase.')}</p></details>
          </div>
        </div>
      </div>
    </main>
  );
}
export default ProductDetail;
