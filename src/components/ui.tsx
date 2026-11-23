"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/actions/auth";

/**
 * Mengirim formulir ke server action tanpa mekanisme "reset otomatis" milik React 19
 * (yang akan mengosongkan formulir panjang saat terjadi galat atau setelah simpan).
 */
export function useFormAction(action: (s: FormState, fd: FormData) => Promise<FormState>) {
  const [state, run, pending] = useActionState(action, undefined);
  const [, start] = useTransition();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const fd = new FormData(e.currentTarget, submitter);
    start(() => run(fd));
  };
  return { state, onSubmit, pending };
}

export function SubmitButton({
  children,
  pendingText = "Memproses…",
  className = "btn-primary",
  name,
  value,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={name} value={value} disabled={pending} className={className} aria-busy={pending}>
      {pending ? pendingText : children}
    </button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state?.error && !state?.ok) return null;
  const err = !!state.error;
  return (
    <p
      role={err ? "alert" : "status"}
      className={`rounded-md border px-3.5 py-2.5 text-sm ${
        err ? "border-clay bg-clay/15 text-ink" : "border-sage bg-sage/30 text-ink"
      }`}
    >
      {state.error ?? state.ok}
    </p>
  );
}
