// Sizzle & Serve — data: ingredients, dishes, tuning.
// Written for the make.fun "best cooking game" bounty. All original.

export const CANVAS_W = 1280;
export const CANVAS_H = 720;
export const SHIFT_SECONDS = 180;

// Every ingredient the kitchen stocks. `cook` names the station that must
// prepare it first ('grill' | 'pot'); without it the item goes straight
// from its bin onto the plate. `key` is the keyboard shortcut shown on
// its bin. `color` drives the bin chip and the ticket dots.
export const INGREDIENTS = {
  bunBottom: { name: 'Bun Base', short: 'Bun', key: '1', color: '#e8a94e', cook: null },
  patty:     { name: 'Beef Patty', short: 'Patty', key: '2', color: '#8a5a2b', cook: 'grill', cookSecs: 5 },
  cheese:    { name: 'Cheddar', short: 'Cheese', key: '3', color: '#f7c948', cook: null },
  lettuce:   { name: 'Lettuce', short: 'Lettuce', key: '4', color: '#69b455', cook: null },
  tomato:    { name: 'Tomato', short: 'Tomato', key: '5', color: '#e0492f', cook: null },
  bunTop:    { name: 'Bun Top', short: 'Bun Top', key: '6', color: '#e8a94e', cook: null },
  bowl:      { name: 'Salad Bowl', short: 'Bowl', key: '7', color: '#7fb3d5', cook: null },
  cucumber:  { name: 'Cucumber', short: 'Cucumber', key: '8', color: '#7dc383', cook: null },
  dressing:  { name: 'Dressing', short: 'Dress', key: '9', color: '#f2e3a1', cook: null },
  pasta:     { name: 'Pasta', short: 'Pasta', key: '0', color: '#f0d089', cook: 'pot', cookSecs: 6 },
  sauce:     { name: 'Tomato Sauce', short: 'Sauce', key: 'Q', color: '#c0392b', cook: null },
  basil:     { name: 'Basil', short: 'Basil', key: 'W', color: '#2e7d32', cook: null },
  shell:     { name: 'Taco Shell', short: 'Shell', key: 'E', color: '#f2c14e', cook: null },
  meat:      { name: 'Spiced Meat', short: 'Meat', key: 'R', color: '#a0522d', cook: 'grill', cookSecs: 5 },
};

// The order in which bins appear on the ingredient counter.
export const BIN_ORDER = [
  'bunBottom', 'patty', 'cheese', 'lettuce', 'tomato', 'bunTop',
  'bowl', 'cucumber', 'dressing', 'pasta', 'sauce', 'basil',
];

// Dishes customers order. `recipe` is the multiset of ingredients the
// plate must hold (assembly order does not matter, the contents do).
export const DISHES = {
  burger: {
    name: 'Classic Burger', price: 100, weight: 3,
    recipe: ['bunBottom', 'patty', 'cheese', 'lettuce', 'tomato', 'bunTop'],
    blurb: 'The house classic. Grill the patty, stack it high.',
  },
  salad: {
    name: 'Garden Salad', price: 90, weight: 2,
    recipe: ['bowl', 'lettuce', 'tomato', 'cucumber', 'dressing'],
    blurb: 'Crisp, fresh, no cooking. Fast money when the grill is busy.',
  },
  pasta: {
    name: 'Pasta Alfredo', price: 110, weight: 2,
    recipe: ['pasta', 'sauce', 'cheese', 'basil'],
    blurb: 'Boil the pasta, then sauce, cheese and basil.',
  },
  taco: {
    name: 'Crunchy Taco', price: 95, weight: 2,
    recipe: ['shell', 'meat', 'lettuce', 'tomato', 'cheese'],
    blurb: 'Grill the spiced meat, load the shell, serve fast.',
  },
};

export const DISH_KEYS = Object.keys(DISHES);

// Difficulty ramp: orders arrive faster and patience shrinks as the
// shift goes on. `elapsed` is seconds since the shift started.
export function spawnIntervalSecs(elapsed) {
  return Math.max(8, 14 - Math.floor(elapsed / 30) * 1.5);
}
export function patienceSecs(elapsed) {
  return Math.max(32, 50 - Math.floor(elapsed / 20));
}
export function cookReadyWindowSecs() { return 6; }

// Score for a served dish: base price + a speed bonus for patience left
// + a combo bonus. Combo grows by 1 per consecutive correct serve.
export function serveScore(dish, patienceLeft, maxPatience, combo) {
  const speed = Math.round(60 * (patienceLeft / maxPatience));
  return dish.price + speed + combo * 15;
}

// Chef-hat rating for the end screen.
export function ratingFor(score, served) {
  if (score >= 2200 && served >= 12) return { hats: 3, label: 'Master Chef!' };
  if (score >= 1400 && served >= 8) return { hats: 2, label: 'Sous Chef!' };
  if (score >= 700 && served >= 4) return { hats: 1, label: 'Line Cook!' };
  return { hats: 0, label: 'Keep practicing!' };
}

// ---- deterministic random (seeded for screenshots, Math.random live) ----
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick a dish key by weight using the supplied rng function.
export function pickDish(rng) {
  const total = DISH_KEYS.reduce((s, k) => s + DISHES[k].weight, 0);
  let roll = rng() * total;
  for (const k of DISH_KEYS) {
    roll -= DISHES[k].weight;
    if (roll <= 0) return k;
  }
  return DISH_KEYS[0];
}

// Multiset equality: same ingredients, same counts, any order.
export function sameMultiset(a, b) {
  if (a.length !== b.length) return false;
  const count = {};
  for (const x of a) count[x] = (count[x] || 0) + 1;
  for (const x of b) {
    if (!count[x]) return false;
    count[x]--;
  }
  return true;
}

// What is missing / extra when comparing a plate against a recipe.
// Used for the "not quite right" hint when a serve is rejected.
export function plateDiff(plate, recipe) {
  const missing = [];
  const extra = [];
  const have = {};
  for (const x of plate) have[x] = (have[x] || 0) + 1;
  const need = {};
  for (const x of recipe) need[x] = (need[x] || 0) + 1;
  for (const k of Object.keys(need)) {
    for (let i = 0; i < need[k] - (have[k] || 0); i++) missing.push(k);
  }
  for (const k of Object.keys(have)) {
    for (let i = 0; i < have[k] - (need[k] || 0); i++) extra.push(k);
  }
  return { missing, extra };
}

// ---- layout: every panel's rectangle, in canvas pixels ----
export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 56 },
  orders: { x: 24, y: 66, w: 1232, h: 116, gap: 12, ticketW: 296 },
  grill: { x: 24, y: 196, w: 316, h: 224 },
  pot: { x: 356, y: 196, w: 204, h: 224 },
  bins: { x: 576, y: 196, w: 680, h: 224, cols: 6, cellW: 108, cellH: 92, gap: 6 },
  plate: { x: 24, y: 436, w: 676, h: 264 },
  side: { x: 716, y: 436, w: 540, h: 264 },
};

export const MAX_ORDERS = 4;
export const MAX_PLATE = 8;
export const GRILL_SLOTS = 2;
export const POT_SLOTS = 1;
export const START_STARS = 3;
