import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { productInclude } from "@/lib/catalog";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Ubah produk" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [p, stories] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { ...productInclude, stories: { select: { id: true } } } }),
    db.story.findMany({ select: { id: true, title: true }, orderBy: { createdAt: "desc" } }),
  ]);
  if (!p) notFound();

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-4xl">Ubah produk</h1>
      <ProductForm
        stories={stories}
        initial={{
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          description: p.description,
          material: p.material,
          featured: p.featured,
          status: p.status,
          storyIds: p.stories.map((s) => s.id),
          colors: p.colors.map((c) => ({
            id: c.id,
            name: c.name,
            hex: c.hex,
            images: c.images.map((i) => i.url),
            stocks: Object.fromEntries(c.variants.map((v) => [v.size, v.stock])),
          })),
        }}
      />
    </div>
  );
}
