import { strings } from "@/lib/fa/strings";

/** Maps a domain error code to the Persian copy in `strings.ts`. */
export function domainMessage(code: string): string {
  const messages = strings.errors.domain;
  if (Object.prototype.hasOwnProperty.call(messages, code)) {
    return messages[code as keyof typeof messages];
  }
  return strings.errors.genericBody;
}
