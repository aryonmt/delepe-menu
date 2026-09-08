# 07 · Admin Panel Specification

Persian, RTL, mobile-friendly. Simple mental model: three sections
(محصولات / دسته‌بندی‌ها / تنظیمات) + a live phone preview.
Visual quality must match the public menu (same design system, doc 05).

## Routes

| Route | Purpose |
| --- | --- |
| `/login` | Username + password (rate-limited, doc 10). Already-authed → redirect `/admin/products` |
| `/admin` | Redirects to `/admin/products` |
| `/admin/products` | Product list + drawer form + dnd reorder + preview button |
| `/admin/categories` | Two-level tree CRUD + dnd reorder |
| `/admin/settings` | Restaurant name, unavailable mode |

Middleware protects `/admin/**` and `/api/admin/**` (docs 03, 10).
Successful login redirects to `/admin/products`.

## Feature Specification

- **Goal**: a non-technical owner manages the whole menu, fearlessly, in Persian.
- **User value**: every change visible instantly in a phone-frame preview before
  saving; no training needed.
- **Technical requirements**: draft store (below) + shared `toPublicMenu` mapper;
  RHF+Zod forms; dnd-kit; XHR upload with progress (doc 03 media pipeline).
- **Dependencies**: docs 03 (architecture/media), 04 (contracts, BRs),
  05 (design), 10 (auth).
- **Implementation notes**: build the draft store + admin layout first; every
  admin page reads/writes draft only.
- **Acceptance criteria**: E2E table at the end.
- **Required tests**: unit (use-cases per doc 04) + E2E `admin-products.spec`,
  `admin-categories.spec`, `settings-preview.spec` (doc 09).

## Layout

- Desktop: inline-start sidebar (icons + Persian labels), content area.
- Mobile: top bar + bottom navigation (3 items) — thumb-reachable.
- Top bar: «پیش‌نمایش» button (opens preview drawer), user menu
  (trigger label «حساب کاربری»; تغییر رمز عبور dialog, خروج).
- Change password: current + new + repeat new; «ذخیره رمز» opens an in-dialog
  confirmation («تأیید تغییر رمز») before the mutation. Mismatch →
  `PASSWORD_MISMATCH`.
- Unsaved-changes: `isDirty` → `beforeunload` + confirm dialog
  («تغییرات ذخیره‌نشده دارید») on internal navigation.

## Draft store (live preview backbone)

`useMenuDraftStore` (zustand) holds:

```ts
{
  draft: AdminMenuDto;        // FULL menu incl. unavailable products
  savedVersion: number;       // increments on every successful server mutation
  isDirty: boolean;           // true after any draft mutation since last save
  hydrate(data: AdminMenuDto): void;
  resetToSaved(): Promise<void>;  // re-fetch via GetAdminMenu, replace draft
  // …typed mutators: upsertProduct, removeProduct, updateSettings, …
}
```

Rules (deterministic):

1. **Hydration**: the admin layout (RSC) fetches `GetAdminMenuUseCase` and passes
   it to the store once. All admin lists and the preview render from **draft** —
   the single source of truth for admin UI.
2. **Pagination & search are client-side** over draft (20/page). There is no
   server-side pagination (menu size is small; simplicity wins).
3. **Edit sessions**: the product/category drawer edits a **local copy** of the
   entity. «ذخیره» → server action → on success the draft is updated and
   `savedVersion++`, `isDirty=false`. «انصراف» / dismiss → the copy is discarded;
   draft and preview stay untouched.
4. **Instant actions** (availability switch): optimistic draft update + server
   action; on error → revert draft + Persian error toast.
5. **Preview**: renders the pure `components/menu/*` components with
   `toPublicMenu(draft)` — the same mapper the server uses — so preview ==
   production, including HIDE/MUTED and empty-category pruning.
6. **Persistence**: draft lives in memory only (tab reload = saved state).
   «بازگشت به منوی ذخیره‌شده» → `resetToSaved()`.

## Products page

- Toolbar: search input (name, client-side over draft), category select
  (parent → child), «محصول جدید» primary button.
- List: responsive table/cards; row = thumb 48px (`mediaUrl(id, 320)`), name,
  category, effective price, availability Switch (instant action), edit, delete.
- Client-side pagination 20/page over the (filtered) draft list.
- **Reorder**: product rows are **not** drag-sortable on this page (owner
  decision). Sort order is edited on the Categories tree; `ReorderProducts`
  remains a server use-case for that path. The products toolbar is search +
  category filter only.
- **Delete**: confirm dialog showing the product name in bold; on success also
  removes image files (BR-03); success toast. No undo (out of scope).

### Product form (drawer, RHF + Zod)

Fields (Persian labels, English code):
name · category (two selects: parent → child; the child select is shown only when
the chosen parent has children — BR-15 means the effective category is always a
leaf) · description (≤500, counter) · price (integer toman, accepts FA/EN digits —
normalized in the form layer; live Persian-formatted hint below input; **disabled
and auto-filled with min(variant prices) when variants exist**, BR-13) ·
discount (Switch + discountedPrice, inline error if ≥ price, BR-04; **the whole
section is hidden when variants exist**, BR-14) · badges (multi chip toggle,
doc 05) · available Switch · image (upload editor) · variants (dynamic rows:
name + price, add/remove, min 0 rows).

Submit → server action → success toast + close drawer; errors → inline Persian
messages + error toast.

### Upload editor (modal)

1. Pick/drag file (JPG/PNG/WebP ≤5MB, client pre-check).
2. `react-easy-crop`: fixed 1:1 aspect, rotate slider, zoom.
3. Crop → canvas → JPEG blob (q .92) → **XHR** POST `/api/admin/media/upload`
   (real progress bar via `xhr.upload.onprogress`).
4. Server: auth → magic-bytes → size → ratio ±2% (BR-11) → save original →
   Sharp variants (320/640/960 WebP) + `dominantColor` → return
   `{ mediaId, dominantColor, width, height }` (doc 03 pipeline).
5. Form shows a thumb (`mediaUrl(mediaId, 320)`) with «جایگزینی» / «حذف».
6. If the form is cancelled or product creation fails after a successful upload,
   the client calls `DeleteMedia` for the orphan (no orphan files).

## Categories page

- Tree list: parents with nested children (indented), dnd within level
  (`ReorderCategories` per parentId).
- Add/edit dialog: name + parent select (top-level categories only; depth BR-01).
  Guards: adding a child to a category that owns products → error toast (BR-16);
  re-parenting that would create depth 3 or strand products → `ValidationError`
  toast (BR-01/BR-15/BR-16).
- Delete: if BR-02 violated → error toast «ابتدا محصولات این دسته را منتقل کنید»;
  else confirm dialog.

## Settings page

- Restaurant name input (1..80).
- Theme picker — **Deferred (ADR-12)**: the `theme` field persists in the data
  model and the form keeps its hidden input, but no picker is built in v1; the
  public UI renders the single «پاتوق» identity (doc 05) regardless of the
  stored value.
- Unavailable mode: two radio cards with tiny visual examples
  (HIDE: hidden-card icon · MUTED: grayscale thumb + «امروز تموم شد» stamp).
- Single «ذخیره» button → `UpdateSettings` → toast.
- **Ticker curation card** («پیشنهادهای منو»): sortable list of curated product
  ids (dnd handle + remove), grouped add-select, save persists
  `tickerProductIds` via `UpdateSettings` and revalidates the public menu.
  
## Live preview (phone frame)

- Drawer (desktop: side panel 380px; mobile: full-screen sheet).
- `PhoneFrame`: rounded device bezel, notch, status bar (Persian-digits clock),
  scrollable viewport rendering the **pure public components** fed with
  `toPublicMenu(draft)` (the single «پاتوق» identity; the stored theme value is
  visually inert per ADR-12). The preview renders the shared public components,
  including the bottom dock, inside the phone frame.
- Buttons: «بازگشت به منوی ذخیره‌شده» (`resetToSaved`), «بستن».

## Acceptance criteria (highlights — automatable unless noted)

1. Owner adds a product with image in < 2 minutes (manual usability pass).
2. Editing a price in the form updates the phone preview instantly (no save).
3. Upload shows real progress; a wrong-ratio file is rejected with a Persian message.
4. Reorder persists after reload; the public menu reflects the new order after revalidation.
5. Deleting a category with products shows the guard toast; nothing is deleted.
6. Dirty form + sidebar navigation → confirm dialog appears.
7. Cancelling the product drawer after edits leaves list and preview unchanged.
8. Typing Persian digits («۱۲۵۰۰۰») in the price field validates and saves as 125000.
9. A product with variants shows no discount section and an auto-filled, disabled price equal to the cheapest variant.