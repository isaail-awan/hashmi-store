interface OrderForWhatsApp {
  id: number | string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  items: { name: string; quantity: number; price: number }[];
  delivery_slot?: string;
}

// Store's own WhatsApp business number — set this once you have it.
// Falls back to NEXT_PUBLIC_STORE_WHATSAPP env var so it's easy to change.
const STORE_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "";

export function buildWhatsAppOrderLink(order: OrderForWhatsApp) {
  const lines = [
    `Naya Order — #${order.id}`,
    `Naam: ${order.customer_name}`,
    `Phone: ${order.customer_phone}`,
    `Address: ${order.customer_address}`,
    order.delivery_slot ? `Delivery Time: ${order.delivery_slot}` : "",
    "",
    "Items:",
    ...order.items.map((i) => `• ${i.quantity}x ${i.name} — Rs. ${i.price * i.quantity}`),
    "",
    `Total: Rs. ${order.total_amount}`,
  ].filter(Boolean);
  const text = encodeURIComponent(lines.join("\n"));
  const number = STORE_WHATSAPP_NUMBER.replace(/[^0-9]/g, "");
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
}
