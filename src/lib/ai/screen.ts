export type ScreenResult = { ok: true; normalized: string } | { ok: false; reason: string };

const injection = /(?:ignore|override|forget)\s+(?:all\s+)?(?:previous|prior|system|developer)|(?:system|developer)\s+(?:prompt|message|role)|reveal\s+(?:the\s+)?prompt|call\s+(?:a\s+)?tool|emit\s+(?:a\s+)?schema|```|https?:\/\/|\{\s*"/i;
const unsafe = /(?:kill|exterminate|eradicate|dehumanize)\s+(?:all\s+)?(?:real|actual)?\s*(?:people|humans|women|men|children)|sexual\s+(?:children|minor)|how\s+to\s+(?:build|make)\s+(?:a\s+)?(?:bomb|weapon)/i;

export function screenLaw(input: unknown): ScreenResult {
  if (typeof input !== "string") return { ok: false, reason: "That law cannot be simulated safely." };
  const normalized = input.normalize("NFKC").replace(/\s+/g, " ").trim();
  if (normalized.length < 5 || normalized.length > 200 || /[\u0000-\u001f\u007f]/.test(normalized) || injection.test(normalized) || unsafe.test(normalized)) {
    return { ok: false, reason: "That law cannot be simulated safely." };
  }
  return { ok: true, normalized };
}
