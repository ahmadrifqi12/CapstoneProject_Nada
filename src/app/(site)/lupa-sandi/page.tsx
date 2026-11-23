import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Lupa kata sandi", robots: { index: false } };

export default function ForgotPage() {
  return (
    <div className="wrap max-w-md pt-14">
      <h1 className="text-5xl">Lupa kata sandi</h1>
      <p className="mt-2 text-muted">Masukkan email akunmu. Kami kirimkan tautan untuk mengatur ulang kata sandi.</p>
      <div className="card mt-8 p-6"><ForgotForm /></div>
      <p className="mt-6 text-sm"><Link href="/masuk" className="link">← Kembali ke halaman masuk</Link></p>
    </div>
  );
}
