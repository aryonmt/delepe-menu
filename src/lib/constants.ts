/** Shared numeric and visual constants — no magic values in call sites (docs/08). */

export const PRICE_MIN_TOMAN = 1_000;
export const PRICE_MAX_TOMAN = 100_000_000;

export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const UPLOAD_ASPECT_RATIO = 4 / 3;
export const UPLOAD_ASPECT_TOLERANCE = 0.02;
export const MEDIA_WIDTHS = [320, 640, 960] as const;
export type MediaWidth = (typeof MEDIA_WIDTHS)[number];
export const MEDIA_DEFAULT_WIDTH: MediaWidth = 640;

export const LIST_PAGE_SIZE = 20;
export const SORT_ORDER_GAP = 10;

export const SESSION_COOKIE_NAME = "delepe_session";
export const SESSION_TTL_DAYS = 7;
export const SESSION_SECRET_MIN_BYTES = 32;

export const ARGON2_MEMORY_KIB = 19_456;
export const ARGON2_TIME_COST = 2;
export const ARGON2_PARALLELISM = 1;

export const LOGIN_RATE_LIMIT_MAX = 5;
export const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_FAILURE_DELAY_MS = 300;

export const PUBLIC_MENU_CACHE_TAG = "public-menu";
export const PUBLIC_HTML_S_MAXAGE = 60;
export const MEDIA_CACHE_MAX_AGE = 31_536_000;

export const THEME_CROSSFADE_MS = 300;
export const HERO_HEIGHT_PX = 200;
export const HERO_SHRUNK_HEIGHT_PX = 120;
export const HERO_SHRINK_SCROLL_Y = 80;

export const DURATION_FAST_MS = 150;
export const DURATION_BASE_MS = 260;
export const DURATION_SLOW_MS = 450;
