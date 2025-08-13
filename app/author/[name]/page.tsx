import { getOneshotsByAuthor } from "@/lib/oneshots";
import OneshotCard from "@/components/OneshotCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AuthorPage({
  params,
}: {
  params: { name: string };
}) {
  const authorName = decodeURIComponent(params.name);
  const works = await getOneshotsByAuthor(authorName);

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">ผลงานทั้งหมดของ {authorName}</h1>

      {works.length === 0 ? (
        <p className="text-brand-subtext">ยังไม่พบผลงาน</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {works.map((it) => (
            <OneshotCard key={it.id} item={it} />
          ))}
        </div>
      )}
    </main>
  );
}
