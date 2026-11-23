import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";

// Semua halaman pembeli membaca data CMS (dan sesi), jadi dirender di server pada tiap permintaan.
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <a href="#isi" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-ivory focus:px-4 focus:py-2">
        Lewati ke konten
      </a>
      <Header />
      <main id="isi">{children}</main>
      <Footer />
    </CartProvider>
  );
}
