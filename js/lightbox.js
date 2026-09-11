import { formatCOP } from './format.js';
import { buildWhatsAppLink } from './whatsapp.js';

const $ = (id) => document.getElementById(id);

export function openLightbox(item, whatsappNumber) {
  $('lightboxPhoto').src = item.image;
  $('lightboxPhoto').alt = `${item.category} ${formatCOP(item.price)}`;
  $('lightboxPrice').textContent = formatCOP(item.price);
  $('lightboxWhatsapp').href = buildWhatsAppLink(whatsappNumber, item);
  $('lightboxOverlay').hidden = false;
}

export function closeLightbox() {
  $('lightboxOverlay').hidden = true;
}

export function initLightbox() {
  $('lightboxOverlay').addEventListener('click', closeLightbox);
  $('lightboxWhatsapp').addEventListener('click', (e) => e.stopPropagation());
}
