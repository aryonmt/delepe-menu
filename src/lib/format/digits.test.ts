import { describe, expect, it } from "vitest";
import { toAsciiDigits, toPersianDigits } from "./digits";

describe("toPersianDigits", () => {
  it("converts ASCII digits to Persian digits", () => {
    expect(toPersianDigits("130000")).toBe("۱۳۰۰۰۰");
  });

  it("leaves already-Persian digits unchanged", () => {
    expect(toPersianDigits("۱۲۵")).toBe("۱۲۵");
  });

  it("converts a number via its decimal representation", () => {
    expect(toPersianDigits(90)).toBe("۹۰");
  });
});

describe("toAsciiDigits", () => {
  it("converts Persian digits to ASCII", () => {
    expect(toAsciiDigits("۱۲۵۰۰۰")).toBe("125000");
  });

  it("converts Arabic-Indic digits to ASCII", () => {
    expect(toAsciiDigits("١٢٥")).toBe("125");
  });

  it("leaves ASCII digits unchanged", () => {
    expect(toAsciiDigits("75000")).toBe("75000");
  });
});
