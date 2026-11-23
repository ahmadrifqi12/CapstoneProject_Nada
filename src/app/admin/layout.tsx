import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Panel Admin", template: "%s — Admin NADA" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
