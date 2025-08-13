"use client";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState<string>(params.get("q") ?? "");

  // Debounce
  const debounced = useMemo(() => {
    let t: any;
    return (v: string) => {
      clearTimeout(t);
      t = setTimeout(() => {
        const sp = new URLSearchParams(params.toString());
        v ? sp.set("q", v) : sp.delete("q");
        sp.delete("page");
        router.replace(`${pathname}?${sp.toString()}`);
      }, 350);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, pathname]);

  useEffect(() => {
    debounced(q);
  }, [q, debounced]);

  return (
    <div className="flex items-center gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ค้นหา..."
        className="h-10 w-72 rounded-xl bg-zinc-900/70 px-4 text-sm text-zinc-200 outline-none ring-1 ring-white/10 placeholder:text-zinc-500 focus:ring-2 focus:ring-sky-400"
      />
    </div>
  );
}
