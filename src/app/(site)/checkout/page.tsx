import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const [user, s] = await Promise.all([requireUser("/checkout"), getSettings()]);
  return (
    <div className="wrap pt-10">
      <h1 className="text-5xl">Checkout</h1>
      <CheckoutForm defaultName={user.name} shippingFee={s.shippingFee} freeShippingMin={s.freeShippingMin} />
    </div>
  );
}
