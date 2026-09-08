-- Settings.tickerProductIds (hero ticker curation, docs/04).
-- IF NOT EXISTS: some environments already received this column via a patched init.
ALTER TABLE "public"."Settings"
  ADD COLUMN IF NOT EXISTS "tickerProductIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
