import { getSettings } from "@/lib/settings";
import { midtransEnabled } from "@/lib/midtrans";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Pengaturan situs" };

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl">Pengaturan situs</h1>
      <p className="mt-2 text-sm text-muted">
        Pembayaran online (Midtrans): <strong className="font-medium">{midtransEnabled() ? "aktif" : "belum aktif — pembeli memakai transfer manual + konfirmasi WhatsApp"}</strong>
      </p>
      <div className="mt-6"><SettingsForm initial={s} /></div>
    </div>
  );
}
