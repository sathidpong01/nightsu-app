"use client";
import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // ✅ ซ่อนปุ่มเมื่ออยู่หน้าแรก (route '/')
  if (pathname === "/") return null;

  const goBack = useCallback(() => {
    // ถ้ามี history ให้ back ปกติ; ถ้าเปิดจากแท็บใหม่ให้พากลับหน้าแรก
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  return (
    <button
      onClick={goBack}
      className="fixed left-3 top-3 z-50 flex items-center gap-2 rounded-full bg-zinc-900/90 px-3 py-2 text-sm text-zinc-100 ring-1 ring-white/10 hover:bg-zinc-800"
      aria-label="ย้อนกลับ"
      title="ย้อนกลับ"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-80">
        <path d="M15 19l-7-7 7-7" />
      </svg>
      ย้อนกลับ
    </button>
  );
}
