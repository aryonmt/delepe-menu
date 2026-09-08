// src/lib/constants.ts
/** Shared numeric and visual constants — no magic values in call sites (docs/08). */
export const PRICE_MIN_TOMAN = 1_000;
export const PRICE_MAX_TOMAN = 100_000_000;
export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const UPLOAD_ASPECT_RATIO = 4 / 3;
export const UPLOAD_ASPECT_TOLERANCE = 0.02;
export const MEDIA_WIDTHS = [320, 640, 960] as const;
export type MediaWidth = (typeof MEDIA_WIDTHS)[number];
export const MEDIA_DEFAULT_WIDTH: MediaWidth = 640;
export const MEDIA_ORIGINAL_EXTENSIONS = ["jpg", "png", "webp"] as const;
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
/* Motion tokens — docs/05. */
export const DURATION_FAST_MS = 150;
export const DURATION_BASE_MS = 260;
export const DURATION_SLOW_MS = 450;
export const MOTION_PRESS_MS = 120;
export const MOTION_PRESS_SCALE = 0.97;
export const MOTION_STAGGER_MS = 35;
export const MOTION_REVEAL_Y_PX = 16;
export const MOTION_SETTLE_MS = 250;
export const MOTION_SPRING_STIFFNESS = 380;
export const MOTION_SPRING_DAMPING = 32;
export const WORDMARK_IGNITION_MS = 900;
export const TICKER_LOOP_SECONDS = 40;
/**
 * Presentation-only constant (docs/05/06): caps the ticker display.
 * It NEVER filters, hides, or alters actual menu content.
 */
export const TICKER_MAX_ITEMS = 16;