import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/format";
import { RegisterForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Daftar", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const target = safeNext((await searchParams).next);
  if (await getCurrentUser()) redirect(target);
  return (
    <div className="wrap max-w-md pt-14">
      <h1 className="text-5xl">Buat akun</h1>
      <p className="mt-2 text-muted">Cukup nama, email, dan kata sandi.</p>
      <div className="card mt-8 p-6">
        <RegisterForm next={target} />
      </div>
      <p className="mt-6 text-sm text-muted">
        Sudah punya akun? <Link href={`/masuk?next=${encodeURIComponent(target)}`} className="link">Masuk</Link>
      </p>
    </div>
  );
}
