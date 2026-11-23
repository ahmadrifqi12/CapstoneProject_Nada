import { createHash } from "node:crypto";
import { appUrl } from "./mail";

export const midtransEnabled = () => !!process.env.MIDTRANS_SERVER_KEY;

const base = () =>
  process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com";

/** Membuat transaksi Snap dan mengembalikan URL halaman pembayaran Midtrans. */
export async function createSnapPayment(order: {
  code: string;
  total: number;
  recipient: string;
  phone: string;
  email: string;
}): Promise<string> {
  const key = process.env.MIDTRANS_SERVER_KEY!;
  const res = await fetch(`${base()}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Basic " + Buffer.from(key + ":").toString("base64"),
    },
    body: JSON.stringify({
      transaction_details: { order_id: order.code, gross_amount: order.total },
      customer_details: { first_name: order.recipient, email: order.email, phone: order.phone },
      callbacks: { finish: `${appUrl()}/akun/pesanan/${order.code}` },
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { redirect_url?: string; error_messages?: string[] };
  if (!res.ok || !data.redirect_url) {
    throw new Error(data.error_messages?.join(", ") || "Gagal membuat transaksi pembayaran.");
  }
  return data.redirect_url;
}

/** Signature notifikasi Midtrans: SHA512(order_id + status_code + gross_amount + server_key). */
export function validSignature(n: {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
}) {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key || !n.order_id || !n.status_code || !n.gross_amount || !n.signature_key) return false;
  const expected = createHash("sha512")
    .update(n.order_id + n.status_code + n.gross_amount + key)
    .digest("hex");
  return expected === n.signature_key;
}
