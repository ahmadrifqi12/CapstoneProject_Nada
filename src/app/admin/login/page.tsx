import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminLoginForm } from "@/components/AuthForms";

export const metadata = { title: "Masuk" };

export default async function AdminLoginPage() {
  const u = await getCurrentUser();
  if (u?.role === "ADMIN") redirect("/admin");
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <p className="text-center font-serif text-4xl tracking-[0.16em]">NADA</p>
        <p className="caps mt-2 text-center text-muted">Panel admin</p>
        <div className="card mt-8 p-6"><AdminLoginForm /></div>
      </div>
    </div>
  );
}
