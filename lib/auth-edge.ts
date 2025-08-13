// lib/auth-edge.ts (Edge-safe)
const APP_SECRET = process.env.APP_SECRET || "dev-secret-change-me";

const enc = new TextEncoder();
const b64url = (bin: ArrayBuffer | Uint8Array) => {
  const u8 = bin instanceof Uint8Array ? bin : new Uint8Array(bin);
  let str = "";
  for (let i = 0; i < u8.length; i++) str += String.fromCharCode(u8[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};
const fromB64url = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));

function constantTimeEq(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function hmacSha256(data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(APP_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64url(sig);
}

export async function verifyTokenEdge(token?: string | null) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [p1, p2, sig] = parts;

  const data = `${p1}.${p2}`;
  const expected = await hmacSha256(data);

  if (!constantTimeEq(fromB64url(expected), fromB64url(sig))) return null;

  const payload = JSON.parse(
    new TextDecoder().decode(fromB64url(p2))
  );
  if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload as Record<string, any>;
}
