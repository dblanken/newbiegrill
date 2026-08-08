// Built-in food presets. Times are in seconds. flipAt is a list of elapsed-time
// marks (seconds) at which the user should flip/turn the food.
const BUILTIN_FOODS = [
  {
    id: "burger",
    name: "Burger",
    heat: "Medium-High",
    totalTime: 10 * 60,
    flipAt: [5 * 60],
    notes: "Flip once. Don't press down.",
  },
  {
    id: "hotdog",
    name: "Hot Dog",
    heat: "Medium",
    totalTime: 7 * 60,
    flipAt: [2 * 60, 4 * 60, 6 * 60],
    notes: "Roll every couple minutes for even char.",
  },
  {
    id: "bratwurst",
    name: "Bratwurst",
    heat: "Medium",
    totalTime: 20 * 60,
    flipAt: [5 * 60, 10 * 60, 15 * 60],
    notes: "Turn every 5 min. Move to indirect heat if flaring.",
  },
  {
    id: "chicken-breast",
    name: "Chicken Breast",
    heat: "Medium",
    totalTime: 14 * 60,
    flipAt: [7 * 60],
    notes: "Pound to even thickness first. Internal temp 165F.",
  },
  {
    id: "chicken-thigh",
    name: "Chicken Thigh (bone-in)",
    heat: "Medium",
    totalTime: 30 * 60,
    flipAt: [15 * 60],
    notes: "Skin side down first. Internal temp 165F.",
  },
  {
    id: "steak-1in",
    name: 'Steak (1" thick)',
    heat: "High",
    totalTime: 8 * 60,
    flipAt: [4 * 60],
    notes: "Sear hot. Rest 5 min after grill.",
  },
  {
    id: "porkchop",
    name: "Pork Chop",
    heat: "Medium-High",
    totalTime: 12 * 60,
    flipAt: [6 * 60],
    notes: "Internal temp 145F, then rest.",
  },
  {
    id: "ribs",
    name: "Ribs (low & slow)",
    heat: "Low (Indirect)",
    totalTime: 180 * 60,
    flipAt: [60 * 60, 120 * 60],
    notes: "Wrap in foil after first flip if desired.",
  },
  {
    id: "salmon",
    name: "Salmon Fillet",
    heat: "Medium",
    totalTime: 12 * 60,
    flipAt: [6 * 60],
    notes: "Skin side down most of the time.",
  },
  {
    id: "shrimp",
    name: "Shrimp Skewers",
    heat: "High",
    totalTime: 6 * 60,
    flipAt: [3 * 60],
    notes: "Cook fast, watch closely.",
  },
  {
    id: "corn",
    name: "Corn on the Cob",
    heat: "Medium",
    totalTime: 15 * 60,
    flipAt: [4 * 60, 8 * 60, 12 * 60],
    notes: "Turn a quarter-rotation every few minutes.",
  },
  {
    id: "veggies",
    name: "Mixed Vegetables",
    heat: "Medium",
    totalTime: 10 * 60,
    flipAt: [5 * 60],
    notes: "Toss/flip halfway through.",
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
