import OneshotCard from "@/components/OneshotCard";
import SearchBar from "@/components/SearchBar";
import GenreFilter from "@/components/GenreFilter";
import { listAllGenres, searchOneshots, type CardItem, type SearchInput } from "@/lib/oneshots";
import BackButton from "@/components/BackButton";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 20;

const PAGE_SIZE = 24;

export default async function Home({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const q = (searchParams.q as string) || "";
  const genre = (searchParams.genre as string) || undefined;
  const author = (searchParams.author as string) || undefined;
  const page = Math.max(1, Number(searchParams.page ?? 1));

  // สร้าง args สำหรับ searchOneshots
  const args: SearchInput = { q, genre, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE };
  if (author) args.author = author;

  const [genres, rawData]: [string[], CardItem[]] = await Promise.all([listAllGenres(), searchOneshots(args)]);

  // searchOneshots returns CardItem[] array
  const items = rawData;
  const total = items.length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          NIGHTSU <span className="text-zinc-400">SPACE</span>
        </h1>
        <SearchBar />
      </header>

      <div className="mb-5">
        <GenreFilter genres={genres} />
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((it: CardItem) => (
            <OneshotCard key={it.id} item={it} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {/* Search icon */}
          <div className="mb-6 text-zinc-400">
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          {/* No results message */}
          <h3 className="mb-2 text-xl font-semibold text-zinc-200">
            ไม่พบผลลัพธ์
          </h3>
          
          <p className="mb-6 max-w-md text-zinc-400">
            {q && genre && author ? (
              `ไม่พบผลงานที่ตรงกับ "${q}" ในหมวดหมู่ "${genre}" ของ "${author}"`
            ) : q && genre ? (
              `ไม่พบผลงานที่ตรงกับ "${q}" ในหมวดหมู่ "${genre}"`
            ) : q && author ? (
              `ไม่พบผลงานที่ตรงกับ "${q}" ของ "${author}"`
            ) : q ? (
              `ไม่พบผลงานที่ตรงกับ "${q}"`
            ) : genre && author ? (
              `ไม่พบผลงานในหมวดหมู่ "${genre}" ของ "${author}"`
            ) : genre ? (
              `ไม่พบผลงานในหมวดหมู่ "${genre}"`
            ) : author ? (
              `ไม่พบผลงานของ "${author}"`
            ) : (
              "ไม่พบผลงานใดๆ"
            )}
          </p>
        </div>
      )}

      {total > PAGE_SIZE && (
        <nav className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: Math.ceil(total / PAGE_SIZE) }).map((_, i) => {
            const p = i + 1;
            const sp = new URLSearchParams(
              Object.entries(searchParams).flatMap(([k, v]) => (v ? [[k, String(v)]] : []))
            );
            sp.set("page", String(p));
            const href = `/?${sp.toString()}`;
            return (
              <a
                key={p}
                href={href}
                className={`rounded-lg px-3 py-1 text-sm ring-1 ring-white/10 ${
                  p === page
                    ? "bg-white/90 text-black"
                    : "bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {p}
              </a>
            );
          })}
        </nav>
      )}
    </main>
  );
}
