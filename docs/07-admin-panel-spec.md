# 07 · Admin Panel Specification

Persian, RTL, mobile-friendly. Simple mental model: three sections
(محصولات / دسته‌بندی‌ها / تنظیمات) + a live phone preview.
Visual quality must match the public menu (same design system, doc 05).

## Routes

| Route | Purpose |
| --- | --- |
| `/login` | Username + password (rate-limited) |
| `/admin/products` | Product list + drawer form + dnd reorder + preview button |
| `/admin/categories` | Two-level tree CRUD + dnd reorder |
| `/admin/settings` | Restaurant name, theme picker, unavailable mode |

Middleware protects `/admin/**` and `/api/admin/**` (doc 10).

## Layout

- Desktop: inline-start sidebar (icons + Persian labels), content area.
- Mobile: top bar + bottom navigation (3 items) — thumb-reachable.
- Top bar: «پیش‌نمایش» button (opens preview drawer), user menu
  (تغییر رمز عبور dialog, خروج).
- Unsaved-changes context: dirty flag → `beforeunload` + confirm dialog
  («تغییرات ذخیره‌نشده دارید») on internal navigation.

## Draft store (live preview backbone)

`useMenuDraftStore` (zustand) holds a normalized snapshot:
`{ settings, categories[], products[] }` = **draft**, plus `savedVersion`.

- All admin lists render from **draft** (single source for UI).
- Forms mutate draft on every field change (controlled) → preview is always live.
- Server action success → `savedVersion++`, draft kept (now clean).
- «بازگشت به منوی ذخیره‌شده» button in preview → `resetToSaved()` (refetch).
- Draft persists only in memory (tab reload = saved state).

## Products page

- Toolbar: search input (name, client-side over draft), category select
  (parent → child), «محصول جدید» primary button.
- List: responsive table/cards; row = thumb 48px, name, category, effective
  price, availability Switch (instant server action + toast), edit, delete.
- Pagination 20/page (server-side when not searching).
- **Reorder**: when a single category is selected → rows become dnd-kit sortable
  (handle icon); drop → `ReorderProducts` action; other categories disabled with hint.
- **Delete**: confirm dialog showing product name in bold; on success also
  removes image files (BR-03); toast with undo? — no undo (out of scope).

### Product form (drawer, RHF + Zod)

Fields (Persian labels, English code):
name · category (two selects) · description (≤500, counter) · price (integer toman,
live Persian-formatted hint below input) · discount (Switch + discountedPrice,
inline error if ≥ price, BR-04) · badges (multi chip toggle, doc 05) ·
available Switch · image (upload editor) · variants (dynamic rows: name + price,
add/remove, min 0 rows).

Submit → server action → success toast + close drawer; errors → inline Persian
messages + error toast.

### Upload editor (modal)

1. Pick/drag file (JPG/PNG/WebP ≤5MB, client pre-check).
2. `react-easy-crop`: fixed 4:3 aspect, rotate slider, zoom.
3. Crop → canvas → JPEG blob (q .92) → **XHR** POST `/api/admin/media/upload`
   (real progress bar via `xhr.upload.onprogress`).
4. Server: auth check → magic-bytes → size → ratio ±2% (BR-11) → save original →
   Sharp variants (320/640/960 webp) → return `{ mediaId, url }`.
5. Form shows thumb with «جایگزینی» / «حذف».

## Categories page

- Tree list: parents with nested children (indented), dnd within level
  (`ReorderCategories` per parentId).
- Add/edit dialog: name + parent select (parents only; depth BR-01).
- Delete: if BR-02 violated → error toast «ابتدا محصولات این دسته را منتقل کنید»;
  else confirm dialog.

## Settings page

- Restaurant name input (1..80).
- Theme picker: 4 cards rendering a mini live preview (hero + 2 cards) using the
  actual tokens; selected = ring; applies to preview immediately, to public after save.
- Unavailable mode: two radio cards with tiny visual examples
  (HIDE: hidden card icon · MUTED: grayscale thumb + «ناموجود»).
- Single «ذخیره» button → `UpdateSettings` → toast.

## Live preview (phone frame)

- Drawer (desktop: side panel 380px; mobile: full-screen sheet).
- `PhoneFrame`: rounded device bezel, notch, status bar (fa digits clock),
  scrollable viewport rendering the **pure public components** (`components/menu/*`)
  fed with **draft** data and draft theme.
- Buttons: «بازگشت به منوی ذخیره‌شده» (resetToSaved), «بستن».
- Because menu components are pure (doc 06), preview == production rendering.

## Acceptance criteria (highlights)

1. Owner adds a product with image in < 2 minutes (measured in usability pass).
2. Editing price in the form updates the phone preview instantly (no save).
3. Upload shows real progress; wrong ratio file rejected with Persian message.
4. Reorder persists after reload; public menu reflects new order after revalidate.
5. Deleting a category with products shows guard toast, nothing deleted.
6. Dirty form + sidebar navigation → confirm dialog appears.