"use client";
import { useEffect, useState } from "react";
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("theme-dark") === "1";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme-dark", next ? "1" : "0");
  }
  return (
    <button onClick={toggle} className="px-3 py-1 rounded border text-sm hover:bg-black/5 dark:hover:bg-white/10" aria-label="Toggle dark mode">
      {dark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
