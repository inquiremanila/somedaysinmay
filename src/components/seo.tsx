import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { pageSeo } from '../lib/seo';

export default function Seo() {
  const [path] = useLocation();
  useEffect(() => {
    const seo = pageSeo(path);
    document.title = seo.title;
    function meta(attribute: 'name' | 'property', key: string, content: string) {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, key); document.head.append(element); }
      element.content = content;
    }
    meta('name', 'description', seo.description);
    meta('name', 'robots', seo.indexable ? 'index, follow' : 'noindex, follow');
    for (const [key, value] of Object.entries({ title: seo.title, description: seo.description, url: seo.url, image: seo.image, type: 'website', site_name: 'Somedays in May' })) meta('property', `og:${key}`, value);
    for (const [key, value] of Object.entries({ card: 'summary_large_image', title: seo.title, description: seo.description, image: seo.image })) meta('name', `twitter:${key}`, value);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
    canonical.href = seo.url;
    let schema = document.getElementById('site-schema');
    if (!schema) { schema = document.createElement('script'); schema.id = 'site-schema'; schema.setAttribute('type', 'application/ld+json'); document.head.append(schema); }
    schema.textContent = JSON.stringify(seo.structuredData);
  }, [path]);
  return null;
}
