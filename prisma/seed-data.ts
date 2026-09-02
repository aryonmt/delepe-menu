export type SeedProduct = {
  name: string;
  price?: number;
  small?: number;
  large?: number;
  description: string;
  imageKeyword: string;
  badges?: ("POPULAR" | "NEW" | "SPICY" | "VEGETARIAN")[];
  isAvailable?: boolean;
  discountedPrice?: number | null;
  discountActive?: boolean;
};

export type SeedGroup = { category: string; parent: string | null; products: SeedProduct[] };

export const groups: SeedGroup[] = [
  {
    category: "قهوه",
    parent: "نوشیدنی گرم",
    products: [
      { name: "اسپرسو", price: 130000, description: "عصاره‌ی خالص قهوه‌ی تازه‌آسیاب‌شده", imageKeyword: "espresso shot" },
      { name: "اسپرسو دبل", price: 160000, description: "دو شات اسپرسوی غلیظ", imageKeyword: "double espresso" },
      { name: "آمریکانو", price: 170000, description: "اسپرسو رقیق‌شده با آب داغ", imageKeyword: "americano coffee" },
      { name: "لاته", price: 250000, description: "اسپرسو با شیر بخارداده و فوم لطیف", imageKeyword: "caffe latte" },
      { name: "کاپوچینو", price: 240000, description: "اسپرسو، شیر بخارداده و فوم فراوان", imageKeyword: "cappuccino" },
      { name: "موکا", price: 280000, description: "اسپرسو، شکلات و شیر بخارداده", imageKeyword: "mocha coffee" },
      { name: "کارامل ماکیاتو", price: 280000, description: "اسپرسو، شیر و سس کارامل", imageKeyword: "caramel macchiato" },
    ],
  },
  {
    category: "چای",
    parent: "نوشیدنی گرم",
    products: [
      { name: "چای سیاه", price: 90000, description: "چای سیاه لاهیجان دم‌کشیده", imageKeyword: "black tea" },
      { name: "چای ماسالا", price: 270000, description: "چای با ادویه‌های گرم و شیر", imageKeyword: "masala chai" },
      { name: "چای کرک", price: 260000, description: "چای غلیظ با شیر پرچرب", imageKeyword: "karak tea" },
      { name: "چای باقلوا", price: 190000, description: "چای با عطر باقلوا و مغزها", imageKeyword: "tea with baklava" },
    ],
  },
  {
    category: "شکلات و شیر",
    parent: "نوشیدنی گرم",
    products: [
      { name: "هات چاکلت", price: 270000, description: "شکلات داغ غلیظ با شیر", imageKeyword: "hot chocolate" },
      { name: "شیر کاکائو", price: 230000, description: "شیر گرم با کاکائوی خالص", imageKeyword: "cocoa milk" },
      { name: "شیر داغ", price: 120000, description: "شیر تازه‌ی بخارداده", imageKeyword: "steamed milk" },
    ],
  },
  {
    category: "نوشیدنی سرد",
    parent: null,
    products: [
      { name: "آیس آمریکانو", price: 180000, description: "اسپرسو با آب سرد و یخ", imageKeyword: "iced americano" },
      { name: "آیس لاته", price: 285000, description: "اسپرسو، شیر سرد و یخ", imageKeyword: "iced latte" },
      { name: "آیس موکا", price: 320000, description: "اسپرسو، شکلات، شیر سرد و یخ", imageKeyword: "iced mocha" },
      { name: "آیس کارامل", price: 320000, description: "اسپرسو، شیر سرد و سس کارامل", imageKeyword: "iced caramel coffee" },
      { name: "آفوگاتو", price: 280000, description: "بستنی وانیلی غرق در اسپرسو", imageKeyword: "affogato", badges: ["NEW"] },
    ],
  },
  {
    category: "آبمیوه",
    parent: "آبمیوه و شیک",
    products: [
      { name: "آب هویج", price: 200000, description: "آب هویج تازه‌ی طبیعی", imageKeyword: "carrot juice" },
      { name: "هویج‌بستنی", price: 300000, description: "آب هویج با بستنی وانیلی", imageKeyword: "carrot juice ice cream" },
      { name: "آب هندوانه", price: 240000, description: "آب هندوانه‌ی تازه", imageKeyword: "watermelon juice" },
      { name: "آب طالبی", price: 230000, description: "آب طالبی رسیده", imageKeyword: "melon juice" },
      { name: "طالبی‌بستنی", price: 320000, description: "آب طالبی با بستنی وانیلی", imageKeyword: "melon smoothie" },
      { name: "آب سیب", price: 240000, description: "آب سیب تازه", imageKeyword: "apple juice" },
      { name: "آب کرفس", price: 200000, description: "آب کرفس طبیعی", imageKeyword: "celery juice", isAvailable: false },
      { name: "شیرموز", price: 280000, description: "شیر و موز تازه", imageKeyword: "banana milk" },
      { name: "شیرموز‌بستنی", price: 350000, description: "شیر، موز و بستنی وانیلی", imageKeyword: "banana milkshake" },
      { name: "موهیتو", price: 270000, description: "نعناع تازه، لیمو و سودا", imageKeyword: "mojito" },
      { name: "لیموناد", price: 240000, description: "لیمو‌ی تازه و سودا", imageKeyword: "lemonade" },
    ],
  },
  {
    category: "شیک و اسموتی",
    parent: "آبمیوه و شیک",
    products: [
      { name: "شیک شکلات", price: 400000, description: "شیر، بستنی و شکلات", imageKeyword: "chocolate milkshake" },
      { name: "شیک توت‌فرنگی", price: 400000, description: "شیر، بستنی و توت‌فرنگی تازه", imageKeyword: "strawberry milkshake" },
      { name: "شیک اسپرسو", price: 400000, description: "شیر، بستنی و شات اسپرسو", imageKeyword: "coffee milkshake" },
      { name: "شیک نوتلا", price: 470000, description: "شیر، بستنی و نوتلا", imageKeyword: "nutella milkshake", badges: ["POPULAR"] },
      { name: "شیک وانیل", price: 400000, description: "شیر و بستنی وانیلی", imageKeyword: "vanilla milkshake" },
      { name: "اسموتی توت‌فرنگی", price: 425000, description: "توت‌فرنگی، موز و ماست", imageKeyword: "strawberry smoothie" },
      { name: "اسموتی انبه", price: 460000, description: "انبه‌ی رسیده و ماست", imageKeyword: "mango smoothie", badges: ["NEW"] },
      { name: "بستنی اسکوپ", price: 75000, description: "یک اسکوپ بستنی وانیلی", imageKeyword: "ice cream scoop" },
    ],
  },
  {
    category: "دسر و کیک",
    parent: null,
    products: [
      { name: "کیک روز", price: 330000, description: "کیک تازه‌ی روزانه", imageKeyword: "cake slice" },
      { name: "کوکی بزرگ", price: 190000, description: "کوکی شکلاتی بزرگ", imageKeyword: "chocolate chip cookie" },
      { name: "کوکی متوسط", price: 115000, description: "کوکی شکلاتی تازه", imageKeyword: "cookie", discountedPrice: 95000, discountActive: true },
      { name: "باقلوا", price: 120000, description: "باقلوای سنتی با پسته", imageKeyword: "baklava" },
    ],
  },
  {
    category: "پیش‌غذا",
    parent: "پیش‌غذا و سالاد",
    products: [
      { name: "سیب ساده", price: 328000, description: "سیب‌زمینی سرخ‌کرده", imageKeyword: "french fries" },
      { name: "سیب با چدار", price: 485000, description: "سیب‌زمینی با پنیر چدار", imageKeyword: "fries with cheese" },
      { name: "سیب سس قارچ", price: 510000, description: "سیب‌زمینی با سس قارچ", imageKeyword: "fries mushroom sauce" },
      { name: "سیب مخصوص", price: 595000, description: "سیب‌زمینی با سس مخصوص دلِپ", imageKeyword: "loaded fries", badges: ["POPULAR"] },
      { name: "قارچ سوخاری", price: 500000, description: "قارچ تازه در خمیر سوخاری", imageKeyword: "breaded mushrooms", badges: ["VEGETARIAN"] },
      { name: "نان سیر", price: 680000, description: "نان تازه با کره‌ی سیر", imageKeyword: "garlic bread", badges: ["VEGETARIAN"] },
    ],
  },
  {
    category: "سالاد",
    parent: "پیش‌غذا و سالاد",
    products: [
      { name: "سالاد سزار گریل", price: 740000, description: "کاهو، مرغ گریل و سس سزار", imageKeyword: "caesar salad grilled chicken" },
      { name: "سالاد سزار سوخاری", price: 820000, description: "کاهو، مرغ سوخاری و سس سزار", imageKeyword: "caesar salad crispy chicken" },
      { name: "سالاد سزار میکس", price: 900000, description: "کاهو، مرغ گریل و سوخاری با سس سزار", imageKeyword: "caesar salad" },
    ],
  },
  {
    category: "برگر",
    parent: "غذای اصلی",
    products: [
      { name: "برگر ویژه دلِپ", price: 1250000, description: "گوشت تازه با سس مخصوص دلِپ", imageKeyword: "gourmet burger", badges: ["POPULAR"] },
      { name: "برگر", price: 790000, description: "گوشت گوساله، کاهو و گوجه", imageKeyword: "hamburger" },
      { name: "چیز برگر", price: 860000, description: "برگر با پنیر چدار", imageKeyword: "cheeseburger" },
      { name: "ماشروم برگر", price: 947000, description: "برگر با قارچ تازه", imageKeyword: "mushroom burger" },
      { name: "دبل برگر", price: 1050000, description: "دو لایه گوشت گوساله", imageKeyword: "double burger" },
      { name: "دبل چیز برگر", price: 1100000, description: "دبل برگر با دو لایه پنیر", imageKeyword: "double cheeseburger" },
      { name: "مرغ برگر", price: 685000, description: "سینه‌ی مرغ گریل", imageKeyword: "chicken burger" },
      { name: "کریسپی", price: 680000, description: "مرغ سوخاری ترد", imageKeyword: "crispy chicken burger" },
      { name: "سوپریم", price: 710000, description: "مرغ سوخاری با سس مخصوص", imageKeyword: "chicken supreme burger" },
    ],
  },
  {
    category: "ساندویچ",
    parent: "غذای اصلی",
    products: [
      { name: "بمب دلِپ", price: 1350000, description: "ساندویچ مخصوص دلِپ", imageKeyword: "special sandwich", badges: ["POPULAR"] },
      { name: "رست بیف", price: 870000, description: "رست‌بیف گوساله با قارچ", imageKeyword: "roast beef sandwich" },
      { name: "بیکن", price: 610000, description: "بیکن گوساله و پنیر", imageKeyword: "bacon sandwich" },
      { name: "پپرونی", price: 520000, description: "پپرونی تند و پنیر", imageKeyword: "pepperoni sandwich", badges: ["SPICY"] },
      { name: "گوشت", price: 730000, description: "گوشت گوساله و قارچ", imageKeyword: "beef sandwich" },
      { name: "مرغ", price: 680000, description: "مرغ گریل و قارچ", imageKeyword: "chicken sandwich" },
      { name: "هات داگ تنوری", price: 550000, description: "هات‌داگ در نان تنوری", imageKeyword: "hot dog" },
      { name: "هات داگ تنوری با قارچ و پنیر", price: 650000, description: "هات‌داگ با قارچ و پنیر", imageKeyword: "hot dog mushroom cheese" },
      { name: "ژامبون تنوری", price: 600000, description: "ژامبون در نان تنوری", imageKeyword: "ham sandwich" },
    ],
  },
  {
    category: "پیتزا",
    parent: "غذای اصلی",
    products: [
      { name: "پیتزا مخصوص", small: 750000, large: 965000, description: "سس، پنیر و مخلفات مخصوص", imageKeyword: "special pizza", badges: ["POPULAR"] },
      { name: "پیتزا رست بیف", small: 990000, large: 1300000, description: "رست‌بیف و پنیر موزارلا", imageKeyword: "roast beef pizza" },
      { name: "پیتزا گوشت و قارچ", small: 900000, large: 1200000, description: "گوشت، قارچ و پنیر", imageKeyword: "beef mushroom pizza" },
      { name: "پیتزا پپرونی", small: 790000, large: 990000, description: "پپرونی تند و پنیر", imageKeyword: "pepperoni pizza", badges: ["SPICY"] },
      { name: "پیتزا اسپیشیال", small: 970000, large: 1280000, description: "مخلفات ویژه و پنیر", imageKeyword: "supreme pizza" },
      { name: "پیتزا مرغ و قارچ", small: 800000, large: 1050000, description: "مرغ، قارچ و پنیر", imageKeyword: "chicken mushroom pizza" },
      { name: "پیتزا قارچ و پنیر", small: 620000, large: 830000, description: "قارچ تازه و پنیر موزارلا", imageKeyword: "mushroom cheese pizza", badges: ["VEGETARIAN"] },
      { name: "پیتزا مارگاریتا", small: 550000, large: 750000, description: "سس گوجه، موزارلا و ریحان", imageKeyword: "margherita pizza", badges: ["VEGETARIAN"] },
      { name: "پیتزا چهار فصل", price: 1360000, description: "چهار طعم در یک پیتزا", imageKeyword: "four seasons pizza" },
      { name: "پیتزا سبزیجات", small: 690000, large: 920000, description: "سبزیجات تازه و پنیر", imageKeyword: "vegetable pizza", badges: ["VEGETARIAN"] },
    ],
  },
  {
    category: "سوخاری",
    parent: "غذای اصلی",
    products: [
      { name: "فیله مرغ", price: 750000, description: "فیله‌ی مرغ سوخاری", imageKeyword: "fried chicken fillet" },
      { name: "ناگت مرغ", price: 500000, description: "ناگت مرغ ترد", imageKeyword: "chicken nuggets" },
      { name: "شنیتسل مرغ", price: 600000, description: "شنیتسل مرغ سوخاری", imageKeyword: "chicken schnitzel" },
      { name: "کتف و بال", price: 650000, description: "کتف و بال مرغ سوخاری", imageKeyword: "fried chicken wings" },
    ],
  },
  {
    category: "بشقاب",
    parent: "غذای اصلی",
    products: [
      { name: "پنه آلفردو", price: 850000, description: "پنه، سس آلفردو، مرغ گریل", imageKeyword: "penne alfredo" },
      { name: "بشقاب سلامت", price: 780000, description: "(سینه مرغ + بروکلی + قارچ) (کاهو + گوجه گیلاسی + هویج) (زیتون + ذرت + پنیر کبدی)", imageKeyword: "healthy plate" },
      { name: "کمبو", price: 450000, description: "نوشابه + سیب", imageKeyword: "combo drink fries" },
    ],
  },
];

export const topLevelCategories: { name: string; sortOrder: number }[] = [
  { name: "نوشیدنی گرم", sortOrder: 10 },
  { name: "نوشیدنی سرد", sortOrder: 20 },
  { name: "آبمیوه و شیک", sortOrder: 30 },
  { name: "دسر و کیک", sortOrder: 40 },
  { name: "پیش‌غذا و سالاد", sortOrder: 50 },
  { name: "غذای اصلی", sortOrder: 60 },
];

export const childCategories: { name: string; parent: string; sortOrder: number }[] = [
  { name: "قهوه", parent: "نوشیدنی گرم", sortOrder: 10 },
  { name: "چای", parent: "نوشیدنی گرم", sortOrder: 20 },
  { name: "شکلات و شیر", parent: "نوشیدنی گرم", sortOrder: 30 },
  { name: "آبمیوه", parent: "آبمیوه و شیک", sortOrder: 10 },
  { name: "شیک و اسموتی", parent: "آبمیوه و شیک", sortOrder: 20 },
  { name: "پیش‌غذا", parent: "پیش‌غذا و سالاد", sortOrder: 10 },
  { name: "سالاد", parent: "پیش‌غذا و سالاد", sortOrder: 20 },
  { name: "برگر", parent: "غذای اصلی", sortOrder: 10 },
  { name: "ساندویچ", parent: "غذای اصلی", sortOrder: 20 },
  { name: "پیتزا", parent: "غذای اصلی", sortOrder: 30 },
  { name: "سوخاری", parent: "غذای اصلی", sortOrder: 40 },
  { name: "بشقاب", parent: "غذای اصلی", sortOrder: 50 },
];
