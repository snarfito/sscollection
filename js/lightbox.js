import { formatCOP } from './format.js';
import { buildWhatsAppLink } from './whatsapp.js';
import { toast } from './toast.js';

const $ = (id) => document.getElementById(id);

function itemUrl(item) {
  return `${location.origin}${location.pathname}?item=${encodeURIComponent(item.id)}`;
}

async function shareItem(item) {
  const url = itemUrl(item);
  if (navigator.share) {
    try {
      await navigator.share({ title: 'S&S Collection', text: `Mira esta prenda: ${item.category}`, url });
    } catch {
      // user cancelled the share sheet — nothing to do
    }
    return;
  }
  await navigator.clipboard.writeText(url);
  toast('Link copiado');
}

export function openLightbox(item, whatsappNumber) {
  const url = itemUrl(item);
  $('lightboxPhoto').src = item.image;
  $('lightboxPhoto').alt = `${item.category} ${formatCOP(item.price)}`;
  $('lightboxPrice').textContent = formatCOP(item.price);
  $('lightboxWhatsapp').href = buildWhatsAppLink(whatsappNumber, item, url);
  $('lightboxShare').onclick = (e) => {
    e.stopPropagation();
    shareItem(item);
  };
  $('lightboxOverlay').hidden = false;
  history.replaceState(null, '', url);
}

export function closeLightbox() {
  $('lightboxOverlay').hidden = true;
  history.replaceState(null, '', location.pathname);
}

export function initLightbox() {
  $('lightboxOverlay').addEventListener('click', closeLightbox);
  $('lightboxWhatsapp').addEventListener('click', (e) => e.stopPropagation());
}
