import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validSignature } from "@/lib/midtrans";
import { cancelOrder } from "@/lib/orders";

// Webhook Midtrans: daftarkan https://DOMAIN-ANDA/api/payment/notification
// di Midtrans Dashboard → Settings → Payment → Notification URL.
export async function POST(req: Request) {
  const n = await req.json().catch(() => null);
  if (!n || !validSignature(n)) {
    return NextResponse.json({ error: "Signature tidak valid" }, { status: 403 });
  }
  const order = await db.order.findUnique({ where: { code: String(n.order_id) } });
  if (!order) return NextResponse.json({ ok: true });

  const status = String(n.transaction_status);
  const fraud = String(n.fraud_status ?? "accept");
  const paid = status === "settlement" || (status === "capture" && fraud === "accept");
  const failed = ["cancel", "deny", "expire"].includes(status);

  if (paid && order.status === "PENDING") {
    await db.order.update({ where: { id: order.id }, data: { status: "PAID" } });
  } else if (failed) {
    await cancelOrder(order.id, true);
  }
  return NextResponse.json({ ok: true });
}
