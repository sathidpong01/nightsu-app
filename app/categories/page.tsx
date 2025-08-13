import { listAllCategories } from "@/lib/oneshots";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoriesIndex() {
  const cats = await listAllCategories();

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Categories</h1>
      <div className="flex flex-wrap gap-2">
        {cats.map(c => (
          <a
            key={c}
            href={`/categories/${encodeURIComponent(c)}`}
            className="px-3 py-1 rounded-full border hover:bg-[var(--brand-surface)]"
          >
            {c}
          </a>
        ))}
      </div>
    </main>
  );
}
