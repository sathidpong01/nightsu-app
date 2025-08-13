import { searchOneshots } from "@/lib/oneshots";
import OneshotCard from "@/components/OneshotCard";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);
  const items = await searchOneshots({ genre: tag, take: 60 });

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Tag: #{tag}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((it) => (
          <OneshotCard key={it.id} item={it as any} />
        ))}
      </div>
    </main>
  );
}
