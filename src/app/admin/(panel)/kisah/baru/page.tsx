import { db } from "@/lib/db";
import { StoryForm } from "@/components/admin/StoryForm";

export const metadata = { title: "Tulis kisah" };

export default async function NewStoryPage() {
  const products = await db.product.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-4xl">Tulis kisah</h1>
      <StoryForm products={products} initial={{ title: "", slug: "", excerpt: "", cover: "", body: "", status: "DRAFT", productIds: [] }} />
    </div>
  );
}
