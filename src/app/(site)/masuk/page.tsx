import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/format";
import { LoginForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Masuk", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const { next, reset } = await searchParams;
  const target = safeNext(next);
  if (await getCurrentUser()) redirect(target);
  return (
    <div className="wrap max-w-md pt-14">
      <h1 className="text-5xl">Masuk</h1>
      <p className="mt-2 text-muted">Masuk untuk checkout dan melihat riwayat pesananmu.</p>
      {reset && <p role="status" className="mt-6 rounded-md border border-sage bg-sage/30 px-4 py-3 text-sm">Kata sandi diperbarui. Silakan masuk dengan kata sandi baru.</p>}
      <div className="card mt-8 p-6">
        <LoginForm next={target} />
      </div>
      <p className="mt-6 text-sm text-muted">
        Belum punya akun? <Link href={`/daftar?next=${encodeURIComponent(target)}`} className="link">Daftar</Link>
      </p>
    </div>
  );
}
