"use client";

import { useActionState } from "react";
import { sendMessage } from "@/actions/shop";
import { FormMessage, SubmitButton } from "./ui";

export function ContactForm() {
  const [state, action] = useActionState(sendMessage, undefined);
  return (
    <form action={action} className="space-y-4" noValidate={false}>
      <div>
        <label htmlFor="c-name" className="field-label">Nama</label>
        <input id="c-name" name="name" defaultValue={state?.values?.name} required minLength={2} maxLength={80} autoComplete="name" className="input" />
      </div>
      <div>
        <label htmlFor="c-email" className="field-label">Email</label>
        <input id="c-email" name="email" type="email" defaultValue={state?.values?.email} required autoComplete="email" className="input" />
      </div>
      <div>
        <label htmlFor="c-body" className="field-label">Pesan</label>
        <textarea id="c-body" name="body" defaultValue={state?.values?.body} required minLength={10} maxLength={2000} rows={6} className="input" placeholder="Tulis pertanyaan tentang ukuran, bahan, atau pesananmu…" />
      </div>
      {/* Kolom jebakan spam: tersembunyi dari manusia, sering diisi bot. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingText="Mengirim…">Kirim pesan</SubmitButton>
    </form>
  );
}
