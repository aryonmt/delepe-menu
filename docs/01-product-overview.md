# 01 · Product Overview

## Vision

Delepe Menu replaces the physical paper menu of **Delepe Café Restaurant** with a
stunning, smooth, mobile-first web menu opened by scanning a QR code.
It is also a **portfolio-grade showcase**: visual quality, motion design and code
quality must all be exceptional.

## Product type

Single-tenant digital menu + owner admin panel. **No ordering, no cart, no payments.**

## Users

| Actor | Description | Needs |
| --- | --- | --- |
| Guest customer | Scans QR, browses on phone (mostly low/mid Android, Iran network) | Fast, beautiful, readable menu; see availability & prices |
| Owner (admin) | Non-technical restaurant owner | Simple Persian panel: manage categories/products/prices/images/themes without fear |
| Developer | Maintains the repo, recovery access | CLI admin reset, clean architecture, docs |

## Core flows

1. **Browse**: open URL → animated header → sticky category tabs → scroll sections with
   scrollspy → product cards (image, name, ingredients, price, badges) → expand variants.
2. **Manage**: login → products/categories/settings → CRUD with drag-and-drop ordering,
   image upload (crop/rotate/compress), discount, availability → live phone-frame preview.

## In scope (v1)

- Public menu: tabs + scroll + scrollspy, horizontal cards, one image per product,
  variants (e.g. pizza sizes) with «از …» pricing + expandable list,
  discount (discounted price + active flag, products without variants only),
  predefined badges, unavailable mode (global: hide OR grayscale+badge),
  4 themes, RTL Persian.
- Admin: username/password login, change password, categories CRUD (2 levels,
  dnd reorder, delete-guard), products CRUD (dnd reorder, hard delete w/ confirm),
  image upload editor, settings (restaurant name, theme, unavailable mode),
  live preview in phone frame (unsaved draft) + «back to saved menu»,
  unsaved-changes warning, mobile-friendly panel.
- Ops: Docker Compose deployment, Caddy + TLS, backups, health endpoint, seed with the
  real Delepe menu (deterministic branded placeholders; optional photo download).

## Out of scope (explicit)

Digital ordering/cart/payment, search/filter/sort for customers, product detail page,
social links, contact/call/map buttons, print/download, banners/announcements,
SEO/analytics, opening-hours logic, about page, multi-tenant, QR generation tooling,
customer login, PWA offline, i18n (Persian only), product tags, chef's picks,
audit log, trash/restore, multiple admin roles (single role only).

**Anything not listed in "In scope" is out of scope. Do not add features.**

## Glossary

| Term | Meaning |
| --- | --- |
| Category | Menu section; exactly 2 levels (parent → children). Only **leaf** categories own products (BR-15) |
| Leaf category | A category with no children. Products are assigned to leaves only |
| Product | A menu item with name, description (ingredients), price, one image |
| Variant | A size/option of a product with its own absolute price (e.g. pizza small/large). When variants exist, product price = min(variant prices), auto-maintained (BR-13) |
| Badge | Predefined label: popular / new / spicy / vegetarian |
| Discount | Optional discounted price + active toggle; allowed only on products **without** variants (BR-14) |
| Theme | One of 4 curated visual themes applied via CSS variables (`<html data-theme>`) |
| Unavailable mode | Global setting: `HIDE` or `MUTED` (grayscale + «ناموجود» badge) |
| Draft state | Unsaved admin edits held in the client draft store, shown live in the phone-frame preview |
| Saved state | Last persisted menu; draft returns to it via «بازگشت به منوی ذخیره‌شده» |

## Success criteria

1. A first-time owner can add a product with image in < 2 minutes without training.
2. Public menu feels like a premium native app: smooth 60fps animations, no jank on
   mid-range Android.
3. Code passes strict lint/typecheck, unit + E2E cover critical flows, architecture
   layers have zero violations.
4. Site works fully inside Iran: all fonts/images/assets self-hosted at runtime;
   seed works fully offline.
