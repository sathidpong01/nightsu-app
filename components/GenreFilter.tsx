"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function GenreFilter({ genres }: { genres: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  // เก็บค่าใน URL เป็น lower-case เสมอ
  const active = (params.get("genre") || "").toLowerCase();

  function toggle(label: string) {
    const value = label.toLowerCase(); // ใช้เป็นค่าจริงใน URL
    const sp = new URLSearchParams(params.toString());
    if (active === value) sp.delete("genre");
    else sp.set("genre", value);
    sp.delete("page");
    router.replace(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {genres.map((label) => {
        const value = label.toLowerCase();
        const isActive = active === value;
        return (
          <button
            key={value}
            onClick={() => toggle(label)}
            className={`rounded-full px-3 py-1 text-xs ring-1 ring-white/10 transition ${
              isActive
                ? "bg-sky-500/90 text-white shadow"
                : "bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            #{label}
          </button>
        );
      })}
    </div>
  );
}
