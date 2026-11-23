"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkPassword, endSession, hashPassword, startSession } from "@/lib/auth";
import { clientIp, hit, reset } from "@/lib/ratelimit";
import { appUrl, sendMail } from "@/lib/mail";
import { safeNext } from "@/lib/format";
import { values } from "@/lib/form";

export type FormState = { error?: string; ok?: string; values?: Record<string, string> } | undefined;

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(80),
  email: z.string().trim().toLowerCase().email("Format email tidak valid."),
  password: z.string().min(8, "Kata sandi minimal 8 karakter.").max(100),
});

export async function register(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: fd.get("name"),
    email: fd.get("email"),
    password: fd.get("password"),
  });
  const keep = values(fd, ["name", "email"]);
  if (!parsed.success) return { error: parsed.error.issues[0].message, values: keep };

  const ip = await clientIp();
  if (!hit(`register:${ip}`, 10, 60 * 60 * 1000).ok) {
    return { error: "Terlalu banyak percobaan. Coba lagi nanti.", values: keep };
  }

  const { name, email, password } = parsed.data;
  if (await db.user.findUnique({ where: { email } })) {
    return { error: "Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.", values: keep };
  }
  const user = await db.user.create({
    data: { name, email, passwordHash: await hashPassword(password), role: "BUYER" },
  });
  await startSession(user);
  redirect(safeNext(fd.get("next")));
}

async function doLogin(fd: FormData, role: "BUYER" | "ADMIN"): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "Isi email dan kata sandi." };

  // Pembatasan percobaan login: 5 kali per 15 menit untuk kombinasi IP + email.
  const key = `login:${role}:${await clientIp()}:${email}`;
  const limit = hit(key, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return { error: `Terlalu banyak percobaan. Coba lagi sekitar ${limit.retryAfterMin} menit lagi.` };
  }

  const user = await db.user.findUnique({ where: { email } });
  // Selalu jalankan bcrypt agar waktu respons tidak membocorkan apakah email terdaftar.
  const ok = await checkPassword(
    password,
    user?.passwordHash ?? "$2b$11$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin",
  );
  if (!user || !ok) return { error: "Email atau kata sandi salah." };
  if (user.role !== role) {
    return {
      error:
        role === "ADMIN"
          ? "Akun ini bukan akun admin."
          : "Akun admin masuk lewat halaman /admin/login.",
    };
  }
  reset(key);
  await startSession(user);
  return undefined;
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const err = await doLogin(fd, "BUYER");
  if (err) return { ...err, values: values(fd, ["email"]) };
  redirect(safeNext(fd.get("next")));
}

export async function adminLogin(_: FormState, fd: FormData): Promise<FormState> {
  const err = await doLogin(fd, "ADMIN");
  if (err) return { ...err, values: values(fd, ["email"]) };
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/");
}

export async function forgotPassword(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!z.string().email().safeParse(email).success) return { error: "Format email tidak valid." };
  if (!hit(`forgot:${await clientIp()}`, 5, 60 * 60 * 1000).ok) {
    return { error: "Terlalu banyak permintaan. Coba lagi nanti." };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (user && user.role === "BUYER") {
    const token = randomBytes(32).toString("hex");
    await db.user.update({
      where: { id: user.id },
      data: { resetTokenHash: sha(token), resetExpires: new Date(Date.now() + 60 * 60 * 1000) },
    });
    await sendMail(
      email,
      "Atur ulang kata sandi NADA",
      `Halo ${user.name},\n\nKlik tautan berikut untuk mengatur ulang kata sandi Anda (berlaku 1 jam):\n${appUrl()}/reset-sandi/${token}\n\nAbaikan email ini bila Anda tidak memintanya.\n\n— NADA`,
    );
  }
  // Pesan sama baik email terdaftar maupun tidak, agar daftar akun tidak bocor.
  return { ok: "Jika email terdaftar, tautan pengaturan ulang kata sandi sudah dikirim. Periksa kotak masuk Anda." };
}

export async function resetPassword(token: string, _: FormState, fd: FormData): Promise<FormState> {
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { error: "Kata sandi minimal 8 karakter." };
  if (password !== String(fd.get("confirm") ?? "")) return { error: "Konfirmasi kata sandi tidak sama." };

  const user = await db.user.findFirst({
    where: { resetTokenHash: sha(token), resetExpires: { gt: new Date() } },
  });
  if (!user) return { error: "Tautan tidak valid atau sudah kedaluwarsa. Minta tautan baru." };

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(password), resetTokenHash: null, resetExpires: null },
  });
  redirect("/masuk?reset=1");
}
