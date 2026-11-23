import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { SocialIcon } from "./Icons";

export async function Footer() {
  const s = await getSettings();
  return (
    <footer className="mt-24 bg-sand">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <p className="font-serif text-3xl tracking-[0.16em]">NADA</p>
          <p className="mt-3 max-w-xs text-sm text-muted">{s.tagline}</p>
        </div>
        <nav aria-label="Jelajahi">
          <p className="caps mb-3 text-muted">Jelajahi</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop" className="hover:text-deep">Shop</Link></li>
            <li><Link href="/kisah" className="hover:text-deep">Kisah</Link></li>
            <li><Link href="/contact" className="hover:text-deep">Contact</Link></li>
            <li><Link href="/akun" className="hover:text-deep">Akun &amp; pesanan</Link></li>
          </ul>
        </nav>
        <div>
          <p className="caps mb-3 text-muted">Hubungi kami</p>
          <ul className="space-y-2 text-sm text-ink">
            {s.address && <li>{s.address}</li>}
            {s.hours && <li>{s.hours}</li>}
            {s.contactEmail && (
              <li><a className="hover:text-deep" href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a></li>
            )}
          </ul>
        </div>
        <div>
          <p className="caps mb-3 text-muted">Ikuti kami</p>
          <ul className="space-y-2 text-sm">
            {s.socials.map((so) => (
              <li key={so.url + so.handle}>
                <a href={so.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-deep">
                  <SocialIcon platform={so.platform} width={18} height={18} />
                  <span className="capitalize">{so.platform}</span>
                  <span className="text-muted">{so.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-stone/30">
        <p className="wrap py-5 text-xs text-muted">© {new Date().getFullYear()} NADA. Semua hak dilindungi.</p>
      </div>
    </footer>
  );
}
