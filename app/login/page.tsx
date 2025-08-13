"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";


export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin";

  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [msg, setMsg] = useState("");
  const [csrf, setCsrf] = useState("");

  useEffect(() => {
    fetch("/api/auth/csrf")
      .then(r => r.json())
      .then(d => setCsrf(d.csrf))
      .catch(() => {});
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("Signing in...");
    const fd = new FormData();
    fd.set("username", u);
    fd.set("password", p);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "x-csrf": csrf },
      body: fd
    });
    if (res.ok) {
      router.replace(next || "/admin");
    } else {
      const t = await res.text();
      setMsg(t || "Invalid credentials");
    }
  }

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="card p-6 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-center">Sign in</h1>

        <div>
          <label className="text-sm opacity-80">Username</label>
          <input className="input w-full mt-1" value={u} onChange={e => setU(e.target.value)} autoComplete="username" required />
        </div>

        <div>
          <label className="text-sm opacity-80">Password</label>
          <input className="input w-full mt-1" type="password" value={p} onChange={e => setP(e.target.value)} autoComplete="current-password" required />
        </div>

        <button className="button-primary w-full" disabled={!csrf}>Login</button>
        {msg && <p className="text-center text-sm text-brand-subtext">{msg}</p>}
      </form>
    </main>
  );
}
