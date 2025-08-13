import { listAllAuthors } from "@/lib/oneshots";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AuthorsIndex() {
  const authors = await listAllAuthors();

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Authors</h1>
      <div className="flex flex-wrap gap-2">
        {authors.map(a => (
          <a
            key={a}
            href={`/authors/${encodeURIComponent(a)}`}
            className="px-3 py-1 rounded-full border hover:bg-[var(--brand-surface)]"
          >
            {a}
          </a>
        ))}
      </div>
    </main>
  );
}
