import { toPersianDigits } from "@/lib/format/digits";

/** Public Instagram handle (docs/06 footer). Not stored in the database. */
export const VENUE_INSTAGRAM_HANDLE = "cafe_delepe";
export const VENUE_INSTAGRAM_URL = "https://www.instagram.com/cafe_delepe/";

/** Landline listed on the public footer (docs/06). Display keeps the `_` grouping. */
export type VenuePhone = {
  e164: string;
  displayAscii: string;
};

export const VENUE_PHONES: readonly VenuePhone[] = [
  { e164: "+981144510495", displayAscii: "011_44510495" },
  { e164: "+981144525365", displayAscii: "011_44525365" },
];

export function venueInstagramHref(): string {
  return VENUE_INSTAGRAM_URL;
}

export function venuePhoneHref(phone: VenuePhone): string {
  return `tel:${phone.e164}`;
}

export function venuePhoneLabel(phone: VenuePhone): string {
  return toPersianDigits(phone.displayAscii);
}
