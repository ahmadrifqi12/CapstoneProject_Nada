import type { Metadata } from "next";
import { ResetForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Atur ulang kata sandi", robots: { index: false } };

export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <div className="wrap max-w-md pt-14">
      <h1 className="text-5xl">Kata sandi baru</h1>
      <div className="card mt-8 p-6"><ResetForm token={token} /></div>
    </div>
  );
}
