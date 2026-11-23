import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { UserIcon } from "./Icons";
import { SearchBar } from "./SearchBar";
import { CartLink } from "./CartLink";
import { MobileNav } from "./MobileNav";
import { NAV } from "@/lib/constants";

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-sand bg-ivory">
      <div className="wrap flex h-full items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <MobileNav userName={user?.name ?? null} />
          <Link href="/" className="font-serif text-[1.7rem] font-medium tracking-[0.16em]" aria-label="NADA — Beranda">
            NADA
          </Link>
        </div>

        <nav aria-label="Menu utama" className="hidden items-center gap-9 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="caps text-ink transition-colors hover:text-deep">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center">
          <SearchBar />
          <CartLink />
          <Link
            href={user ? "/akun" : "/masuk"}
            aria-label={user ? `Akun ${user.name}` : "Masuk"}
            className="grid size-11 place-items-center rounded-md hover:bg-sand"
          >
            <UserIcon />
          </Link>
        </div>
      </div>
    </header>
  );
}
