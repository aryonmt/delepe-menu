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
  },
} as const;

export type StringKey = typeof strings;
