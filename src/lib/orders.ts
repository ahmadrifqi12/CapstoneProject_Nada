import type { Prisma } from "@prisma/client";
import { db } from "./db";

type Tx = Prisma.TransactionClient;

/** Mengembalikan stok semua item pesanan (dipakai saat pesanan dibatalkan). */
export async function restockOrder(tx: Tx, orderId: number) {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const it of items) {
    if (it.variantId) {
      await tx.productVariant.update({
        where: { id: it.variantId },
        data: { stock: { increment: it.qty } },
      });
    }
  }
}

/** Membatalkan pesanan sekali saja dan mengembalikan stok. Aman dipanggil berulang. */
export async function cancelOrder(orderId: number, onlyIfPending = false) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || order.status === "CANCELLED") return false;
    if (onlyIfPending && order.status !== "PENDING") return false;
    await restockOrder(tx, orderId);
    await tx.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
    return true;
  });
}

export function newOrderCode() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Array.from({ length: 4 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
  return `NADA-${ymd}-${rand}`;
}
