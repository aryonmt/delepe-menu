import { strings } from "@/lib/fa/strings";

const ZWNJ = "\u200C";
const LOCKED_CODES = [0x062f, 0x0650, 0x200c, 0x0644, 0x0650, 0x200c, 0x067e, 0x0650];

/** Split the locked brand string on ZWNJ into دِ / لِ / پِ clusters (docs/05). */
export function wordmarkClusters(value: string = strings.brand.wordmark): string[] {
  return value.split(ZWNJ);
}

export function assertLockedWordmark(value: string = strings.brand.wordmark): void {
  const codes = [...value].map((char) => char.codePointAt(0));
  if (codes.length !== LOCKED_CODES.length || codes.some((code, i) => code !== LOCKED_CODES[i])) {
    throw new Error("brand wordmark string was altered");
  }
}
