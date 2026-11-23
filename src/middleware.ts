import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifySession } from "@/lib/jwt";

// Lapisan pertama: pengalihan cepat. Pemeriksaan peran yang sebenarnya diulang di server
// pada setiap halaman, action, dan rute API (lihat requireAdmin / assertAdmin).
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const session = await verifySession(req.cookies.get(COOKIE)?.value);

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const url = new URL("/masuk", req.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/checkout", "/akun/:path*"],
};
