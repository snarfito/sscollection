import { formatCOP } from '../../js/format.js';

function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export function injectOgTags(html, item, url) {
  const title = escapeAttr(`${item.category} - ${formatCOP(item.price)} | S&S Collection`);
  const description = 'Pídelo por WhatsApp en S&S Collection';
  const tags = [
    `<meta property="og:type" content="product">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:image" content="${escapeAttr(item.image)}">`,
    `<meta property="og:url" content="${escapeAttr(url)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ].join('\n');
  return html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace('</head>', `${tags}\n</head>`);
}
