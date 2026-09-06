/**
 * Deterministic, dependency-free "UUID" from a stable label. Not
 * cryptographic — only used so fixture rows in src/lib/seed-data.ts get
 * stable, valid-looking uuid-formatted ids across every environment
 * (Node seed script, Next.js server, Next.js client) without relying on
 * Node's `crypto` module (which isn't available identically everywhere).
 * Re-running the seed script with the same labels reproduces the same ids,
 * which is what makes it idempotent.
 */
export function deterministicId(label: string): string {
  let h1 = 0xdeadbeef ^ label.length;
  let h2 = 0x41c6ce57 ^ label.length;
  for (let i = 0; i < label.length; i++) {
    const ch = label.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    (Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)) >>>
    0;
  h2 =
    (Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)) >>>
    0;
  const hex = h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
  const full = (hex + hex).slice(0, 32).padEnd(32, "0");
  return `${full.slice(0, 8)}-${full.slice(8, 12)}-4${full.slice(13, 16)}-a${full.slice(17, 20)}-${full.slice(20, 32)}`;
}
