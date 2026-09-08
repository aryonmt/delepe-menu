/** Page default; used when the field is empty or has no letter/digit yet. */
export type TextDir = "ltr" | "rtl";

/**
 * Input `dir` from the first letter or digit (docs/05 RTL rules).
 * Latin or any numeric digit → LTR; Arabic/Persian letters → RTL.
 */
export function textDirection(value: string): TextDir {
  for (const char of value) {
    if (/\s/u.test(char)) continue;
    if (/\p{Nd}/u.test(char)) return "ltr";
    if (/\p{Script=Latin}/u.test(char)) return "ltr";
    if (/\p{Script=Arabic}/u.test(char)) return "rtl";
  }
  return "rtl";
}

const SKIP_DIR_TYPES = new Set([
  "hidden",
  "checkbox",
  "radio",
  "file",
  "range",
  "color",
  "submit",
  "button",
  "reset",
  "image",
]);

export function shouldInferInputDir(type: string | undefined): boolean {
  return type === undefined || !SKIP_DIR_TYPES.has(type);
}
