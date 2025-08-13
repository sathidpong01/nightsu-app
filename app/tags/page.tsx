import { listAllGenres } from "@/lib/oneshots";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TagsIndex() {
  const tags = await listAllGenres();

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">All Tags</h1>
      <div className="flex flex-wrap gap-2">
        {tags.map(t => (
          <a
            key={t}
            href={`/tags/${encodeURIComponent(t)}`}
            className="px-3 py-1 rounded-full border hover:bg-[var(--brand-surface)]"
          >
            #{t}
          </a>
        ))}
      </div>
    </main>
  );
}
