import { getOneshotById } from "@/lib/oneshots";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReaderProgress from "@/components/ReaderProgress";

export default async function ReaderPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getOneshotById(params.id);
  if (!data) return notFound();

  const pages = Array.isArray(data.pages) ? data.pages : [];
  const genres = Array.isArray(data.genres) ? (data.genres as string[]) : [];
  const total = (data.coverUrl ? 1 : 0) + pages.length;

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <ReaderProgress total={total} />

      <div className="pt-4">
        <h1 className="text-2xl font-bold mb-1">{data.title}</h1>

        {/* ผู้แต่ง (ลิงก์ไปหน้ารวมผลงานผู้แต่ง) */}
        {data.authorName && (
          <div className="text-sm text-brand-subtext mb-2">
            <Link
              href={`/author/${encodeURIComponent(data.authorName)}`}
              className="hover:underline"
            >
              {data.authorName}
            </Link>
          </div>
        )}

        {genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {genres.map((g) => (
              <Link
                key={g}
                href={`/?genre=${encodeURIComponent(g)}`}
                className="px-2 py-0.5 rounded-full text-xs border"
              >
                #{g}
              </Link>
            ))}
          </div>
        )}
      </div>

      {data.coverUrl && (
        <div data-readpage>
          <img
            src={data.coverUrl}
            alt={`${data.title} cover`}
            className="w-full h-auto rounded-lg shadow"
          />
        </div>
      )}

      <div className="space-y-2">
        {pages.map((p: { url: string; w?: number; h?: number }, i: number) => (
          <div key={i} data-readpage>
            <img
              src={p.url}
              alt={`page ${i + 1}`}
              loading="lazy"
              className="w-full h-auto rounded-lg"
            />
          </div>
        ))}
      </div>
    </main>
  );
}
