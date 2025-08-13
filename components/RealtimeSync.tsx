"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * ฟังเหตุการณ์จาก BroadcastChannel("oneshot-admin")
 * แล้ว refresh หน้าอัตโนมัติเมื่อมีการแก้ไข (hide/unhide/delete)
 * ใช้ได้ทุกหน้า แต่จะมีประโยชน์กับหน้าแรกที่แสดงรายการเผยแพร่
 */
export default function RealtimeSync() {
  const router = useRouter();
  const pathname = usePathname();
  const bcRef = useRef<BroadcastChannel | null>(null);
  const timer = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;

    const bc = new BroadcastChannel("oneshot-admin");
    bc.onmessage = (ev) => {
      if (ev?.data?.type === "mutated") {
        // debounce เล็กน้อยกันยิงซ้ำ
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          // ใช้ router.refresh() ให้ SSG/Server Components ดึงข้อมูลใหม่ทันที
          router.refresh();

          // เผื่อบางหน้าใช้ data ที่แคชฝั่ง client อย่างเดียว
          // (ถ้าหน้านั้นจัดการเองอยู่แล้ว refresh จะพอ)
          // ถ้าอยากให้โหลดแรง ๆ จริง ๆ uncomment บรรทัดนี้แทน:
          // window.location.reload();
        }, 120);
      }
    };
    bcRef.current = bc;

    return () => {
      clearTimeout(timer.current);
      bc.close();
    };
  }, [router, pathname]);

  return null;
}
