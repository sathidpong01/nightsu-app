"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function slugifyTitle(input: string, spaceSymbol = "_") {
  const normalized = input.normalize("NFKC").trim();
  let s = normalized.replace(/\s+/g, spaceSymbol);
  s = s.replace(/[^\p{Letter}\p{Number}_-]+/gu, "");
  const symEsc = spaceSymbol.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  s = s.replace(new RegExp(`${symEsc}{2,}`, "g"), spaceSymbol);
  s = s.replace(new RegExp(`^${symEsc}|${symEsc}$`, "g"), "");
  return s || "untitled";
}

type PageItem = { url: string; w?: number; h?: number };
type RowFull = {
  id: string;
  title: string;
  coverUrl: string;
  pages: PageItem[];
  genres: string[];
  isPublished: boolean;
  authorName?: string | null;
  authorUrl?: string | null;
  ageBadge?: string | null;
  ribbons?: string[] | string | null;
  stats?: { days?: number } | null;
};

export default function AdminEditorPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const editIdQs = sp.get("id") || "";

  const [msg, setMsg] = useState("");
  const [title, setTitle] = useState("");
  const [genresInput, setGenresInput] = useState("");

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pageFiles, setPageFiles] = useState<File[]>([]);
  const [publish, setPublish] = useState(true);

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [pagesPreview, setPagesPreview] = useState<string[]>([]);

  const [knownGenres, setKnownGenres] = useState<string[]>([]);
  const [editId, setEditId] = useState<string>("");
  const [existingPages, setExistingPages] = useState<PageItem[]>([]);

  // 🔹 ฟิลด์ที่ผู้แจ้งว่า “ไม่บันทึกค่า” -> ทำเป็น controlled state
  const [authorName, setAuthorName] = useState("");
  const [authorUrl, setAuthorUrl] = useState("");
  const [ageBadge, setAgeBadge] = useState("");
  const [ribbonsText, setRibbonsText] = useState("");
  const [statsDays, setStatsDays] = useState<number | "">("");

  const autoSlug = useMemo(() => slugifyTitle(title), [title]);

  useEffect(() => {
    fetch("/api/admin/genres").then(r=>r.json()).then(setKnownGenres).catch(()=>{});
  }, []);

  // โหลดข้อมูลเดิมเมื่อแก้ไข
  useEffect(() => {
    if (!editIdQs) return;
    (async () => {
      const full: RowFull = await fetch(`/api/admin/get?id=${encodeURIComponent(editIdQs)}`).then(r=>r.json());
      setEditId(full.id);
      setTitle(full.title);
      setGenresInput((full.genres || []).join(","));

      setCoverPreview(full.coverUrl ? `${full.coverUrl}?v=${Date.now()}` : null);
      setExistingPages(full.pages || []);
      setPublish(full.isPublished);

      // ใส่ค่าเดิมให้ช่องที่เป็นปัญหา
      setAuthorName(full.authorName || "");
      setAuthorUrl(full.authorUrl || "");
      setAgeBadge(full.ageBadge || "");
      const rb =
        Array.isArray(full.ribbons) ? full.ribbons.join(",") :
        typeof full.ribbons === "string" ? full.ribbons : "";
      setRibbonsText(rb);
      setStatsDays(full.stats?.days ?? "");
    })().catch(()=>{});
  }, [editIdQs]);

  // previews
  useEffect(() => {
    if (!coverFile) { return; }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);
  useEffect(() => {
    const urls = pageFiles.slice(0, 6).map(f => URL.createObjectURL(f));
    setPagesPreview(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [pageFiles]);

  const genresArray = useMemo(
    () => genresInput.split(",").map(s=>s.trim()).filter(Boolean),
    [genresInput]
  );

  function toggleGenre(g: string) {
    if (genresArray.includes(g)) {
      setGenresInput(genresArray.filter(x=>x!==g).join(","));
    } else {
      setGenresInput([...genresArray, g].join(","));
    }
  }

  // ----- reorder / delete existing pages -----
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  function onDragStart(i: number) { setDragIndex(i); }
  function onDragOver(e: React.DragEvent) { e.preventDefault(); }
  function onDrop(i: number) {
    if (dragIndex === null || dragIndex === i) return;
    const arr = existingPages.slice();
    const [moved] = arr.splice(dragIndex, 1);
    arr.splice(i, 0, moved);
    setExistingPages(arr);
    setDragIndex(null);
  }
  function movePage(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= existingPages.length) return;
    const arr = existingPages.slice();
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setExistingPages(arr);
  }
  async function deletePageFile(i: number) {
    if (!editId) return;
    const p = existingPages[i];
    setMsg("Deleting page...");
    const res = await fetch("/api/admin/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editId, pageUrl: p.url })
    });
    if (res.ok) {
      const arr = existingPages.slice();
      arr.splice(i, 1);
      setExistingPages(arr);
      setMsg("");
    } else {
      setMsg("Error deleting page");
    }
  }
  function onDropAddFiles(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) setPageFiles(prev => [...prev, ...files]);
  }
  async function deleteCover() {
    if (!editId) return;
    setMsg("Deleting cover...");
    const res = await fetch("/api/admin/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editId, cover: true })
    });
    if (res.ok) { setCoverPreview(null); setMsg(""); }
    else setMsg("Error deleting cover");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("Saving...");

    const data = new FormData(e.currentTarget);
    if (editId) data.set("editId", editId);
    data.set("title", title);
    data.set("genres", genresArray.join(","));

    // ✅ ยัดค่าที่เป็น state ลงไปชัดเจน (แก้ปัญหาไม่ส่งค่า)
    data.set("authorName", authorName);
    data.set("authorUrl", authorUrl);
    data.set("ageBadge", ageBadge);
    data.set("ribbons", ribbonsText);
    if (statsDays !== "") data.set("statsDays", String(statsDays));

    const isPublish = publish;
    if (!isPublish) data.delete("publish"); else data.set("publish", "on");

    if (existingPages.length > 0) {
      data.set("existingPages", JSON.stringify(existingPages.map(p => ({ url: p.url }))));
    }

    const res = await fetch("/api/admin/upload", { method: "POST", body: data });
    if (!res.ok) {
      const t = await res.text();
      setMsg("Error: " + t);
    } else {
      const { id } = await res.json();
      setMsg(`Saved: ${id}`);
      setTimeout(() => router.push("/admin"), 400);
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{editId ? "Edit Oneshot" : "New Oneshot"}</h1>
        <div className="flex items-center gap-2">
          <button onClick={()=>router.push("/admin")} className="chip">← Back</button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 card p-4">
        <div>
          <label className="block text-sm opacity-80 mb-1">Title</label>
          <input name="title" value={title} onChange={e=>setTitle(e.target.value)} className="w-full input" required />
          {!editId ? (
            <p className="text-xs mt-1 text-brand-subtext">Slug: <span className="opacity-90">{autoSlug}</span></p>
          ) : (
            <p className="text-xs mt-1 text-brand-subtext">Editing: <b>{editId}</b></p>
          )}
        </div>

        <div>
          <label className="block text-sm opacity-80 mb-1">Genres (comma)</label>
          <input value={genresInput} onChange={e=>setGenresInput(e.target.value)} className="w-full input" placeholder="action,romance,drama" />
          {knownGenres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {knownGenres.map(g => (
                <button type="button" key={g} onClick={()=>toggleGenre(g)} className={"chip " + (genresArray.includes(g) ? "chip-active" : "")}>#{g}</button>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Cover (webp/jpg/png)</label>
            <input type="file" name="cover" accept="image/webp,image/jpeg,image/png" onChange={e=>setCoverFile(e.target.files?.[0] || null)} />
            {coverPreview && (
              <div className="mt-2">
                <img src={coverPreview} alt="cover preview" className="max-h-64 rounded-lg" />
                {editId && <div className="mt-2"><button type="button" onClick={deleteCover} className="chip">Delete cover</button></div>}
              </div>
            )}
          </div>

          <div onDragOver={(e)=>e.preventDefault()} onDrop={onDropAddFiles}>
            <label className="block text-sm mb-1">Pages ใหม่ (drag & drop หรือเลือกไฟล์) — เพิ่มต่อท้าย</label>
            <input type="file" name="pages" accept="image/webp,image/jpeg,image/png" multiple onChange={e=>setPageFiles(Array.from(e.target.files || []))} />
            {pagesPreview.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {pagesPreview.map((u, i) => (<img key={i} src={u} alt={"new"+i} className="h-32 w-full object-cover rounded-md" />))}
              </div>
            )}
          </div>
        </div>

        {editId && (
          <div>
            <label className="block text-sm opacity-80 mb-2">Current pages (drag & drop เพื่อจัดลำดับ / ลบ)</label>
            <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {existingPages.map((p, i) => (
                <div key={p.url} className="card p-2" draggable onDragStart={() => onDragStart(i)} onDragOver={(e)=>e.preventDefault()} onDrop={() => onDrop(i)}>
                  <img src={p.url} className="h-36 w-full object-cover rounded-md" alt={"pg"+i}/>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span># {i+1}</span>
                    <div className="flex gap-1">
                      <button type="button" onClick={()=>movePage(i, -1)} className="chip">↑</button>
                      <button type="button" onClick={()=>movePage(i, +1)} className="chip">↓</button>
                      <button type="button" onClick={()=>deletePageFile(i)} className="chip">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🔹 ฟิลด์เพิ่มเติมที่ควบคุมด้วย state ทั้งหมด */}
        <div className="grid md:grid-cols-3 gap-3">
          <input name="authorName" className="w-full input" placeholder="author name (optional)" value={authorName} onChange={e=>setAuthorName(e.target.value)} />
          <input name="authorUrl" className="w-full input" placeholder="author link (optional)" value={authorUrl} onChange={e=>setAuthorUrl(e.target.value)} />
          <input name="ageBadge" className="w-full input" placeholder='age badge เช่น "MM" หรือ "MF+"' value={ageBadge} onChange={e=>setAgeBadge(e.target.value)} />
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <input name="ribbons" className="w-full input" placeholder='ribbons คั่นด้วย , เช่น WIP,NEW' value={ribbonsText} onChange={e=>setRibbonsText(e.target.value)} />
          <input name="statsDays" type="number" className="w-full input" placeholder="age in days (optional)" value={statsDays} onChange={e=>setStatsDays(e.target.value === "" ? "" : Number(e.target.value))} />
          <label className="inline-flex items-center gap-2">
            <input name="publish" type="checkbox" checked={publish} onChange={e=>setPublish(e.target.checked)} />
            <span className="text-sm">Publish เลย</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button className="button-primary">{editId ? "Save changes" : "Create"}</button>
          <button type="button" className="chip" onClick={()=>router.push("/admin")}>Cancel</button>
          {msg && <span className="text-sm">{msg}</span>}
        </div>
      </form>
    </main>
  );
}
