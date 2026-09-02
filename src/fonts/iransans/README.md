Place licensed IRANSans woff2 files here (400 / 500 / 700):

- IRANSans-Regular.woff2
- IRANSans-Medium.woff2
- IRANSans-Bold.woff2

Until these files exist, the app uses Vazirmatn (OFL) as the body font.
After adding files, wire them with `next/font/local` in `src/lib/fonts.ts`
(CSS `@font-face` against missing files would fail the production build).
