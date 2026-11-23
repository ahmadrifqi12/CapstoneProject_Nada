import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { ContactForm } from "@/components/ContactForm";
import { SocialIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Contact",
  description: "Hubungi NADA untuk pertanyaan seputar ukuran, bahan, dan pesanan.",
};

export default async function ContactPage() {
  const s = await getSettings();
  const wa = s.whatsapp ? `https://wa.me/${s.whatsapp}?text=${encodeURIComponent("Halo NADA, saya ingin bertanya…")}` : "";
  return (
    <div className="wrap pt-10">
      <header className="max-w-2xl">
        <p className="caps text-deep">Contact</p>
        <h1 className="mt-2 text-5xl">Ada yang ingin ditanyakan?</h1>
        <p className="mt-4 text-muted">Tulis pesan, atau sapa kami langsung lewat WhatsApp. Kami membalas pada jam layanan.</p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="card p-6 sm:p-8">
          <h2 className="mb-5 text-3xl">Kirim pesan</h2>
          <ContactForm />
        </div>

        <aside className="space-y-8">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary w-full sm:w-auto">
              <SocialIcon platform="whatsapp" width={18} height={18} /> Chat lewat WhatsApp
            </a>
          )}
          <dl className="space-y-6 text-[15px]">
            {s.address && (<div><dt className="caps text-muted">Alamat</dt><dd className="mt-1.5">{s.address}</dd></div>)}
            {s.hours && (<div><dt className="caps text-muted">Jam layanan</dt><dd className="mt-1.5">{s.hours}</dd></div>)}
            {s.contactEmail && (<div><dt className="caps text-muted">Email</dt><dd className="mt-1.5"><a className="link" href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a></dd></div>)}
            {s.contactPhone && (<div><dt className="caps text-muted">Telepon</dt><dd className="mt-1.5">{s.contactPhone}</dd></div>)}
          </dl>
          {s.socials.length > 0 && (
            <div>
              <p className="caps mb-3 text-muted">Media sosial</p>
              <ul className="flex flex-wrap gap-2">
                {s.socials.map((so) => (
                  <li key={so.url + so.handle}>
                    <a href={so.url} target="_blank" rel="noopener noreferrer" aria-label={`${so.platform} ${so.handle}`} className="grid size-11 place-items-center rounded-full border border-stone/50 text-deep transition-colors duration-200 hover:bg-deep hover:text-white">
                      <SocialIcon platform={so.platform} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
