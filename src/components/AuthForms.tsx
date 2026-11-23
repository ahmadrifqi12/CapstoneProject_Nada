"use client";

import Link from "next/link";
import { useActionState } from "react";
import { adminLogin, forgotPassword, login, register, resetPassword } from "@/actions/auth";
import { FormMessage, SubmitButton } from "./ui";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? "/"} />
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input id="email" name="email" type="email" defaultValue={state?.values?.email} required autoComplete="email" className="input" />
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className="field-label">Kata sandi</label>
          <Link href="/lupa-sandi" className="link mb-1.5 text-sm">Lupa kata sandi?</Link>
        </div>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary w-full" pendingText="Masuk…">Masuk</SubmitButton>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action] = useActionState(register, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? "/"} />
      <div>
        <label htmlFor="name" className="field-label">Nama lengkap</label>
        <input id="name" name="name" defaultValue={state?.values?.name} required minLength={2} autoComplete="name" className="input" />
      </div>
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input id="email" name="email" type="email" defaultValue={state?.values?.email} required autoComplete="email" className="input" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Kata sandi</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" aria-describedby="pw-hint" className="input" />
        <p id="pw-hint" className="mt-1.5 text-xs text-muted">Minimal 8 karakter.</p>
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary w-full" pendingText="Mendaftar…">Buat akun</SubmitButton>
    </form>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(forgotPassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="field-label">Email akun</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary w-full" pendingText="Mengirim…">Kirim tautan</SubmitButton>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword.bind(null, token), undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="password" className="field-label">Kata sandi baru</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" />
      </div>
      <div>
        <label htmlFor="confirm" className="field-label">Ulangi kata sandi</label>
        <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="input" />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary w-full">Simpan kata sandi</SubmitButton>
    </form>
  );
}

export function AdminLoginForm() {
  const [state, action] = useActionState(adminLogin, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="field-label">Email admin</label>
        <input id="email" name="email" type="email" defaultValue={state?.values?.email} required autoComplete="username" className="input" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Kata sandi</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="btn-primary w-full" pendingText="Masuk…">Masuk ke panel</SubmitButton>
    </form>
  );
}
