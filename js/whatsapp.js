import { formatCOP } from './format.js';

export function buildWhatsAppLink(number, item, url) {
  const message = `Hola, quiero pedir esta prenda: ${item.category} - ${formatCOP(item.price)}\n${url}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
