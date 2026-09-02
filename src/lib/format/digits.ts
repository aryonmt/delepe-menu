const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Convert ASCII (and pass through Persian) digits to Persian ۰–۹. */
export function toPersianDigits(value: string | number): string {
  const raw = typeof value === "number" ? String(value) : value;
  return raw.replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

/** Normalize Persian and Arabic-Indic digits to ASCII 0–9 (form-layer input). */
export function toAsciiDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_INDIC_DIGITS.indexOf(digit)));
}
