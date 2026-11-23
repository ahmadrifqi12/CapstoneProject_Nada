import type { Metadata } from "next";
import { db } from "@/lib/db";
import { publishedStoryWhere } from "@/lib/catalog";
import { StoryCard } from "@/components/StoryCard";

export const metadata: Metadata = {
  title: "Kisah",
  description: "Cerita dan latar belakang di balik setiap koleksi abaya NADA.",
};

export default async function StoriesPage() {
  const stories = await db.story.findMany({ where: publishedStoryWhere(), orderBy: { publishedAt: "desc" } });
  return (
    <div className="wrap pt-10">
      <header className="max-w-2xl">
        <p className="caps text-deep">Kisah</p>
        <h1 className="mt-2 text-5xl">Cerita di balik setiap helai</h1>
        <p className="mt-4 text-muted">Tentang bahan, warna, dan alasan di balik setiap koleksi NADA.</p>
      </header>
      {stories.length === 0 ? (
        <p className="mt-16 text-center text-muted">Kisah pertama kami segera terbit.</p>
      ) : (
        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((s) => <StoryCard key={s.id} s={s} />)}
        </div>
      )}
    </div>
  );
}
