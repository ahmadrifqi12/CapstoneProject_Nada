import Link from "next/link";
import { formatDate } from "@/lib/format";

export type StoryCardData = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  publishedAt: Date | null;
};

export function StoryCard({ s }: { s: StoryCardData }) {
  return (
    <article className="group">
      <Link href={`/kisah/${s.slug}`} className="block aspect-[3/2] overflow-hidden rounded-md bg-sand">
        {s.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={s.cover}
            alt=""
            loading="lazy"
            width={1200}
            height={800}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}
      </Link>
      <p className="caps mt-4 text-muted">{formatDate(s.publishedAt)}</p>
      <h3 className="mt-1.5 font-serif text-2xl leading-snug">
        <Link href={`/kisah/${s.slug}`} className="hover:text-deep">{s.title}</Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-[15px] text-muted">{s.excerpt}</p>
    </article>
  );
}
