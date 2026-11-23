import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "nada_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  sub: string;
  role: "BUYER" | "ADMIN";
  name: string;
};

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET belum diatur (minimal 32 karakter acak).");
    }
    return new TextEncoder().encode("dev-only-secret-do-not-use-in-production");
  }
  return new TextEncoder().encode(s);
}

export async function signSession(p: SessionPayload) {
  return new SignJWT({ role: p.role, name: p.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(secret());
}

export async function verifySession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    const role = payload.role === "ADMIN" ? "ADMIN" : "BUYER";
    return { sub: payload.sub, role, name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}
