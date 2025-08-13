// lib/auth.ts (Node)
import { createHmac, randomBytes, scryptSync } from "crypto";

const APP_SECRET = process.env.APP_SECRET || "dev-secret-change-me";

/** helpers */
const toU8 = (b: Buffer) => new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
const fromB64url = (s: string) =>
  Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
const b64url = (bin: Uint8Array | Buffer) => {
  const buf = Buffer.isBuffer(bin) ? bin : Buffer.from(bin as Uint8Array);
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};
const b64urlJson = (obj: any) => b64url(Buffer.from(JSON.stringify(obj)));

/** constant-time compare */
function constantTimeEq(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** HMAC-SHA256 token */
export function signToken(payload: Record<string, any>, expSec: number) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { iat: now, exp: now + expSec, ...payload };

  const part1 = b64urlJson(header);
  const part2 = b64urlJson(body);
  const data = `${part1}.${part2}`;
  const sig = b64url(createHmac("sha256", APP_SECRET).update(data).digest());
  return `${data}.${sig}`;
}

export function verifyToken(token: string | undefined | null) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [p1, p2, sig] = parts;

  const data = `${p1}.${p2}`;
  const expected = b64url(createHmac("sha256", APP_SECRET).update(data).digest());

  const ok = constantTimeEq(toU8(Buffer.from(expected)), toU8(Buffer.from(sig)));
  if (!ok) return null;

  const payload = JSON.parse(fromB64url(p2).toString("utf8"));
  if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload as Record<string, any>;
}

/** password verify (ADMIN_PASS หรือ ADMIN_PASS_HASH=scrypt:<saltB64>:<hashB64>) */
export async function verifyPassword(input: string) {
  const pass = process.env.ADMIN_PASS;
  const hash = process.env.ADMIN_PASS_HASH;

  if (hash && hash.startsWith("scrypt:")) {
    const [, saltB64, hashB64] = hash.split(":");
    if (!saltB64 || !hashB64) return false;
    const salt = Buffer.from(saltB64, "base64");
    const want = Buffer.from(hashB64, "base64");
    const got = scryptSync(input, new Uint8Array(salt), want.length, { N: 16384, r: 8, p: 1 });
    return constantTimeEq(toU8(want), toU8(got));
  }

  return !!pass && constantTimeEq(toU8(Buffer.from(pass)), toU8(Buffer.from(input)));
}

export async function genHash(pw: string) {
  const salt = randomBytes(16);
  const key = scryptSync(pw, new Uint8Array(salt), 32, { N: 16384, r: 8, p: 1 });
  return `scrypt:${salt.toString("base64")}:${key.toString("base64")}`;
}
