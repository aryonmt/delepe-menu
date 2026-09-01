# 04 · Data Model, Business Rules & Seed

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
  price           Int               // integer TOMAN
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
  id        String   @id @default(cuid())
  fileName  String
  mimeType  String
  width     Int
  height   Int
  path      String   @unique   // relative to storage root, content-addressed
  createdAt DateTime @default(now())
  product   Product?
}

model Settings {
  id              Int             @id @default(1)   // singleton row
  restaurantName  String
  theme           ThemeName       @default(WARM_HONEY)
  unavailableMode UnavailableMode @default(MUTED)
  updatedAt       DateTime        @updatedAt
}

model AdminUser {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## Business rules

| ID | Rule |
| --- | --- |
| BR-01 | Category depth ≤ 2. Creating a child under a category that already has a parent → `ValidationError` |
| BR-02 | Deleting a category with products or children → `CategoryNotEmptyError` (UI: Persian toast, no confirm shown) |
| BR-03 | Deleting a product is a hard delete after confirm dialog; its Media row + files are deleted too |
| BR-04 | `discountedPrice` must be > 0 and < `price` |
| BR-05 | Effective price = `discountActive && discountedPrice ? discountedPrice : price` |
| BR-06 | Variant prices are absolute. Public card shows `از {min(effective variant prices, base)}` when variants exist |
| BR-07 | Reorder commands receive an ordered id array; persistence writes 10/20/30… gaps |
| BR-08 | Public menu hides categories with zero visible products. `HIDE` removes unavailable products; `MUTED` renders them grayscale + «ناموجود» |
| BR-09 | Product name unique per category; category name unique per parent |
| BR-10 | Settings is a singleton (id = 1), always upserted |
| BR-11 | Upload: JPG/PNG/WebP by magic bytes, ≤ 5MB, 4:3 ratio enforced (±2% tolerance server-side) |
| BR-12 | Prices: positive integer tomans, ≤ 100,000,000 |

## Validation (Zod, application layer)

| Command | Key constraints |
| --- | --- |
| CreateCategory | name 1..60, parentId optional (depth check in use-case), sortOrder auto |
| UpdateCategory | same + id |
| DeleteCategory | id; guard BR-02 |
| ReorderCategories | `{ orderedIds: string[], parentId: string \| null }` |
| CreateProduct | name 1..120, description ≤ 500 optional, price BR-12, discount BR-04, badges array, categoryId, mediaId optional, variants[] (name 1..40, price BR-12) |
| UpdateProduct | same + id; replacing image deletes old media after success |
| DeleteProduct | id; BR-03 |
| ReorderProducts | `{ orderedIds: string[], categoryId }` |
| UpdateSettings | restaurantName 1..80, theme enum, unavailableMode enum |
| Login | username 1..40, password 1..128 |
| ChangePassword | current, next ≥ 8 chars |

## Price formatting (`lib/format/price.ts`)

Algorithm (Persian digits, «تومان»):

1. `thousands = floor(p/1000)`, `rem = p % 1000`
2. If `p >= 1_000_000`: `M = floor(p/1e6)`, `T = round((p % 1e6)/1000)` →
   `T == 0 ? "{M} میلیون تومان" : "{M} میلیون و {T} هزار تومان"`
3. Else if `rem == 0` → `"{thousands} هزار تومان"`
4. Else → `"{thousands}٫{d} هزار تومان"` where `d = trim(rem/1000, max 2 decimals)`
5. Variant prefix: `"از "` + result.

Unit-test exactly these cases:

| Input | Output |
| --- | --- |
| 130000 | ۱۳۰ هزار تومان |
| 90000 | ۹۰ هزار تومان |
| 125500 | ۱۲۵٫۵ هزار تومان |
| 1250000 | ۱ میلیون و ۲۵۰ هزار تومان |
| 1360000 | ۱ میلیون و ۳۶ هزار تومان |
| 75000 | ۷۵ هزار تومان |

## Seed data (REAL Delepe menu — transcribed from the physical menu)

Prices below are already in **toman** (menu numbers × 1000).
`sortOrder` = list order (10, 20, …). Two placeholder prices are marked *(owner must verify)*.

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

| name | price | notes |
| --- | --- | --- |
| اسپرسو | 130000 | |
| اسپرسو دبل | 160000 | |
| آمریکانو | 170000 | |
| لاته | 250000 | |
| کاپوچینو | 240000 | |
| موکا | 280000 | |
| کارامل ماکیاتو | 280000 | |

### نوشیدنی گرم / چای

| name | price | notes |
| --- | --- | --- |
| چای سیاه | 90000 | |
| چای ماسالا | 270000 | |
| چای کرک | 260000 | |
| چای باقلوا | 190000 | |

### نوشیدنی گرم / شکلات و شیر

| name | price | notes |
| --- | --- | --- |
| هات چاکلت | 270000 | |
| شیر کاکائو | 230000 | |
| شیر داغ | 120000 | |

### نوشیدنی سرد

| name | price | notes |
| --- | --- | --- |
| آیس آمریکانو | 180000 | |
| آیس لاته | 285000 | |
| آیس موکا | 320000 | |
| آیس کارامل | 320000 | |
| آفوگاتو | 280000 | NEW badge |

### آبمیوه و شیک / آبمیوه

| name | price | notes |
| --- | --- | --- |
| آب هویج | 200000 | |
| هویج بستنی | 300000 | |
| آب هندوانه | 240000 | |
| آب طالبی | 230000 | |
| طالبی بستنی | 320000 | |
| آب سیب | 240000 | |
| آب کرفس | 200000 | seed: `isAvailable=false` (demo MUTED) |
| شیرموز | 280000 | |
| شیرموز بستنی | 350000 | |
| موهیتو | 270000 | |
| لیموناد | 240000 | |

### آبمیوه و شیک / شیک و اسموتی

| name | price | notes |
| --- | --- | --- |
| شیک شکلات | 400000 | |
| شیک توت فرنگی | 400000 | |
| شیک اسپرسو | 400000 | |
| شیک نوتلا | 470000 | POPULAR |
| شیک وانیل | 400000 | |
| اسموتی توت فرنگی | 425000 | |
| اسموتی انبه | 460000 | NEW |
| بستنی اسکوپ | 75000 | |

### دسر و کیک

| name | price | notes |
| --- | --- | --- |
| کیک روز | 330000 | |
| کوکی بزرگ | 190000 | |
| کوکی متوسط | 115000 | seed discount: `discountedPrice=95000, discountActive=true` (demo) |
| باقلوا | 120000 | |

### پیش‌غذا و سالاد / پیش‌غذا

| name | price | notes |
| --- | --- | --- |
| سیب ساده | 328000 | |
| سیب با چدار | 485000 | |
| سیب سس قارچ | 510000 | |
| سیب مخصوص | 595000 | POPULAR |
| قارچ سوخاری | 500000 | VEGETARIAN |
| نان سیر | 680000 | VEGETARIAN |

### پیش‌غذا و سالاد / سالاد

| name | price | notes |
| --- | --- | --- |
| سالاد سزار گریل | 740000 | |
| سالاد سزار سوخاری | 820000 | |
| سالاد سزار میکس | 900000 | |

### غذای اصلی / برگر

| name | price | notes |
| --- | --- | --- |
| برگر ویژه دلِپ | 1250000 | POPULAR |
| برگر | 790000 | |
| چیز برگر | 860000 | |
| ماشروم برگر | 947000 | |
| دبل برگر | 1050000 | |
| دبل چیز برگر | 1100000 | |
| مرغ برگر | 685000 | |
| کریسپی | 680000 | |
| سوپریم | 710000 | |

### غذای اصلی / ساندویچ

| name | price | notes |
| --- | --- | --- |
| بمب دلِپ | 1350000 | POPULAR |
| رست بیف | 870000 | |
| بیکن | 610000 | |
| پپرونی | 520000 | SPICY |
| گوشت | 730000 | |
| مرغ | 680000 | |
| هات داگ تنوری | 550000 | |
| هات داگ تنوری با قارچ و پنیر | 650000 | |
| ژامبون تنوری | 600000 | |

### غذای اصلی / پیتزا (variants: سایز کوچک / سایز بزرگ)

| name | small | large | notes |
| --- | --- | --- | --- |
| پیتزا مخصوص | 750000 | 965000 | POPULAR |
| پیتزا رست بیف | 990000 | 1300000 | |
| پیتزا گوشت و قارچ | 900000 | 1200000 | |
| پیتزا پپرونی | 790000 | 990000 | SPICY |
| پیتزا اسپیشیال | 970000 | 1280000 | |
| پیتزا مرغ و قارچ | 800000 | 1050000 | |
| پیتزا قارچ و پنیر | 620000 | 830000 | VEGETARIAN |
| پیتزا مارگاریتا | 550000 | 750000 | VEGETARIAN |
| پیتزا چهار فصل | 1360000 | — | base price only (no variants) |
| پیتزا سبزیجات | 690000 | 920000 | VEGETARIAN |

### غذای اصلی / سوخاری

| name | price | notes |
| --- | --- | --- |
| فیله مرغ | 750000 | |
| ناگت مرغ | 500000 | |
| شنیتسل مرغ | 600000 | |
| کتف و بال | 650000 | |

### غذای اصلی / بشقاب

| name | price | description | notes |
| --- | --- | --- | --- |
| پنه آلفردو | 850000 | پنه، سس آلفردو، مرغ گریل | |
| بشقاب سلامت | 780000 | (سینه مرغ + بروکلی + قارچ) (کاهو + گوجه گیلاسی + هویج) (زیتون + ذرت + پنیر کبی) | *(owner must verify price)* |
| کمبو | 450000 | نوشابه + سیب | *(owner must verify price)* |

## Seed behavior

1. `prisma/seed.ts` upserts settings (`restaurantName: "دلِپ"`), one admin from env,
   the category tree, and all products above with Persian one-line ingredient
   descriptions authored by the agent.
2. **Images**: each product has an `imageKeyword` (English, e.g. `espresso shot`,
   `chocolate milkshake`, `pepperoni pizza`). The seed script downloads a curated
   CC0/Unsplash CDN URL per keyword into `storage/uploads/seed/` (concurrency 8,
   cached on disk). If the network fails, it generates a branded gradient SVG
   placeholder with the category icon so the app always seeds offline.
3. Seed is idempotent (`upsert` by category/name; skip existing downloads).