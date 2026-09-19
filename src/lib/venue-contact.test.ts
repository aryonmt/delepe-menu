import { describe, expect, it } from "vitest";
import { toPersianDigits } from "@/lib/format/digits";
import {
  VENUE_INSTAGRAM_HANDLE,
  VENUE_INSTAGRAM_URL,
  VENUE_PHONE_DISPLAY_ASCII,
  VENUE_PHONE_E164,
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

  it("exposes an E.164 tel link and a Persian-digit local display", () => {
    expect(VENUE_PHONE_E164).toBe("+989362888142");
    expect(venuePhoneHref()).toBe("tel:+989362888142");
    expect(VENUE_PHONE_DISPLAY_ASCII).toBe("0936 288 8142");
    expect(venuePhoneLabel()).toBe(toPersianDigits("0936 288 8142"));
  });
});
