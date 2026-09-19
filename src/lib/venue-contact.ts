import { toPersianDigits } from "@/lib/format/digits";

/** Public Instagram handle (docs/06 footer). Not stored in the database. */
export const VENUE_INSTAGRAM_HANDLE = "cafe_delepe";
export const VENUE_INSTAGRAM_URL = "https://www.instagram.com/cafe_delepe/";

/** E.164 for tel: links. Display uses the local 0-prefix grouping. */
export const VENUE_PHONE_E164 = "+989362888142";
export const VENUE_PHONE_DISPLAY_ASCII = "0936 288 8142";

export function venueInstagramHref(): string {
  return VENUE_INSTAGRAM_URL;
}

export function venuePhoneHref(): string {
  return `tel:${VENUE_PHONE_E164}`;
}

export function venuePhoneLabel(): string {
  return toPersianDigits(VENUE_PHONE_DISPLAY_ASCII);
}
