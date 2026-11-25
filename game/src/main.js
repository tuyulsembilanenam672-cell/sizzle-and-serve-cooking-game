// Sizzle & Serve — game logic: orders, cooking, serving, the shift clock.
// A 3-minute lunch rush: take orders, grill and boil what needs cooking,
// stack the plate to match the ticket, serve before patience runs out.
import {
  INGREDIENTS, DISHES, BIN_ORDER, LAYOUT, CANVAS_W, CANVAS_H,
  SHIFT_SECONDS, MAX_ORDERS, MAX_PLATE, GRILL_SLOTS, POT_SLOTS,
  START_STARS, spawnIntervalSecs, patienceSecs, cookReadyWindowSecs,
  serveScore, ratingFor, pickDish, sameMultiset, plateDiff, mulberry32,
} from './data.js';
import { sfx, setSizzle, startGroove, stopGroove, unlockAudio, setMuted, isMuted } from './audio.js';
import {
  drawBackground, drawTopBar, drawOrders, drawStations, drawBins,
  drawPlatePanel, drawSidePanel, drawParticles, drawIngredient,
  binRect, grillSlotRect, potSlotRect, ticketRect, serveRect, trashRect,
  topBarButtonRect,
} from './render.js';

const params = new URLSearchParams(location.search);
const SHOT = params.get('shot');
const SEED = parseInt(params.get('seed') || '1', 10) || 1;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

export const G = {
  screen: 'title',
  timeLeft: SHIFT_SECONDS,
  score: 0,
  combo: 0,
  bestCombo: 0,
  served: 0,
  missed: 0,
  stars: START_STARS,
  orders: [],
  selectedOrderId: null,
  nextOrderId: 1,
  plate: [],
  plateHit: [],
  plateWobble: 0,
  grill: [null, null],
  pot: [null],
  particles: [],
  popups: [],
  message: '',
  messageKind: '',
  messageUntil: 0,
  nextSpawnIn: 12,
  elapsed: 0,
  rng: Math.random,
  frozen: false,
  muted: false,
  lastTickSecond: -1,
  overReason: '',
};
// Exposed for automated play-testing (screenshots / self-checks).
window.__game = G;

function setMessage(text, kind = '', secs = 2.5) {
  G.message = text;
  G.messageKind = kind;
  G.messageUntil = performance.now() + secs * 1000;
}

function newOrder() {
  const elapsed = G.elapsed;
  const dish = pickDish(G.rng);
  const patience = patienceSecs(elapsed);
  const order = {
    id: G.nextOrderId++,
    dish,
    patience,
    maxPatience: patience,
  };
  G.orders.push(order);
  if (!G.selectedOrderId) G.selectedOrderId = order.id;
  return order;
}

export function newGame() {
  G.screen = 'playing';
  G.timeLeft = SHIFT_SECONDS;
  G.score = 0;
  G.combo = 0;
  G.bestCombo = 0;
  G.served = 0;
  G.missed = 0;
  G.stars = START_STARS;
  G.orders = [];
  G.selectedOrderId = null;
  G.nextOrderId = 1;
  G.plate = [];
  G.plateHit = [];
  G.grill = [null, null];
  G.pot = [null];
  G.particles = [];
  G.popups = [];
  G.nextSpawnIn = 12;
  G.elapsed = 0;
  G.rng = SHOT ? mulberry32(SEED) : Math.random;
  G.frozen = !!SHOT;
  G.overReason = '';
  newOrder();
  newOrder();
  setMessage('Shift started! Serve the tickets before patience runs out.', '', 3);
  sfx.start();
  startGroove();
  hideOverlays();
}

// ---- deterministic scenes for screenshots (?shot=cover|grill|serve|end) ----
function setupShot(name) {
  newGame();
  G.frozen = true;
  if (name === 'cover') {
    G.timeLeft = 154;
    G.score = 340;
    G.combo = 2;
    G.served = 3;
    G.plate = ['bunBottom', 'patty', 'cheese'];
    G.grill[0] = { item: 'meat', t: 2.2, state: 'cooking', announced: true };
    G.orders[0].patience = 34;
    setMessage('Mid-rush: burger half-built, meat on the grill.', '', 999);
  } else if (name === 'grill') {
    G.timeLeft = 121;
    G.score = 610;
    G.combo = 3;
    G.served = 5;
    G.grill[0] = { item: 'patty', t: 4.6, state: 'cooking', announced: true };
    G.grill[1] = { item: 'meat', t: 5.0, state: 'ready', announced: true };
    G.pot[0] = { item: 'pasta', t: 3.1, state: 'cooking', announced: true };
    G.plate = ['bowl', 'lettuce'];
    G.orders[0].patience = 18;
    setMessage('Grill and pot both busy — watch the timers!', '', 999);
  } else if (name === 'serve') {
    G.timeLeft = 96;
    G.score = 890;
    G.combo = 4;
    G.served = 7;
    G.plate = ['bunBottom', 'patty', 'cheese', 'lettuce', 'tomato', 'bunTop'];
    G.orders[0].dish = 'burger';
    if (G.orders[1]) G.orders[1].dish = 'salad';
    G.orders[0].patience = 41;
    G.selectedOrderId = G.orders[0].id;
    setMessage('Perfect burger — hit SERVE!', 'good', 999);
  } else if (name === 'end') {
    G.timeLeft = 0;
    G.score = 1840;
    G.served = 11;
    G.bestCombo = 5;
    G.combo = 5;
    endShift('Time! The lunch rush is over.');
    return;
  }
  G.screen = 'playing';
}

// ---- particles & popups ----
function burst(x, y, kind, n, color) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 30 + Math.random() * 90;
    G.particles.push({
      kind, x, y,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40,
      r: kind === 'confetti' ? 4 + Math.random() * 4 : 3 + Math.random() * 5,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 8,
      color: color || ['#f7c948', '#e0492f', '#69b455', '#7fb3d5'][i % 4],
      life: 0.9 + Math.random() * 0.5, maxLife: 1.4,
    });
  }
}
function steam(x, y) {
  G.particles.push({
    kind: 'steam', x: x + (Math.random() - 0.5) * 20, y,
    vx: (Math.random() - 0.5) * 8, vy: -28 - Math.random() * 20,
    r: 7 + Math.random() * 6, rot: 0, vr: 0, color: '',
    life: 0.9, maxLife: 0.9,
  });
}
function popup(x, y, text, color) {
  G.popups.push({ x, y, text, color: color || '#2e7d32', life: 1.4, maxLife: 1.4 });
}

// ---- player actions ----
function addToPlate(id) {
  if (G.plate.length >= MAX_PLATE) {
    setMessage('Plate is full — serve it or clear it!', 'bad');
    sfx.error();
    return false;
  }
  G.plate.push(id);
  G.plateWobble = 1;
  sfx.place();
  const p = LAYOUT.plate;
  burst(p.x + 200, p.y + p.h - 90, 'spark', 4);
  return true;
}

export function clickBin(id) {
  const ing = INGREDIENTS[id];
  if (!ing) return;
  if (ing.cook === 'grill') {
    const free = G.grill.findIndex((s) => !s);
    if (free === -1) { setMessage('Grill is full — wait for a patty!', 'bad'); sfx.error(); return; }
    G.grill[free] = { item: id, t: 0, state: 'cooking', announced: false };
    sfx.grillOn();
    const r = grillSlotRect(free);
    burst(r.x + r.w / 2, r.y + 40, 'spark', 6);
    setMessage(`${ing.name} on the grill — don't let it burn!`);
  } else if (ing.cook === 'pot') {
    if (G.pot[0]) { setMessage('Pot is busy — one pasta at a time!', 'bad'); sfx.error(); return; }
    G.pot[0] = { item: id, t: 0, state: 'cooking', announced: false };
    sfx.potOn();
    const r = potSlotRect();
    burst(r.x + r.w / 2, r.y + 40, 'spark', 6);
    setMessage('Pasta in the pot — it boils fast!');
  } else {
    addToPlate(id);
  }
}

function clickStationSlot(kind, i) {
  const slot = kind === 'grill' ? G.grill[i] : G.pot[0];
  if (!slot) return;
  if (slot.state === 'burnt') {
    if (kind === 'grill') G.grill[i] = null; else G.pot[0] = null;
    sfx.burnt();
    const r = kind === 'grill' ? grillSlotRect(i) : potSlotRect();
    burst(r.x + r.w / 2, r.y + 50, 'smoke', 8, '#555');
    setMessage('Tossed the burnt food. Watch the ring!', 'bad');
    return;
  }
  if (slot.state === 'ready') {
    if (addToPlate(slot.item)) {
      if (kind === 'grill') G.grill[i] = null; else G.pot[0] = null;
      setMessage(`${INGREDIENTS[slot.item].name} on the plate — looking good!`, 'good', 1.6);
    }
    return;
  }
  setMessage('Still cooking — wait for READY!', 'bad', 1.4);
  sfx.click();
}

export function servePlate() {
  const order = G.orders.find((o) => o.id === G.selectedOrderId);
  if (!order) { setMessage('No order selected — click a ticket first!', 'bad'); sfx.error(); return; }
  if (G.plate.length === 0) { setMessage('The plate is empty!', 'bad'); sfx.error(); return; }
  const dish = DISHES[order.dish];
  if (sameMultiset(G.plate, dish.recipe)) {
    const pts = serveScore(dish, order.patience, order.maxPatience, G.combo);
    G.score += pts;
    G.combo += 1;
    G.bestCombo = Math.max(G.bestCombo, G.combo);
    G.served += 1;
    const p = LAYOUT.plate;
    burst(p.x + 200, p.y + 90, 'confetti', 26);
    popup(p.x + 200, p.y + 70, `+${pts}`, '#2e7d32');
    if (G.combo >= 3) popup(p.x + 200, p.y + 40, `COMBO x${G.combo}!`, '#b97d1e');
    setMessage(`${dish.name} served! +${pts} points.`, 'good');
    sfx.serve();
    G.orders = G.orders.filter((o) => o.id !== order.id);
    G.plate = [];
    G.selectedOrderId = G.orders.length ? G.orders[0].id : null;
  } else {
    const { missing, extra } = plateDiff(G.plate, dish.recipe);
    const bits = [];
    if (missing.length) bits.push(`missing ${missing.map((m) => INGREDIENTS[m].short).join(', ')}`);
    if (extra.length) bits.push(`extra ${extra.map((m) => INGREDIENTS[m].short).join(', ')}`);
    setMessage(`Not quite — ${bits.join('; ')}. The customer waits…`, 'bad', 3);
    order.patience = Math.max(1, order.patience * 0.8);
    G.combo = 0;
    sfx.error();
  }
}

export function clearPlate() {
  if (G.plate.length === 0) { setMessage('Plate is already empty.', '', 1.4); return; }
  G.plate = [];
  G.plateWobble = 0;
  sfx.click();
  setMessage('Plate cleared. Start the dish again!');
}

function endShift(reason) {
  if (G.screen === 'over') return;
  G.screen = 'over';
  G.overReason = reason;
  sfx.end();
  stopGroove();
  setSizzle(0);
  showEndOverlay();
}

// ---- per-frame update ----
function updateSlot(slot, dt) {
  if (!slot) return;
  slot.t += dt;
  const ing = INGREDIENTS[slot.item];
  if (slot.state === 'cooking' && slot.t >= ing.cookSecs) {
    slot.state = 'ready';
    if (!slot.announced) { slot.announced = true; sfx.ready(); }
  } else if (slot.state === 'ready' && slot.t >= ing.cookSecs + cookReadyWindowSecs()) {
    slot.state = 'burnt';
    sfx.burnt();
    setMessage(`The ${ing.name.toLowerCase()} burnt! Click it to toss it.`, 'bad', 3);
  }
}

function update(dt, now) {
  if (G.screen !== 'playing' || G.frozen) {
    // Particles still drift on the title screen for a lively backdrop.
    updateFx(dt);
    return;
  }
  G.elapsed += dt;
  G.timeLeft -= dt;
  const whole = Math.ceil(G.timeLeft);
  if (whole <= 10 && whole > 0 && whole !== G.lastTickSecond) {
    G.lastTickSecond = whole;
    sfx.tick();
  }
  // Order spawning.
  G.nextSpawnIn -= dt;
  if (G.nextSpawnIn <= 0) {
    if (G.orders.length < MAX_ORDERS) {
      newOrder();
      sfx.click();
    }
    G.nextSpawnIn = spawnIntervalSecs(G.elapsed);
  }
  // Patience & expiry.
  for (const order of [...G.orders]) {
    order.patience -= dt;
    if (order.patience <= 0) {
      G.orders = G.orders.filter((o) => o.id !== order.id);
      G.missed += 1;
      G.combo = 0;
      G.score = Math.max(0, G.score - 100);
      G.stars = Math.max(0, G.stars - 1);
      sfx.expire();
      setMessage(`${DISHES[order.dish].name} walked out! −100 points, lost a star.`, 'bad', 3);
      if (G.selectedOrderId === order.id) {
        G.selectedOrderId = G.orders.length ? G.orders[0].id : null;
      }
      if (G.stars <= 0) {
        endShift('The kitchen lost all its stars — the rush shut you down.');
        return;
      }
    }
  }
  // Cooking.
  G.grill.forEach((s) => updateSlot(s, dt));
  updateSlot(G.pot[0], dt);
  const cooking = G.grill.filter(Boolean).length + (G.pot[0] ? 1 : 0);
  setSizzle(cooking);
  // Ambient steam from anything cooking.
  if (Math.random() < dt * 6 * Math.max(1, cooking)) {
    const slots = [];
    G.grill.forEach((s, i) => { if (s) slots.push(grillSlotRect(i)); });
    if (G.pot[0]) slots.push(potSlotRect());
    if (slots.length) {
      const r = slots[Math.floor(Math.random() * slots.length)];
      steam(r.x + r.w / 2, r.y + 30);
    }
  }
  G.plateWobble = Math.max(0, G.plateWobble - dt * 3);
  if (G.message && now > G.messageUntil) { G.message = ''; G.messageKind = ''; }
  updateFx(dt);
  if (G.timeLeft <= 0) {
    G.timeLeft = 0;
    endShift('Time! The lunch rush is over.');
  }
}

function updateFx(dt) {
  for (const pt of G.particles) {
    pt.life -= dt;
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vy += pt.kind === 'confetti' ? 160 * dt : -12 * dt;
    pt.rot += pt.vr * dt;
  }
  G.particles = G.particles.filter((p) => p.life > 0);
  for (const pop of G.popups) {
    pop.life -= dt;
    pop.y -= 34 * dt;
  }
  G.popups = G.popups.filter((p) => p.life > 0);
}

// ---- input: mouse clicks map to the same rectangles render draws ----
function toCanvas(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
    y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
  };
}
function inside(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

function handleClick(p) {
  unlockAudio();
  // Top-bar buttons work on every screen.
  if (inside(p, topBarButtonRect('sound'))) { toggleMute(); return; }
  if (inside(p, topBarButtonRect('pause'))) {
    if (G.screen === 'playing' || G.screen === 'paused') togglePause();
    return;
  }
  if (inside(p, topBarButtonRect('help'))) {
    helpEl.classList.toggle('hidden');
    return;
  }
  if (G.screen !== 'playing') return;
  // Tickets.
  for (let i = 0; i < G.orders.length; i++) {
    if (inside(p, ticketRect(i))) {
      G.selectedOrderId = G.orders[i].id;
      sfx.click();
      setMessage(`${DISHES[G.orders[i].dish].name} selected — build it on the plate!`, '', 1.8);
      return;
    }
  }
  // Grill / pot slots.
  for (let i = 0; i < GRILL_SLOTS; i++) {
    if (inside(p, grillSlotRect(i))) { clickStationSlot('grill', i); return; }
  }
  if (inside(p, potSlotRect())) { clickStationSlot('pot', 0); return; }
  // Ingredient bins.
  for (let i = 0; i < BIN_ORDER.length; i++) {
    if (inside(p, binRect(i))) { clickBin(BIN_ORDER[i]); return; }
  }
  // Plate layers (click to remove one layer).
  for (let i = G.plateHit.length - 1; i >= 0; i--) {
    const h = G.plateHit[i];
    if (h && inside(p, h)) {
      const removed = G.plate.splice(h.layer, 1)[0];
      sfx.click();
      setMessage(`Removed ${INGREDIENTS[removed].name} from the plate.`, '', 1.6);
      return;
    }
  }
  // Serve / clear.
  if (inside(p, serveRect())) { servePlate(); return; }
  if (inside(p, trashRect())) { clearPlate(); return; }
}

canvas.addEventListener('click', (e) => handleClick(toCanvas(e)));

document.addEventListener('keydown', (e) => {
  if (G.screen === 'playing') {
    if (e.key === 'Enter') { servePlate(); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { clearPlate(); return; }
    if (e.key === 'p' || e.key === 'P') { togglePause(); return; }
    const idx = BIN_ORDER.findIndex((id) => INGREDIENTS[id].key.toLowerCase() === e.key.toLowerCase());
    if (idx !== -1) { unlockAudio(); clickBin(BIN_ORDER[idx]); return; }
  }
  if (e.key === 'm' || e.key === 'M') toggleMute();
  if (e.key === ' ' && G.screen === 'title') { e.preventDefault(); startGame(); }
});

// ---- DOM overlays ----
const titleEl = document.getElementById('title-screen');
const pauseEl = document.getElementById('pause-screen');
const endEl = document.getElementById('end-screen');
const helpEl = document.getElementById('help-box');

function hideOverlays() {
  titleEl.classList.add('hidden');
  pauseEl.classList.add('hidden');
  endEl.classList.add('hidden');
  helpEl.classList.add('hidden');
}
function startGame() {
  unlockAudio();
  newGame();
}
function togglePause() {
  if (G.screen === 'playing') {
    G.screen = 'paused';
    pauseEl.classList.remove('hidden');
    setSizzle(0);
  } else if (G.screen === 'paused') {
    G.screen = 'playing';
    pauseEl.classList.add('hidden');
  }
}
function toggleMute() {
  setMuted(!isMuted());
  G.muted = isMuted();
}
function showEndOverlay() {
  const r = ratingFor(G.score, G.served);
  document.getElementById('end-title').textContent = G.overReason || 'Shift over!';
  document.getElementById('end-score').textContent = G.score;
  document.getElementById('end-served').textContent = G.served;
  document.getElementById('end-missed').textContent = G.missed;
  document.getElementById('end-combo').textContent = `x${G.bestCombo}`;
  document.getElementById('end-rating').textContent = `${'★'.repeat(r.hats)}${'☆'.repeat(3 - r.hats)} ${r.label}`;
  endEl.classList.remove('hidden');
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('again-btn').addEventListener('click', startGame);
document.getElementById('resume-btn').addEventListener('click', togglePause);
document.getElementById('restart-btn').addEventListener('click', startGame);

// ---- render + main loop ----
function draw(now) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawBackground(ctx, now);
  if (G.screen === 'title') {
    // A lively kitchen behind the title card: demo orders + a half plate.
    drawTopBar(ctx, G);
    drawOrders(ctx, G);
    drawStations(ctx, G, now);
    drawBins(ctx, G);
    drawPlatePanel(ctx, G, now);
    drawSidePanel(ctx, G, now);
  } else {
    drawTopBar(ctx, G);
    drawOrders(ctx, G);
    drawStations(ctx, G, now);
    drawBins(ctx, G);
    drawPlatePanel(ctx, G, now);
    drawSidePanel(ctx, G, now);
  }
  drawParticles(ctx, G);
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt, now);
  draw(now);
  requestAnimationFrame(loop);
}

// Boot: a demo kitchen sits behind the title screen so the first
// screenshot already shows the game; a ?shot= URL stages one scene.
if (SHOT) {
  setupShot(SHOT);
  hideOverlays();
  if (SHOT === 'end') showEndOverlay();
} else {
  // Demo backdrop for the title screen.
  G.orders = [
    { id: 1, dish: 'burger', patience: 38, maxPatience: 50 },
    { id: 2, dish: 'salad', patience: 26, maxPatience: 50 },
  ];
  G.selectedOrderId = 1;
  G.nextOrderId = 3;
  G.plate = ['bunBottom', 'patty'];
  G.grill[0] = { item: 'meat', t: 2.0, state: 'cooking', announced: true };
  G.timeLeft = 154;
  G.score = 120;
  G.served = 1;
}
requestAnimationFrame(loop);
