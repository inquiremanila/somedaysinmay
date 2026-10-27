export { biography } from '../data/biography';
import { products } from '../data/products';

// Keep this aligned with the public production domain before deployment.
export const SITE_URL = 'https://somedaysinmay.com';
export const studioDescription = 'Original textured art and abstract paintings from an independent Philippine studio. Artwork inquiries for collectors in Europe, America and Australia.';
export const publicPaths = ['/', '/artworks', '/biography', '/contact', ...products.map((p) => `/product/${p.id}`)];
export function pageSeo(path: string) {
  const product = products.find((p) => path === `/product/${p.id}`);
  const canonicalPath = path === '/about' ? '/biography' : path;
  const indexable = publicPaths.includes(canonicalPath);
  const title = product ? `${product.name} — Original Textured Painting | Somedays in May`
    : path === '/biography' || path === '/about' ? 'About the Studio | Somedays in May'
    : path === '/contact' ? 'Artwork & Commission Inquiries | Somedays in May'
    : 'Original Textured Art & Abstract Paintings | Somedays in May';
  const description = product ? `${product.description} ${product.availability === 'Sold' ? 'Sold artwork from the studio archive.' : 'Contact the studio about availability and collecting this original artwork.'}`
    : path === '/contact' ? 'Inquire about original textured paintings and commissions. Collectors in Europe, America, Australia and the Philippines are welcome to contact Somedays in May.'
    : path === '/biography' || path === '/about' ? 'Meet Somedays in May, an independent art studio in the Philippines exploring different mediums, techniques and artistic styles.' : studioDescription;
  const url = `${SITE_URL}${canonicalPath}`;
  const image = `${SITE_URL}${product?.image || '/images/swirls.jpg'}`;
  const studio = { '@type': 'Organization', '@id': `${SITE_URL}/#studio`, name: 'Somedays in May', url: SITE_URL, description: studioDescription, address: { '@type': 'PostalAddress', addressCountry: 'PH' } };
  const artwork = product && { '@type': 'VisualArtwork', '@id': `${url}#artwork`, name: product.name, description: product.description, image, url, artform: 'Painting', artMedium: product.material, artworkSurface: 'Canvas', creator: { '@id': `${SITE_URL}/#studio` }, isPartOf: { '@type': 'CreativeWorkSeries', name: product.collection } };
  return { title, description, url, image, indexable, product, structuredData: { '@context': 'https://schema.org', '@graph': [studio, { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'Somedays in May', url: SITE_URL, inLanguage: 'en' }, ...(artwork ? [artwork] : [])] } };
}
