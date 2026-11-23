import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { StoryForm } from "@/components/admin/StoryForm";

export const metadata = { title: "Ubah kisah" };

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [s, products] = await Promise.all([
    db.story.findUnique({ where: { id }, include: { products: { select: { id: true } } } }),
    db.product.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!s) notFound();
  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-4xl">Ubah kisah</h1>
      <StoryForm
        products={products}
        initial={{
          id: s.id,
          title: s.title,
          slug: s.slug,
          excerpt: s.excerpt,
          cover: s.cover,
          body: s.body,
          status: s.status,
          productIds: s.products.map((p) => p.id),
        }}
      />
    </div>
  );
}
