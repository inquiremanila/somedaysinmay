import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
const bundle = await build({ entryPoints: ['src/lib/seo.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
const { SITE_URL, publicPaths, pageSeo, biography } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const template = await readFile('dist/public/index.html', 'utf8');
const products = publicPaths.filter((p) => p.startsWith('/product/')).map((p) => pageSeo(p).product);
for (const path of [...publicPaths, '/about']) {
  const seo = pageSeo(path);
  const head = `<title>${escape(seo.title)}</title>
<meta name="description" content="${escape(seo.description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${escape(seo.url)}">
${Object.entries({ title: seo.title, description: seo.description, url: seo.url, image: seo.image, type: 'website', site_name: 'Somedays in May' }).map(([key, value]) => `<meta property="og:${key}" content="${escape(value)}">`).join('\n')}
${Object.entries({ card: 'summary_large_image', title: seo.title, description: seo.description, image: seo.image }).map(([key, value]) => `<meta name="twitter:${key}" content="${escape(value)}">`).join('\n')}
<script id="site-schema" type="application/ld+json">${JSON.stringify(seo.structuredData).replace(/</g, '\\u003c')}</script>`;
  let content;
  if (seo.product) {
    const p = seo.product;
    content = `<main><h1>${escape(p.name)}</h1><img src="${p.image}" alt="${escape(p.description)}" style="max-width:100%;max-height:650px"><p>${escape(p.description)}</p><p>${escape(p.size)} · ${escape(p.material)}</p><p>${p.availability === 'Sold' ? 'Sold out' : p.price !== null ? `USD ${p.price}` : 'Price on request'}</p><a href="/contact">Inquire about this artwork</a></main>`;
  } else if (path === '/' || path === '/artworks') {
    content = `<main class="gallery-grid">${products.map((p) => `<article class="gallery-card"><a href="/product/${p.id}"><img src="${p.image}" alt="${escape(p.description)}" style="width:100%;height:200px;object-fit:contain"><p>${escape(p.name)}</p></a><p>${p.availability === 'Sold' ? 'Sold out' : p.price !== null ? `USD ${p.price}` : 'Price on request'}</p></article>`).join('')}</main>`;
  } else {
    content = `<main class="studio-contact"><h1>${path === '/contact' ? 'Contact' : 'Somedays in May'}</h1><p>${escape(path === '/contact' ? seo.description : biography[0])}</p>${path === '/contact' ? '<a href="mailto:inquire@somedaysinmay.com">inquire@somedaysinmay.com</a>' : `${biography.slice(1).map((paragraph) => `<p>${escape(paragraph)}</p>`).join('')}<img src="/images/artist-portrait.png" alt="Portrait of the artist behind Somedays in May" style="max-width:100%;max-height:650px">`}</main>`;
  }
  const nav = '<nav aria-label="Main navigation"><a href="/">Somedays in May</a> · <a href="/artworks">Artworks</a> · <a href="/biography">Biography</a> · <a href="/contact">Contact</a></nav>';
  const html = template.replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta\s+(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/g, '').replace(/<link rel="canonical"[^>]*>/, '').replace('</head>', `${head}\n</head>`).replace('<div id="root"></div>', `<div id="root">${nav}${content}</div>`);
  const destination = path === '/' ? 'dist/public/index.html' : join('dist/public', path.slice(1), 'index.html');
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html);
}
await writeFile('dist/public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publicPaths.map((p) => `<url><loc>${SITE_URL}${p}</loc></url>`).join('')}</urlset>\n`);
await writeFile('dist/public/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log(`Generated searchable HTML for ${publicPaths.length + 1} routes, sitemap.xml and robots.txt.`);
