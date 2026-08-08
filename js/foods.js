// Built-in food presets. Times are in seconds. flipAt is a list of elapsed-time
// marks (seconds) at which the user should flip/turn the food. category groups
// presets in the UI.
const CATEGORY_ORDER = ["Meat", "Seafood", "Vegetables", "Fruit"];

const BUILTIN_FOODS = [
  // --- Meat ---
  {
    id: "burger",
    name: "Burger",
    category: "Meat",
    heat: "Medium-High",
    totalTime: 9 * 60,
    flipAt: [4 * 60 + 30],
    notes: "Flip once. Don't press down.",
    donenessOptions: [
      { label: "Medium", totalTime: 8 * 60, flipAt: [4 * 60] },
      { label: "Medium-Well", totalTime: 9 * 60, flipAt: [4 * 60 + 30] },
      { label: "Well-Done", totalTime: 10 * 60, flipAt: [5 * 60] },
    ],
  },
  {
    id: "hotdog",
    name: "Hot Dog",
    category: "Meat",
    heat: "Medium",
    totalTime: 7 * 60,
    flipAt: [2 * 60, 4 * 60, 6 * 60],
    notes: "Roll every couple minutes for even char.",
  },
  {
    id: "bratwurst",
    name: "Bratwurst",
    category: "Meat",
    heat: "Medium",
    totalTime: 20 * 60,
    flipAt: [5 * 60, 10 * 60, 15 * 60],
    notes: "Turn every 5 min. Move to indirect heat if flaring.",
  },
  {
    id: "chicken-breast",
    name: "Chicken Breast",
    category: "Meat",
    heat: "Medium",
    totalTime: 14 * 60,
    flipAt: [7 * 60],
    notes: "Pound to even thickness first. Internal temp 165F.",
  },
  {
    id: "chicken-thigh",
    name: "Chicken Thigh (bone-in)",
    category: "Meat",
    heat: "Medium",
    totalTime: 30 * 60,
    flipAt: [15 * 60],
    notes: "Skin side down first. Internal temp 165F.",
  },
  {
    id: "chicken-wings",
    name: "Chicken Wings",
    category: "Meat",
    heat: "Medium",
    totalTime: 20 * 60,
    flipAt: [10 * 60],
    notes: "Move to indirect heat if flaring. Internal temp 165F.",
  },
  {
    id: "chicken-drumsticks",
    name: "Chicken Drumsticks",
    category: "Meat",
    heat: "Medium",
    totalTime: 25 * 60,
    flipAt: [12 * 60 + 30],
    notes: "Internal temp 165F.",
  },
  {
    id: "steak-1in",
    name: 'Steak (1" thick)',
    category: "Meat",
    heat: "High",
    totalTime: 8 * 60,
    flipAt: [4 * 60],
    notes: "Sear hot. Rest 5 min after grill.",
    donenessOptions: [
      { label: "Rare", totalTime: 6 * 60, flipAt: [3 * 60] },
      { label: "Medium-Rare", totalTime: 7 * 60, flipAt: [3 * 60 + 30] },
      { label: "Medium", totalTime: 8 * 60, flipAt: [4 * 60] },
      { label: "Medium-Well", totalTime: 9 * 60, flipAt: [4 * 60 + 30] },
      { label: "Well-Done", totalTime: 11 * 60, flipAt: [5 * 60 + 30] },
    ],
  },
  {
    id: "steak-thin",
    name: "Steak (thin-cut)",
    category: "Meat",
    heat: "High",
    totalTime: 6 * 60,
    flipAt: [3 * 60],
    notes: "Cooks fast — watch closely.",
    donenessOptions: [
      { label: "Rare", totalTime: 4 * 60, flipAt: [2 * 60] },
      { label: "Medium-Rare", totalTime: 5 * 60, flipAt: [2 * 60 + 30] },
      { label: "Medium", totalTime: 6 * 60, flipAt: [3 * 60] },
      { label: "Medium-Well", totalTime: 7 * 60, flipAt: [3 * 60 + 30] },
      { label: "Well-Done", totalTime: 8 * 60, flipAt: [4 * 60] },
    ],
  },
  {
    id: "porkchop",
    name: "Pork Chop",
    category: "Meat",
    heat: "Medium-High",
    totalTime: 12 * 60,
    flipAt: [6 * 60],
    notes: "Internal temp 145F, then rest.",
    donenessOptions: [
      { label: "Medium", totalTime: 12 * 60, flipAt: [6 * 60] },
      { label: "Medium-Well", totalTime: 13 * 60, flipAt: [6 * 60 + 30] },
      { label: "Well-Done", totalTime: 14 * 60, flipAt: [7 * 60] },
    ],
  },
  {
    id: "pork-tenderloin",
    name: "Pork Tenderloin",
    category: "Meat",
    heat: "Medium",
    totalTime: 20 * 60,
    flipAt: [10 * 60],
    notes: "Turn occasionally for even browning. Internal temp 145F.",
    donenessOptions: [
      { label: "Medium", totalTime: 20 * 60, flipAt: [10 * 60] },
      { label: "Medium-Well", totalTime: 22 * 60, flipAt: [11 * 60] },
      { label: "Well-Done", totalTime: 24 * 60, flipAt: [12 * 60] },
    ],
  },
  {
    id: "ribs",
    name: "Ribs (low & slow)",
    category: "Meat",
    heat: "Low (Indirect)",
    totalTime: 180 * 60,
    flipAt: [60 * 60, 120 * 60],
    notes: "Wrap in foil after first flip if desired.",
  },
  {
    id: "lamb-chops",
    name: "Lamb Chops",
    category: "Meat",
    heat: "High",
    totalTime: 8 * 60,
    flipAt: [4 * 60],
    notes: "Sear hot, rest before serving.",
    donenessOptions: [
      { label: "Rare", totalTime: 6 * 60, flipAt: [3 * 60] },
      { label: "Medium-Rare", totalTime: 7 * 60, flipAt: [3 * 60 + 30] },
      { label: "Medium", totalTime: 8 * 60, flipAt: [4 * 60] },
      { label: "Medium-Well", totalTime: 9 * 60, flipAt: [4 * 60 + 30] },
      { label: "Well-Done", totalTime: 10 * 60, flipAt: [5 * 60] },
    ],
  },
  {
    id: "turkey-burger",
    name: "Turkey Burger",
    category: "Meat",
    heat: "Medium",
    totalTime: 12 * 60,
    flipAt: [6 * 60],
    notes: "Internal temp 165F — cook through, no pink.",
  },

  // --- Seafood ---
  {
    id: "salmon",
    name: "Salmon Fillet",
    category: "Seafood",
    heat: "Medium",
    totalTime: 12 * 60,
    flipAt: [6 * 60],
    notes: "Skin side down most of the time.",
    donenessOptions: [
      { label: "Medium-Rare", totalTime: 10 * 60, flipAt: [5 * 60] },
      { label: "Medium", totalTime: 12 * 60, flipAt: [6 * 60] },
      { label: "Well-Done", totalTime: 14 * 60, flipAt: [7 * 60] },
    ],
  },
  {
    id: "shrimp",
    name: "Shrimp Skewers",
    category: "Seafood",
    heat: "High",
    totalTime: 6 * 60,
    flipAt: [3 * 60],
    notes: "Cook fast, watch closely.",
  },
  {
    id: "tilapia",
    name: "Tilapia",
    category: "Seafood",
    heat: "Medium",
    totalTime: 8 * 60,
    flipAt: [4 * 60],
    notes: "Delicate — use a fish basket or foil if it's sticking.",
  },
  {
    id: "scallops",
    name: "Scallops",
    category: "Seafood",
    heat: "High",
    totalTime: 5 * 60,
    flipAt: [2 * 60 + 30],
    notes: "Pat dry first for a good sear.",
  },
  {
    id: "lobster-tail",
    name: "Lobster Tail",
    category: "Seafood",
    heat: "Medium-High",
    totalTime: 10 * 60,
    flipAt: [5 * 60],
    notes: "Shell side down first.",
  },

  // --- Vegetables ---
  {
    id: "corn",
    name: "Corn on the Cob",
    category: "Vegetables",
    heat: "Medium",
    totalTime: 15 * 60,
    flipAt: [4 * 60, 8 * 60, 12 * 60],
    notes: "Turn a quarter-rotation every few minutes.",
  },
  {
    id: "eggplant",
    name: "Eggplant (sliced)",
    category: "Vegetables",
    heat: "Medium",
    totalTime: 8 * 60,
    flipAt: [4 * 60],
    notes: "Salt slices first to draw out moisture.",
  },
  {
    id: "zucchini",
    name: "Zucchini (sliced)",
    category: "Vegetables",
    heat: "Medium",
    totalTime: 6 * 60,
    flipAt: [3 * 60],
    notes: "Cut lengthwise for fewer pieces falling through the grate.",
  },
  {
    id: "bell-peppers",
    name: "Bell Peppers",
    category: "Vegetables",
    heat: "Medium",
    totalTime: 8 * 60,
    flipAt: [4 * 60],
    notes: "Great sliced or whole.",
  },
  {
    id: "asparagus",
    name: "Asparagus",
    category: "Vegetables",
    heat: "Medium-High",
    totalTime: 6 * 60,
    flipAt: [3 * 60],
    notes: "Toss in oil first, grill perpendicular to the grates.",
  },
  {
    id: "portobello",
    name: "Portobello Mushrooms",
    category: "Vegetables",
    heat: "Medium",
    totalTime: 8 * 60,
    flipAt: [4 * 60],
    notes: "Gill side up first to hold marinade.",
  },
  {
    id: "onion",
    name: "Onion (thick slices)",
    category: "Vegetables",
    heat: "Medium",
    totalTime: 10 * 60,
    flipAt: [5 * 60],
    notes: "Skewer through the side so rings don't separate.",
  },
  {
    id: "potatoes-foil",
    name: "Potatoes (foil packet)",
    category: "Vegetables",
    heat: "Medium",
    totalTime: 40 * 60,
    flipAt: [20 * 60],
    notes: "Cube and wrap in foil with oil and seasoning.",
  },
  {
    id: "brussels-sprouts",
    name: "Brussels Sprouts (skewered)",
    category: "Vegetables",
    heat: "Medium",
    totalTime: 12 * 60,
    flipAt: [6 * 60],
    notes: "Halve and skewer so they don't fall through the grate.",
  },
  {
    id: "veggie-kebab",
    name: "Mixed Vegetable Kebab",
    category: "Vegetables",
    heat: "Medium",
    totalTime: 10 * 60,
    flipAt: [5 * 60],
    notes: "Cut pieces evenly so they cook at the same rate.",
  },

  // --- Fruit ---
  {
    id: "pineapple",
    name: "Pineapple (sliced)",
    category: "Fruit",
    heat: "Medium",
    totalTime: 6 * 60,
    flipAt: [3 * 60],
    notes: "Grill until caramelized grill marks form.",
  },
];

const FOOD_STORAGE_KEY = "grilltime.customFoods";

function loadCustomFoods() {
  try {
    const raw = localStorage.getItem(FOOD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load custom foods", e);
    return [];
  }
}

function saveCustomFoods(foods) {
  localStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(foods));
}

function getAllFoods() {
  return [...BUILTIN_FOODS, ...loadCustomFoods()];
}

// Groups foods by category, ordered per CATEGORY_ORDER with any unknown
// categories (e.g. a custom food with a made-up category) appended after.
function groupFoodsByCategory(foods) {
  const groups = new Map();
  for (const food of foods) {
    const cat = food.category || "Other";
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(food);
  }
  const ordered = [];
  for (const cat of CATEGORY_ORDER) {
    if (groups.has(cat)) {
      ordered.push([cat, groups.get(cat)]);
      groups.delete(cat);
    }
  }
  for (const entry of groups) ordered.push(entry);
  return ordered;
}

function addCustomFood(food) {
  const foods = loadCustomFoods();
  foods.push(food);
  saveCustomFoods(foods);
  return food;
}

function deleteCustomFood(id) {
  const foods = loadCustomFoods().filter((f) => f.id !== id);
  saveCustomFoods(foods);
}

function isCustomFood(id) {
  return loadCustomFoods().some((f) => f.id === id);
}
