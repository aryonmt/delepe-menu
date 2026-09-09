/** Security header values (docs/10). Middleware + Caddy must stay in sync. */
export const CSP_REPORT_ONLY =
  "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self'";

export const HEADER_NOSNIFF = "nosniff";
export const HEADER_REFERRER = "strict-origin-when-cross-origin";
export const HEADER_FRAME_DENY = "DENY";
export const HEADER_HSTS = "max-age=31536000; includeSubDomains";
