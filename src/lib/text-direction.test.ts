import { describe, expect, it } from "vitest";
import { textDirection } from "./text-direction";

describe("textDirection", () => {
  it("defaults empty and whitespace to rtl (page direction)", () => {
    expect(textDirection("")).toBe("rtl");
    expect(textDirection("   ")).toBe("rtl");
  });

  it("uses ltr when the first strong character is Latin", () => {
    expect(textDirection("admin")).toBe("ltr");
    expect(textDirection("  Hello")).toBe("ltr");
  });

  it("uses ltr when the first meaningful character is a digit", () => {
    expect(textDirection("123")).toBe("ltr");
    expect(textDirection("۱۲۵")).toBe("ltr");
    expect(textDirection("١٢٥")).toBe("ltr");
  });

  it("uses rtl when the first strong character is Arabic/Persian", () => {
    expect(textDirection("پاتوق")).toBe("rtl");
    expect(textDirection("سلام admin")).toBe("rtl");
  });

  it("skips punctuation until a letter or digit", () => {
    expect(textDirection("...ok")).toBe("ltr");
    expect(textDirection("«سلام»")).toBe("rtl");
  });
});
