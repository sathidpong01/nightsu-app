import { searchByCategory } from "@/lib/oneshots";
import OneshotCard from "@/components/OneshotCard";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoryPage({ params }: { params: { cat: string } }) {
  const cat = decodeURIComponent(params.cat);
  const items = await searchByCategory(cat, 60);

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Category: {cat}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((it) => (
          <OneshotCard key={it.id} item={it} />
        ))}
      </div>
    </main>
  );
}
