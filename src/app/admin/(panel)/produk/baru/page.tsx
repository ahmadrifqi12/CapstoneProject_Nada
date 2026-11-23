import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Tambah produk" };

export default async function NewProductPage() {
  const stories = await db.story.findMany({ select: { id: true, title: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-4xl">Tambah produk</h1>
      <ProductForm
        stories={stories}
        initial={{ name: "", category: "Abaya", price: "", description: "", material: "", featured: false, status: "DRAFT", storyIds: [], colors: [] }}
      />
    </div>
  );
}
