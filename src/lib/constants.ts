export const SIZES = ["S", "M", "L"] as const;

export const CATEGORIES = ["Abaya", "Hijab", "Set", "Aksesori"] as const;

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DONE",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_LABEL: Record<string, string> = {
  PENDING: "Menunggu pembayaran",
  PAID: "Dibayar",
  PROCESSING: "Diproses",
  SHIPPED: "Dikirim",
  DONE: "Selesai",
  CANCELLED: "Dibatalkan",
};

export const PRODUCT_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draf",
  ACTIVE: "Aktif",
  ARCHIVED: "Diarsipkan",
};

export const LOW_STOCK = 3;

export const NAV = [
  { href: "/", label: "Beranda" },
  { href: "/shop", label: "Shop" },
  { href: "/kisah", label: "Kisah" },
  { href: "/contact", label: "Contact" },
];
