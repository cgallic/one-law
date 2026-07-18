import { createHmac, timingSafeEqual } from "node:crypto";

const secret = () => process.env.GAME_STATE_SECRET || "one-law-local-development-secret";
const encode = (value: string) => Buffer.from(value).toString("base64url");

export function signState<T>(state: T): string {
  const body = encode(JSON.stringify(state));
  const signature = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyState<T>(token: string): T | null {
  const [body, supplied] = token.split(".");
  if (!body || !supplied) return null;
  const expected = createHmac("sha256", secret()).update(body).digest();
  const actual = Buffer.from(supplied, "base64url");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try { return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T; } catch { return null; }
}
