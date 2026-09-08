# 04 · Data Model, Business Rules, Contracts & Seed

## Prisma schema (source of truth)

```prisma
generator client { provider = "prisma-client-js" }
datasource db    { provider = "postgresql"; url = env("DATABASE_URL") }

enum BadgeKind       { POPULAR NEW SPICY VEGETARIAN }
enum ThemeName       { WARM_HONEY MIDNIGHT_GOLD IVORY_MINIMAL DEEP_EMERALD }
enum UnavailableMode { HIDE MUTED }

model Category {
  id        String    @id @default(cuid())
  name      String
  parentId  String?
  sortOrder Int
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  parent    Category?  @relation("CategoryTree", fields: [parentId], references: [id], onDelete: Restrict)
  children  Category[] @relation("CategoryTree")
  products  Product[]

  @@unique([parentId, name])
  @@index([parentId, sortOrder])
}

model Product {
  id              String            @id @default(cuid())
  name            String
  description     String?
  price           Int               // integer TOMAN; auto = min(variants) when variants exist (BR-13)
  discountedPrice Int?
  discountActive  Boolean           @default(false)
  isAvailable     Boolean           @default(true)
  sortOrder       Int
  badges          BadgeKind[]
  categoryId      String
  mediaId         String?           @unique
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  category        Category          @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  media           Media?            @relation(fields: [mediaId], references: [id], onDelete: SetNull)
  variants        ProductVariant[]

  @@unique([categoryId, name])
  @@index([categoryId, sortOrder])
}

model ProductVariant {
  id        String  @id @default(cuid())
  productId String
  name      String
  price     Int
  sortOrder Int
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([productId, name])
  @@index([productId, sortOrder])
}

model Media {
  id            String   @id @default(cuid())
  fileName      String
  mimeType      String
  width         Int
  height        Int
  dominantColor String                 // hex "#RRGGBB", from Sharp stats at upload
  path          String   @unique       // "uploads/{id}.jpg"; variants derived: uploads/{id}_{320|640|960}.webp
  createdAt     DateTime @default(now())
  product       Product?
}

model Settings {
  id               Int             @id @default(1)   // singleton row
  restaurantName   String
  theme            ThemeName       @default(WARM_HONEY)
  unavailableMode  UnavailableMode @default(MUTED)
  tickerProductIds String[]        @default([])      // curated hero-ticker order; empty = auto
  updatedAt        DateTime        @updatedAt
}

model AdminUser {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt()
}
```

> **Note on `@@unique([parentId, name])`**: PostgreSQL treats NULLs as distinct in
> unique constraints, so this index does **not** prevent duplicate top-level
> category names. BR-09 is therefore enforced in the use-case layer (query
> siblings before insert/update), not trusted to the database.

## Business rules

| ID | Rule |
| --- | --- |
| BR-01 | Category depth ≤ 2. Creating a child under a category that already has a parent → `ValidationError` |
| BR-02 | Deleting a category with products or children → `CategoryNotEmptyError` (UI: Persian toast, no confirm shown) |
| BR-03 | Deleting a product is a hard delete after confirm dialog; its Media row + the original (whichever of jpg/png/webp exists) + the three pre-generated WebP variants are deleted after the DB transaction succeeds |
| BR-04 | `discountedPrice` must be ≥ 1000 and < `price` |
| BR-05 | Effective price = `discountActive && discountedPrice ? discountedPrice : price` (variants never discounted, BR-14) |
| BR-06 | When variants exist, the public card shows «از » + `formatPrice(price)` where `price` = min(variant prices) per BR-13, plus an expand chevron |
| BR-07 | Reorder commands receive an ordered id array; persistence writes 10/20/30… gaps |
| BR-08 | Public menu hides categories with zero visible products. `HIDE` removes unavailable products server-side; `MUTED` renders them grayscale + «امروز تموم شد» |
| BR-09 | Product name unique per category; category name unique per parent — **enforced in use-cases** (see schema note) |
| BR-10 | Settings is a singleton (id = 1), always upserted |
| BR-11 | Upload: JPG/PNG/WebP by magic bytes, ≤ 5MB, 1:1 ratio enforced (±2% tolerance server-side) |
| BR-12 | Prices: integer tomans, **1,000 ≤ p ≤ 100,000,000** |
| BR-13 | Products with ≥ 1 variant: `price` is system-maintained = `min(variant prices)`, recomputed by use-cases on every variant add/update/remove/reorder. The form disables manual price input when variants exist. Products without variants: `price` is manual |
| BR-14 | Discount (`discountedPrice`/`discountActive`) is allowed only when `variants.length === 0`. Use-cases reject otherwise; the form hides the discount section when variants exist |
| BR-15 | Products belong to **leaf** categories only. CreateProduct/UpdateProduct reject a `categoryId` whose category has children → `ValidationError` |
| BR-16 | Creating a child under a category that directly owns products → `ValidationError` («ابتدا محصولات این دسته را منتقل کنید») — prevents invisible products |

## Application contracts (DTOs)

All DTOs are plain TS types in `application/dtos.ts`. Prisma types never leak.

```ts
type MediaDto = { id: string; dominantColor: string; width: number; height: number };
type VariantDto = { id: string; name: string; price: number; sortOrder: number };
type ProductDto = {
  id: string; name: string; description: string | null;
  price: number;                    // final base price (BR-13 applied)
  discountedPrice: number | null; discountActive: boolean;
  isAvailable: boolean; badges: BadgeKind[]; sortOrder: number;
  categoryId: string; variants: VariantDto[]; media: MediaDto | null;
};
type CategoryDto = {
  id: string; name: string; parentId: string | null; sortOrder: number;
  children: CategoryDto[]; products: ProductDto[];
};
type SettingsDto = { restaurantName: string; theme: ThemeName; unavailableMode: UnavailableMode };
type AdminMenuDto  = { settings: SettingsDto; categories: CategoryDto[] };  // unfiltered
type PublicMenuDto = { settings: SettingsDto; categories: CategoryDto[] };  // BR-08 applied
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; fa: string } };
```

`application/mappers/to-public-menu.ts` exports the **pure** function
`toPublicMenu(input: AdminMenuDto): PublicMenuDto` — applies BR-08 (HIDE filter /
MUTED passthrough, empty-category pruning). Used by `GetPublicMenuUseCase`
(server) and by the admin preview (client, on draft data). Unit-tested.

## Use-case contracts

| Use-case | Input | Output | Throws |
| --- | --- | --- | --- |
| GetPublicMenu | — | PublicMenuDto (via mapper) | — |
| GetAdminMenu | — | AdminMenuDto (unfiltered) | — |
| ListCategories / ListProducts | — | CategoryDto[] / ProductDto[] | — |
| CreateCategory | name, parentId? | CategoryDto | ValidationError (BR-01, BR-09, BR-16) |
| UpdateCategory | id, name, parentId? | CategoryDto | NotFoundError, ValidationError (BR-01, BR-09, BR-16) |
| DeleteCategory | id | void | NotFoundError, CategoryNotEmptyError (BR-02) |
| ReorderCategories | orderedIds[], parentId \| null | void | ValidationError (BR-07) |
| GetProduct | id | ProductDto | NotFoundError |
| CreateProduct | per CreateProduct schema | ProductDto | ValidationError (BR-04, 09, 12, 13, 14, 15) |
| UpdateProduct | id + same | ProductDto | NotFoundError + same rules; replacing image deletes old media after success |
| DeleteProduct | id | void | NotFoundError; BR-03 media cleanup |
| ReorderProducts | orderedIds[], categoryId | void | ValidationError (BR-07) |
| UploadMedia | file bytes + meta | `{ mediaId, dominantColor, width, height }` | ValidationError (BR-11), UnauthorizedError |
| DeleteMedia | mediaId | void | NotFoundError |
restaurantName, theme, unavailableMode, tickerProductIds? (ordered ids; omitted = preserve existing)
| Login | username, password | session cookie set | ValidationError, RateLimitError (doc 10) |
| Logout / ChangePassword | — / current, next | void | UnauthorizedError, ValidationError |
| VerifySession | cookie | `{ adminId }` | UnauthorizedError |

## Validation (Zod, application layer)

| Command | Key constraints |
| --- | --- |
| CreateCategory | name 1..60, parentId optional (depth check in use-case), sortOrder auto |
| UpdateCategory | same + id |
| DeleteCategory | id; guard BR-02 |
| ReorderCategories | `{ orderedIds: string[], parentId: string \| null }` |
| CreateProduct | name 1..120, description ≤ 500 optional, price BR-12 (ignored when variants present, BR-13), discount BR-04 + BR-14, badges array, categoryId (leaf, BR-15), mediaId optional, variants[] (name 1..40, price BR-12) |
| UpdateProduct | same + id; replacing image deletes old media after success |
| DeleteProduct | id; BR-03 |
| ReorderProducts | `{ orderedIds: string[], categoryId }` |
| UpdateSettings | restaurantName 1..80, theme enum, unavailableMode enum |
| Login | username 1..40, password 1..128 |
| ChangePassword | current, next ≥ 8 chars |

All numeric inputs arrive as strings that may contain Persian digits; the form
layer normalizes via `lib/format/digits.ts` before Zod parses (doc 03 conventions).

## Price formatting (`lib/format/price.ts`)

Algorithm (Persian digits, «تومان»). Precondition: `1_000 ≤ p ≤ 100_000_000` (BR-12).

1. `thousands = floor(p/1000)`, `rem = p % 1000`
2. If `p >= 1_000_000`: `M = floor(p/1e6)`, `T = round((p % 1e6)/1000)`;
   **carry**: if `T == 1000` → `M += 1; T = 0`. Then
   `T == 0 ? "{M} میلیون تومان" : "{M} میلیون و {T} هزار تومان"`
3. Else if `rem == 0` → `"{thousands} هزار تومان"`
4. Else → `"{thousands}٫{d} هزار تومان"` where `d = trim(rem/1000, max 2 decimals)`
5. Variant prefix: `"از "` + result.

Unit-test exactly these cases (golden table):

| Input | Output |
| --- | --- |
| 1000 | ۱ هزار تومان |
| 75000 | ۷۵ هزار تومان |
| 90000 | ۹۰ هزار تومان |
| 125500 | ۱۲۵٫۵ هزار تومان |
| 130000 | ۱۳۰ هزار تومان |
| 1250000 | ۱ میلیون و ۲۵۰ هزار تومان |
| 1360000 | ۱ میلیون و ۳۶۰ هزار تومان |
| 1000000 | ۱ میلیون تومان |
| 1999500 | ۲ میلیون تومان (carry) |

## Seed data (REAL Delepe menu — transcribed from the physical menu)

Prices are in **toman**. `sortOrder` = list order (10, 20, …).
Two placeholder prices are marked *(owner must verify)*.
Names use ZWNJ (نیم‌فاصله) per doc 05. `description` and `imageKeyword` are
authored here — the seed copies them verbatim (no agent invention at seed time).
The products, categories, prices, badges, and availability below are **sample
data** used to demonstrate the UI; in the real system they are Admin-managed
content. Layout logic must never depend on their names, counts, or composition.

### Category tree

| Top-level (tab) | Children |
| --- | --- |
| نوشیدنی گرم | قهوه · چای · شکلات و شیر |
| نوشیدنی سرد | — |
| آبمیوه و شیک | آبمیوه · شیک و اسموتی |
| دسر و کیک | — |
| پیش‌غذا و سالاد | پیش‌غذا · سالاد |
| غذای اصلی | برگر · ساندویچ · پیتزا · سوخاری · بشقاب |

### نوشیدنی گرم / قهوه

| name | price | description | imageKeyword |
| --- | --- | --- | --- |
| اسپرسو | 130000 | عصاره‌ی خالص قهوه‌ی تازه‌آسیاب‌شده | espresso shot |
| اسپرسو دبل | 160000 | دو شات اسپرسوی غلیظ | double espresso |
| آمریکانو | 170000 | اسپرسو رقیق‌شده با آب داغ | americano coffee |
| لاته | 250000 | اسپرسو با شیر بخارداده و فوم لطیف | caffe latte |
| کاپوچینو | 240000 | اسپرسو، شیر بخارداده و فوم فراوان | cappuccino |
| موکا | 280000 | اسپرسو، شکلات و شیر بخارداده | mocha coffee |
| کارامل ماکیاتو | 280000 | اسپرسو، شیر و سس کارامل | caramel macchiato |

### نوشیدنی گرم / چای

| name | price | description | imageKeyword |
| --- | --- | --- | --- |
| چای سیاه | 90000 | چای سیاه لاهیجان دم‌کشیده | black tea |
| چای ماسالا | 270000 | چای با ادویه‌های گرم و شیر | masala chai |
| چای کرک | 260000 | چای غلیظ با شیر پرچرب | karak tea |
| چای باقلوا | 190000 | چای با عطر باقلوا و مغزها | tea with baklava |

### نوشیدنی گرم / شکلات و شیر

| name | price | description | imageKeyword |
| --- | --- | --- | --- |
| هات چاکلت | 270000 | شکلات داغ غلیظ با شیر | hot chocolate |
| شیر کاکائو | 230000 | شیر گرم با کاکائوی خالص | cocoa milk |
| شیر داغ | 120000 | شیر تازه‌ی بخارداده | steamed milk |

### نوشیدنی سرد

| name | price | description | imageKeyword | notes |
| --- | --- | --- | --- | --- |
| آیس آمریکانو | 180000 | اسپرسو با آب سرد و یخ | iced americano | |
| آیس لاته | 285000 | اسپرسو، شیر سرد و یخ | iced latte | |
| آیس موکا | 320000 | اسپرسو، شکلات، شیر سرد و یخ | iced mocha | |
| آیس کارامل | 320000 | اسپرسو، شیر سرد و سس کارامل | iced caramel coffee | |
| آفوگاتو | 280000 | بستنی وانیلی غرق در اسپرسو | affogato | NEW badge |

### آبمیوه و شیک / آبمیوه

| name | price | description | imageKeyword | notes |
| --- | --- | --- | --- | --- |
| آب هویج | 200000 | آب هویج تازه‌ی طبیعی | carrot juice | |
| هویج‌بستنی | 300000 | آب هویج با بستنی وانیلی | carrot juice ice cream | |
| آب هندوانه | 240000 | آب هندوانه‌ی تازه | watermelon juice | |
| آب طالبی | 230000 | آب طالبی رسیده | melon juice | |
| طالبی‌بستنی | 320000 | آب طالبی با بستنی وانیلی | melon smoothie | |
| آب سیب | 240000 | آب سیب تازه | apple juice | |
| آب کرفس | 200000 | آب کرفس طبیعی | celery juice | seed: `isAvailable=false` (demo MUTED) |
| شیرموز | 280000 | شیر و موز تازه | banana milk | |
| شیرموز‌بستنی | 350000 | شیر، موز و بستنی وانیلی | banana milkshake | |
| موهیتو | 270000 | نعناع تازه، لیمو و سودا | mojito | |
| لیموناد | 240000 | لیموی تازه و سودا | lemonade | |

### آبمیوه و شیک / شیک و اسموتی

| name | price | description | imageKeyword | notes |
| --- | --- | --- | --- | --- |
| شیک شکلات | 400000 | شیر، بستنی و شکلات | chocolate milkshake | |
| شیک توت‌فرنگی | 400000 | شیر، بستنی و توت‌فرنگی تازه | strawberry milkshake | |
| شیک اسپرسو | 400000 | شیر، بستنی و شات اسپرسو | coffee milkshake | |
| شیک نوتلا | 470000 | شیر، بستنی و نوتلا | nutella milkshake | POPULAR |
| شیک وانیل | 400000 | شیر و بستنی وانیلی | vanilla milkshake | |
| اسموتی توت‌فرنگی | 425000 | توت‌فرنگی، موز و ماست | strawberry smoothie | |
| اسموتی انبه | 460000 | انبه‌ی رسیده و ماست | mango smoothie | NEW |
| بستنی اسکوپ | 75000 | یک اسکوپ بستنی وانیلی | ice cream scoop | |

### دسر و کیک

| name | price | description | imageKeyword | notes |
| --- | --- | --- | --- | --- |
| کیک روز | 330000 | کیک تازه‌ی روزانه | cake slice | |
| کوکی بزرگ | 190000 | کوکی شکلاتی بزرگ | chocolate chip cookie | |
| کوکی متوسط | 115000 | کوکی شکلاتی تازه | cookie | seed discount: `discountedPrice=95000, discountActive=true` (demo) |
| باقلوا | 120000 | باقلوای سنتی با پسته | baklava | |

### پیش‌غذا و سالاد / پیش‌غذا

| name | price | description | imageKeyword | notes |
| --- | --- | --- | --- | --- |
| سیب ساده | 328000 | سیب‌زمینی سرخ‌کرده | french fries | |
| سیب با چدار | 485000 | سیب‌زمینی با پنیر چدار | fries with cheese | |
| سیب سس قارچ | 510000 | سیب‌زمینی با سس قارچ | fries mushroom sauce | |
| سیب مخصوص | 595000 | سیب‌زمینی با سس مخصوص دلِپ | loaded fries | POPULAR |
| قارچ سوخاری | 500000 | قارچ تازه در خمیر سوخاری | breaded mushrooms | VEGETARIAN |
| نان سیر | 680000 | نان تازه با کره‌ی سیر | garlic bread | VEGETARIAN |

### پیش‌غذا و سالاد / سالاد

| name | price | description | imageKeyword |
| --- | --- | --- | --- |
| سالاد سزار گریل | 740000 | کاهو، مرغ گریل و سس سزار | caesar salad grilled chicken |
| سالاد سزار سوخاری | 820000 | کاهو، مرغ سوخاری و سس سزار | caesar salad crispy chicken |
| سالاد سزار میکس | 900000 | کاهو، مرغ گریل و سوخاری با سس سزار | caesar salad |

### غذای اصلی / برگر

| name | price | description | imageKeyword | notes |
| --- | --- | --- | --- | --- |
| برگر ویژه دلِپ | 1250000 | گوشت تازه با سس مخصوص دلِپ | gourmet burger | POPULAR |
| برگر | 790000 | گوشت گوساله، کاهو و گوجه | hamburger | |
| چیز برگر | 860000 | برگر با پنیر چدار | cheeseburger | |
| ماشروم برگر | 947000 | برگر با قارچ تازه | mushroom burger | |
| دبل برگر | 1050000 | دو لایه گوشت گوساله | double burger | |
| دبل چیز برگر | 1100000 | دبل برگر با دو لایه پنیر | double cheeseburger | |
| مرغ برگر | 685000 | سینه‌ی مرغ گریل | chicken burger | |
| کریسپی | 680000 | مرغ سوخاری ترد | crispy chicken burger | |
| سوپریم | 710000 | مرغ سوخاری با سس مخصوص | chicken supreme burger | |

### غذای اصلی / ساندویچ

| name | price | description | imageKeyword | notes |
| --- | --- | --- | --- | --- |
| بمب دلِپ | 1350000 | ساندویچ مخصوص دلِپ | special sandwich | POPULAR |
| رست بیف | 870000 | رست‌بیف گوساله با قارچ | roast beef sandwich | |
| بیکن | 610000 | بیکن گوساله و پنیر | bacon sandwich | |
| پپرونی | 520000 | پپرونی تند و پنیر | pepperoni sandwich | SPICY |
| گوشت | 730000 | گوشت گوساله و قارچ | beef sandwich | |
| مرغ | 680000 | مرغ گریل و قارچ | chicken sandwich | |
| هات داگ تنوری | 550000 | هات‌داگ در نان تنوری | hot dog | |
| هات داگ تنوری با قارچ و پنیر | 650000 | هات‌داگ با قارچ و پنیر | hot dog mushroom cheese | |
| ژامبون تنوری | 600000 | ژامبون در نان تنوری | ham sandwich | |

### غذای اصلی / پیتزا (variants: سایز کوچک / سایز بزرگ)

| name | small | large | description | imageKeyword | notes |
| --- | --- | --- | --- | --- | --- |
| پیتزا مخصوص | 750000 | 965000 | سس، پنیر و مخلفات مخصوص | special pizza | POPULAR |
| پیتزا رست بیف | 990000 | 1300000 | رست‌بیف و پنیر موزارلا | roast beef pizza | |
| پیتزا گوشت و قارچ | 900000 | 1200000 | گوشت، قارچ و پنیر | beef mushroom pizza | |
| پیتزا پپرونی | 790000 | 990000 | پپرونی تند و پنیر | pepperoni pizza | SPICY |
| پیتزا اسپیشیال | 970000 | 1280000 | مخلفات ویژه و پنیر | supreme pizza | |
| پیتزا مرغ و قارچ | 800000 | 1050000 | مرغ، قارچ و پنیر | chicken mushroom pizza | |
| پیتزا قارچ و پنیر | 620000 | 830000 | قارچ تازه و پنیر موزارلا | mushroom cheese pizza | VEGETARIAN |
| پیتزا مارگاریتا | 550000 | 750000 | سس گوجه، موزارلا و ریحان | margherita pizza | VEGETARIAN |
| پیتزا چهار فصل | — | — | چهار طعم در یک پیتزا | four seasons pizza | base price 1360000, **no variants** |
| پیتزا سبزیجات | 690000 | 920000 | سبزیجات تازه و پنیر | vegetable pizza | VEGETARIAN |

### غذای اصلی / سوخاری

| name | price | description | imageKeyword |
| --- | --- | --- | --- |
| فیله مرغ | 750000 | فیله‌ی مرغ سوخاری | fried chicken fillet |
| ناگت مرغ | 500000 | ناگت مرغ ترد | chicken nuggets |
| شنیتسل مرغ | 600000 | شنیتسل مرغ سوخاری | chicken schnitzel |
| کتف و بال | 650000 | کتف و بال مرغ سوخاری | fried chicken wings |

### غذای اصلی / بشقاب

| name | price | description | imageKeyword | notes |
| --- | --- | --- | --- | --- |
| پنه آلفردو | 850000 | پنه، سس آلفردو، مرغ گریل | penne alfredo | |
| بشقاب سلامت | 780000 | (سینه مرغ + بروکلی + قارچ) (کاهو + گوجه گیلاسی + هویج) (زیتون + ذرت + پنیر کبدی) | healthy plate | *(owner must verify price)* |
| کمبو | 450000 | نوشابه + سیب | combo drink fries | *(owner must verify price)* |

## Seed behavior

1. `prisma/seed.ts` upserts settings (`restaurantName: "دِ‌لِ‌پِ"` — the exact
   brand string per doc 05), the category tree, and all products above with the
   exact `description` / `imageKeyword` values from these tables. Sample product
   names containing the brand (e.g. «بمب دلِپ») are Admin-managed content and are
   intentionally left unchanged.
2. **Admin bootstrap**: an admin is created from `ADMIN_USERNAME`/`ADMIN_PASSWORD`
   **only when `AdminUser` count = 0** (idempotent; re-seeding never resets the
   owner's password).
3. **Images (deterministic, ADR-10)**: by default the seed rasterizes a branded
   SVG placeholder per product («پاتوق»-hued gradient + product initial + category
   name; no emoji glyphs) into `uploads/` (not `uploads/seed/`). With
   `SEED_DOWNLOAD_IMAGES=true` it downloads curated food photography from the
   fixed keyword→URL map (ADR-10), at seed time only, through the optimizer into
   self-hosted storage; any failure falls back to the SVG for that product. These
   downloads are temporary development stand-ins — the owner's real product
   photography replaces them per-media later with no layout change. E2E never
   depends on downloaded photos. If a product's original file is missing, the
   old Media row and its files (`deleteAll`) are removed before a new one is created.
4. Seed is idempotent (`upsert` by category/name; skip existing files).