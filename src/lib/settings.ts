import { cache } from "react";
import { db } from "./db";

export type Social = { platform: string; handle: string; url: string };

export type SiteSettings = {
  siteName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroCta: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string; // digit saja, format internasional, mis. 6281234567890
  address: string;
  hours: string;
  socials: Social[];
  shippingFee: number;
  freeShippingMin: number; // 0 = tanpa gratis ongkir
  bankInfo: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "NADA",
  tagline: "Abaya minimalis dengan cerita di baliknya.",
  heroTitle: "Tenang dalam setiap helai.",
  heroSubtitle:
    "Abaya berpotongan rapi untuk keseharian dan hari istimewa, dengan kisah di balik setiap koleksinya.",
  heroImage: "",
  heroCta: "Lihat koleksi",
  contactEmail: "halo@nada.id",
  contactPhone: "+62 812-3456-7890",
  whatsapp: "6281234567890",
  address: "Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan 12120",
  hours: "Senin–Sabtu, 09.00–17.00 WIB",
  socials: [
    { platform: "instagram", handle: "@nada.abaya", url: "https://instagram.com/" },
    { platform: "tiktok", handle: "@nada.abaya", url: "https://tiktok.com/" },
  ],
  shippingFee: 20000,
  freeShippingMin: 0,
  bankInfo: "Bank BCA 123 456 7890 a.n. NADA Abaya",
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const row = await db.siteSetting.findUnique({ where: { key: "main" } });
  if (!row) return DEFAULT_SETTINGS;
  try {
    const saved = JSON.parse(row.value) as Partial<SiteSettings>;
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return DEFAULT_SETTINGS;
  }
});

export function shippingFor(settings: SiteSettings, subtotal: number) {
  if (settings.freeShippingMin > 0 && subtotal >= settings.freeShippingMin) return 0;
  return settings.shippingFee;
}
