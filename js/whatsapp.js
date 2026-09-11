import { formatCOP } from './format.js';

export function buildWhatsAppLink(number, item) {
  const message = `Hola, quiero pedir esta prenda: ${item.category} - ${formatCOP(item.price)}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
