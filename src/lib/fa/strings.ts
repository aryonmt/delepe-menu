/** All user-facing Persian copy. Components import keys — never hardcode UI strings. */
export const strings = {
  meta: {
    title: "دلِپ · منوی دیجیتال",
    description: "منوی دیجیتال کافه‌رستوران دلِپ",
  },
  public: {
    emptyTitle: "منو به‌زودی تکمیل می‌شود",
    emptyHint: "به‌زودی فهرست غذاها و نوشیدنی‌ها اینجا می‌آید.",
    footer: "دلِپ · منوی دیجیتال",
    homeLink: "بازگشت به منو",
  },
  errors: {
    notFoundTitle: "صفحه پیدا نشد",
    notFoundBody: "این صفحه وجود ندارد یا جابه‌جا شده است.",
    genericTitle: "مشکلی پیش آمد",
    genericBody: "لطفاً دوباره تلاش کنید.",
    retry: "تلاش دوباره",
    domain: {
      NOT_FOUND: "مورد نظر پیدا نشد",
      VALIDATION: "اطلاعات واردشده نامعتبر است",
      CATEGORY_NOT_EMPTY: "ابتدا محصولات این دسته را منتقل کنید",
      CATEGORY_HAS_PRODUCTS: "ابتدا محصولات این دسته را منتقل کنید",
      DEPTH_EXCEEDED: "عمق دسته‌بندی نمی‌تواند بیش از دو سطح باشد",
      DUPLICATE_NAME: "این نام از قبل استفاده شده است",
      INVALID_DISCOUNT: "قیمت با تخفیف باید کمتر از قیمت اصلی باشد",
      DISCOUNT_WITH_VARIANTS: "برای محصول دارای تنوع نمی‌توان تخفیف گذاشت",
      NOT_LEAF_CATEGORY: "محصول فقط در دستهٔ بدون زیرشاخه ثبت می‌شود",
      INVALID_REORDER: "ترتیب ارسال‌شده نامعتبر است",
      INVALID_UPLOAD: "فایل تصویر نامعتبر است",
      UNAUTHORIZED: "نشست شما معتبر نیست",
      RATE_LIMITED: "تعداد تلاش‌ها بیش از حد مجاز است؛ ۱۵ دقیقه دیگر تلاش کنید",
    },
  },
} as const;

export type StringKey = typeof strings;
