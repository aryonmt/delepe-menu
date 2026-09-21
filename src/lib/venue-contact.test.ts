import { describe, expect, it } from "vitest";
import { toPersianDigits } from "@/lib/format/digits";
import {
  VENUE_INSTAGRAM_HANDLE,
  VENUE_INSTAGRAM_URL,
  VENUE_PHONES,
  venueInstagramHref,
  venuePhoneHref,
  venuePhoneLabel,
} from "./venue-contact";

describe("venue contact (docs/06 footer)", () => {
  it("builds the Instagram profile URL from the public handle", () => {
    expect(VENUE_INSTAGRAM_HANDLE).toBe("cafe_delepe");
    expect(venueInstagramHref()).toBe(VENUE_INSTAGRAM_URL);
    expect(venueInstagramHref()).toContain(VENUE_INSTAGRAM_HANDLE);
  });

  it("exposes two landline E.164 tel links and Persian-digit displays", () => {
    expect(VENUE_PHONES).toHaveLength(2);
    expect(VENUE_PHONES[0]).toEqual({
      e164: "+981144510495",
      displayAscii: "011_44510495",
    });
    expect(VENUE_PHONES[1]).toEqual({
      e164: "+981144525365",
      displayAscii: "011_44525365",
    });
    expect(venuePhoneHref(VENUE_PHONES[0])).toBe("tel:+981144510495");
    expect(venuePhoneHref(VENUE_PHONES[1])).toBe("tel:+981144525365");
    expect(venuePhoneLabel(VENUE_PHONES[0])).toBe(toPersianDigits("011_44510495"));
    expect(venuePhoneLabel(VENUE_PHONES[1])).toBe(toPersianDigits("011_44525365"));
  });
});
