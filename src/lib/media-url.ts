import { MEDIA_DEFAULT_WIDTH, type MediaWidth, MEDIA_WIDTHS } from "./constants";

export function mediaUrl(mediaId: string, width: number): string {
  const w = toMediaWidth(width);
  return `/media/${mediaId}?w=${String(w)}`;
}

function toMediaWidth(width: number): MediaWidth {
  if ((MEDIA_WIDTHS as readonly number[]).includes(width)) return width as MediaWidth;
  if (width <= 320) return 320;
  if (width <= 640) return 640;
  return 960;
}

export function isValidMediaWidth(value: number): value is MediaWidth {
  return (MEDIA_WIDTHS as readonly number[]).includes(value);
}

export function parseMediaWidth(param: string | null): MediaWidth | null {
  if (!param) return MEDIA_DEFAULT_WIDTH;
  const parsed = Number.parseInt(param, 10);
  if (Number.isNaN(parsed) || !isValidMediaWidth(parsed)) return null; // Returns null to trigger 404
  return parsed;
}