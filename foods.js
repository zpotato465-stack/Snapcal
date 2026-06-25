/* SnapCal built-in food database.
 * Values are per 100 g (kcal + macros in grams) unless the serving says otherwise.
 * Each food carries English + Arabic names and a few common serving options. */
window.FOODS = [
  // id,        en,                ar,                  kcal, p,   c,   f,    servings: [{en, ar, grams}]
  f("apple",    "Apple",           "تفاحة",             52,  0.3, 14,  0.2, [s("1 medium","حبة متوسطة",182), s("100 g","100 غرام",100)]),
  f("banana",   "Banana",          "موزة",              89,  1.1, 23,  0.3, [s("1 medium","حبة متوسطة",118), s("100 g","100 غرام",100)]),
  f("orange",   "Orange",          "برتقالة",           47,  0.9, 12,  0.1, [s("1 medium","حبة متوسطة",131), s("100 g","100 غرام",100)]),
  f("lemon",    "Lemon",           "ليمونة",            29,  1.1, 9,   0.3, [s("1 fruit","حبة",58), s("100 g","100 غرام",100)]),
  f("strawberry","Strawberries",   "فراولة",            32,  0.7, 7.7, 0.3, [s("1 cup","كوب",152), s("100 g","100 غرام",100)]),
  f("pineapple","Pineapple",       "أناناس",            50,  0.5, 13,  0.1, [s("1 slice","شريحة",84), s("1 cup","كوب",165), s("100 g","100 غرام",100)]),
  f("pomegranate","Pomegranate",   "رمان",              83,  1.7, 19,  1.2, [s("1 fruit","حبة",282), s("100 g","100 غرام",100)]),
  f("fig",      "Figs",            "تين",               74,  0.8, 19,  0.3, [s("1 fig","حبة",50), s("100 g","100 غرام",100)]),
  f("grapes",   "Grapes",          "عنب",               69,  0.7, 18,  0.2, [s("1 cup","كوب",151), s("100 g","100 غرام",100)]),
  f("watermelon","Watermelon",     "بطيخ",              30,  0.6, 8,   0.2, [s("1 wedge","شريحة",286), s("1 cup","كوب",152), s("100 g","100 غرام",100)]),
  f("dates",    "Dates",           "تمر",               282, 2.5, 75,  0.4, [s("1 date","حبة",24), s("100 g","100 غرام",100)]),

  f("egg",      "Egg",             "بيضة",              155, 13,  1.1, 11,  [s("1 large","بيضة كبيرة",50), s("100 g","100 غرام",100)]),
  f("chicken_breast","Chicken breast","صدر دجاج",        165, 31,  0,   3.6, [s("1 breast","صدر",174), s("100 g","100 غرام",100)]),
  f("beef",     "Beef (cooked)",   "لحم بقري",          250, 26,  0,   15,  [s("1 serving","حصة",120), s("100 g","100 غرام",100)]),
  f("salmon",   "Salmon",          "سلمون",             208, 20,  0,   13,  [s("1 fillet","شريحة",170), s("100 g","100 غرام",100)]),
  f("tuna",     "Tuna",            "تونة",              132, 28,  0,   1,   [s("1 can","علبة",142), s("100 g","100 غرام",100)]),
  f("shrimp",   "Shrimp",          "روبيان",            99,  24,  0.2, 0.3, [s("1 serving","حصة",85), s("100 g","100 غرام",100)]),

  f("rice",     "Cooked rice",     "أرز مطبوخ",         130, 2.7, 28,  0.3, [s("1 cup","كوب",158), s("100 g","100 غرام",100)]),
  f("red_rice", "Red rice",        "أرز أحمر",          130, 2.8, 28,  1,   [s("1 cup","كوب",158), s("100 g","100 غرام",100)]),
  f("brown_rice","Brown rice",     "أرز بني",           123, 2.7, 25,  1,   [s("1 cup","كوب",195), s("100 g","100 غرام",100)]),
  f("pasta",    "Cooked pasta",    "معكرونة",           131, 5,   25,  1.1, [s("1 cup","كوب",140), s("100 g","100 غرام",100)]),
  f("bread",    "Bread",           "خبز",               265, 9,   49,  3.2, [s("1 slice","شريحة",30), s("100 g","100 غرام",100)]),
  f("arabic_bread","Arabic flatbread","خبز عربي",        275, 9,   55,  1.7, [s("1 loaf","رغيف",60), s("100 g","100 غرام",100)]),
  f("bagel",    "Bagel",           "خبز بيغل",          250, 10,  49,  1.5, [s("1 bagel","حبة",98), s("100 g","100 غرام",100)]),
  f("pretzel",  "Pretzel",         "بريتزل",            380, 10,  80,  3,   [s("1 pretzel","حبة",50), s("100 g","100 غرام",100)]),
  f("oats",     "Oatmeal",         "شوفان",             68,  2.4, 12,  1.4, [s("1 cup","كوب",234), s("100 g","100 غرام",100)]),
  f("potato",   "Potato",          "بطاطا",             87,  1.9, 20,  0.1, [s("1 medium","حبة متوسطة",173), s("100 g","100 غرام",100)]),
  f("fries",    "French fries",    "بطاطا مقلية",       312, 3.4, 41,  15,  [s("1 small","وسط صغير",115), s("1 medium","وسط متوسط",170), s("100 g","100 غرام",100)]),
  f("corn",     "Corn",            "ذرة",               86,  3.3, 19,  1.2, [s("1 ear","كوز",90), s("100 g","100 غرام",100)]),

  f("broccoli", "Broccoli",        "بروكلي",            34,  2.8, 7,   0.4, [s("1 cup","كوب",91), s("100 g","100 غرام",100)]),
  f("cauliflower","Cauliflower",   "قرنبيط",            25,  1.9, 5,   0.3, [s("1 cup","كوب",107), s("100 g","100 غرام",100)]),
  f("cucumber", "Cucumber",        "خيار",              15,  0.7, 3.6, 0.1, [s("1 cup","كوب",119), s("100 g","100 غرام",100)]),
  f("tomato",   "Tomato",          "طماطم",             18,  0.9, 3.9, 0.2, [s("1 medium","حبة متوسطة",123), s("100 g","100 غرام",100)]),
  f("carrot",   "Carrot",          "جزر",               41,  0.9, 10,  0.2, [s("1 medium","حبة متوسطة",61), s("100 g","100 غرام",100)]),
  f("pepper",   "Bell pepper",     "فلفل حلو",          31,  1,   6,   0.3, [s("1 medium","حبة متوسطة",119), s("100 g","100 غرام",100)]),
  f("mushroom", "Mushrooms",       "فطر",               22,  3.1, 3.3, 0.3, [s("1 cup","كوب",70), s("100 g","100 غرام",100)]),
  f("zucchini", "Zucchini",        "كوسا",              17,  1.2, 3.1, 0.3, [s("1 medium","حبة متوسطة",196), s("100 g","100 غرام",100)]),
  f("salad",    "Green salad",     "سلطة خضراء",        20,  1.2, 3.8, 0.2, [s("1 bowl","طبق",150), s("100 g","100 غرام",100)]),
  f("avocado",  "Avocado",         "أفوكادو",           160, 2,   9,   15,  [s("1 fruit","حبة",150), s("100 g","100 غرام",100)]),
  f("guacamole","Guacamole",       "غواكامولي",         150, 2,   9,   13,  [s("2 tbsp","ملعقتان",60), s("100 g","100 غرام",100)]),

  f("milk",     "Milk",            "حليب",              42,  3.4, 5,   1,   [s("1 cup","كوب",244), s("100 ml","100 مل",100)]),
  f("yogurt",   "Yogurt",          "زبادي",             59,  10,  3.6, 0.4, [s("1 cup","كوب",245), s("100 g","100 غرام",100)]),
  f("cheese",   "Cheese",          "جبن",               402, 25,  1.3, 33,  [s("1 slice","شريحة",28), s("100 g","100 غرام",100)]),
  f("hummus",   "Hummus",          "حمص",               166, 8,   14,  10,  [s("2 tbsp","ملعقتان",30), s("100 g","100 غرام",100)]),
  f("falafel",  "Falafel",         "فلافل",             333, 13,  32,  18,  [s("1 piece","حبة",17), s("100 g","100 غرام",100)]),
  f("nuts",     "Mixed nuts",      "مكسرات",            607, 20,  21,  54,  [s("1 oz","حفنة",28), s("100 g","100 غرام",100)]),
  f("peanut_butter","Peanut butter","زبدة فول سوداني",   588, 25,  20,  50,  [s("1 tbsp","ملعقة",16), s("100 g","100 غرام",100)]),

  f("pizza",    "Pizza",           "بيتزا",             266, 11,  33,  10,  [s("1 slice","شريحة",107), s("100 g","100 غرام",100)]),
  f("burger",   "Cheeseburger",    "برغر بالجبن",       295, 17,  24,  14,  [s("1 burger","ساندويتش",150), s("100 g","100 غرام",100)]),
  f("hotdog",   "Hot dog",         "هوت دوغ",           290, 10,  4,   26,  [s("1 hot dog","حبة",98), s("100 g","100 غرام",100)]),
  f("sandwich", "Sandwich",        "ساندويتش",          250, 11,  30,  9,   [s("1 sandwich","ساندويتش",150), s("100 g","100 غرام",100)]),
  f("burrito",  "Burrito",         "بوريتو",            206, 8,   25,  8,   [s("1 burrito","حبة",220), s("100 g","100 غرام",100)]),
  f("shawarma", "Shawarma wrap",   "شاورما",            215, 14,  18,  10,  [s("1 wrap","سندويش",250), s("100 g","100 غرام",100)]),
  f("kebab",    "Kebab",           "كباب",              215, 16,  4,   15,  [s("1 skewer","سيخ",90), s("100 g","100 غرام",100)]),
  f("rice_chicken","Chicken & rice","دجاج وأرز",         170, 11,  20,  5,   [s("1 plate","طبق",350), s("100 g","100 غرام",100)]),
  f("soup",     "Soup",            "شوربة",             50,  3,   6,   1.5, [s("1 bowl","طبق",245), s("100 ml","100 مل",100)]),
  f("meatloaf", "Meatloaf",        "رغيف اللحم",        242, 17,  9,   15,  [s("1 slice","شريحة",100), s("100 g","100 غرام",100)]),
  f("mashed_potato","Mashed potato","بطاطا مهروسة",      113, 2,   17,  4.2, [s("1 cup","كوب",210), s("100 g","100 غرام",100)]),

  f("ice_cream","Ice cream",       "آيس كريم",          207, 3.5, 24,  11,  [s("1 scoop","كرة",66), s("100 g","100 غرام",100)]),
  f("popsicle", "Popsicle",        "مصاصة مثلجة",       80,  0,   20,  0,   [s("1 bar","حبة",60), s("100 g","100 غرام",100)]),
  f("chocolate","Chocolate",       "شوكولاتة",          546, 4.9, 61,  31,  [s("1 bar","لوح",45), s("100 g","100 غرام",100)]),
  f("cookie",   "Cookie",          "بسكويت",            480, 5,   64,  22,  [s("1 cookie","حبة",30), s("100 g","100 غرام",100)]),
  f("cake",     "Cake",            "كيك",               350, 4,   55,  14,  [s("1 slice","شريحة",80), s("100 g","100 غرام",100)]),
  f("donut",    "Donut",           "دونات",             452, 5,   51,  25,  [s("1 donut","حبة",60), s("100 g","100 غرام",100)]),
  f("trifle",   "Trifle dessert",  "حلوى ترايفل",       150, 2,   24,  5,   [s("1 cup","كوب",150), s("100 g","100 غرام",100)]),

  f("coffee",   "Coffee (black)",  "قهوة",              1,   0.1, 0,   0,   [s("1 cup","فنجان",240), s("100 ml","100 مل",100)]),
  f("espresso", "Espresso",        "إسبريسو",           9,   0.1, 1.5, 0.2, [s("1 shot","جرعة",30), s("100 ml","100 مل",100)]),
  f("tea",      "Tea",             "شاي",               1,   0,   0.3, 0,   [s("1 cup","كوب",240), s("100 ml","100 مل",100)]),
  f("juice",    "Orange juice",    "عصير برتقال",       45,  0.7, 10,  0.2, [s("1 cup","كوب",248), s("100 ml","100 مل",100)]),
  f("soda",     "Soda",            "مشروب غازي",        41,  0,   11,  0,   [s("1 can","علبة",355), s("100 ml","100 مل",100)]),
  f("wine",     "Red wine",        "نبيذ أحمر",         85,  0.1, 2.6, 0,   [s("1 glass","كأس",150), s("100 ml","100 مل",100)]),
  f("eggnog",   "Eggnog",          "إيجنوغ",            135, 3.8, 14,  7,   [s("1 cup","كوب",254), s("100 ml","100 مل",100)]),
];

function f(id, en, ar, kcal, p, c, fat, servings) {
  return { id: id, en: en, ar: ar, kcal: kcal, p: p, c: c, f: fat, servings: servings };
}
function s(en, ar, grams) { return { en: en, ar: ar, grams: grams }; }

/* MobileNet (ImageNet) class keyword -> food id.
 * className strings are comma-separated synonyms; we substring-match these keys. */
window.MOBILENET_FOOD_MAP = [
  ["granny smith", "apple"], ["apple", "apple"],
  ["banana", "banana"],
  ["orange", "orange"],
  ["lemon", "lemon"],
  ["strawberr", "strawberry"],
  ["pineapple", "pineapple"], ["ananas", "pineapple"],
  ["pomegranate", "pomegranate"],
  ["fig", "fig"],
  ["pizza", "pizza"],
  ["cheeseburger", "burger"],
  ["hotdog", "hotdog"], ["hot dog", "hotdog"],
  ["bagel", "bagel"], ["beigel", "bagel"],
  ["pretzel", "pretzel"],
  ["french loaf", "bread"], ["loaf", "bread"],
  ["broccoli", "broccoli"],
  ["cauliflower", "cauliflower"],
  ["cucumber", "cucumber"], ["cuke", "cucumber"],
  ["bell pepper", "pepper"],
  ["mushroom", "mushroom"],
  ["corn", "corn"],
  ["zucchini", "zucchini"], ["courgette", "zucchini"],
  ["artichoke", "broccoli"],
  ["cabbage", "salad"],
  ["guacamole", "guacamole"],
  ["mashed potato", "mashed_potato"],
  ["potato", "potato"],
  ["meat loaf", "meatloaf"], ["meatloaf", "meatloaf"],
  ["ice cream", "ice_cream"], ["icecream", "ice_cream"],
  ["ice lolly", "popsicle"], ["popsicle", "popsicle"], ["lolly", "popsicle"],
  ["espresso", "espresso"],
  ["eggnog", "eggnog"],
  ["burrito", "burrito"],
  ["red wine", "wine"], ["wine", "wine"],
  ["trifle", "trifle"],
  ["potpie", "soup"], ["pot pie", "soup"],
  ["soup", "soup"], ["consomme", "soup"], ["hotpot", "soup"], ["hot pot", "soup"],
  ["chocolate sauce", "chocolate"], ["chocolate syrup", "chocolate"], ["chocolate", "chocolate"],
  ["carbonara", "pasta"], ["spaghetti", "pasta"],
  ["dough", "bread"],
  ["cheese", "cheese"],
];

window.getFoodById = function (id) {
  return window.FOODS.find(function (x) { return x.id === id; });
};
