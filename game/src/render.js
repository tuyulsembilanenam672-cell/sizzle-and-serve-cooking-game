// Sizzle & Serve — rendering: every sprite is drawn with canvas paths.
// No image files, no fonts from the network (system font stack only).
import { INGREDIENTS, DISHES, BIN_ORDER, LAYOUT, CANVAS_W, CANVAS_H } from './data.js';

export function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ---- one vector drawing per ingredient, centred at (x, y), width ~ s ----
export function drawIngredient(ctx, id, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  const u = s / 100; // unit: drawings are authored in a 100x100 box
  switch (id) {
    case 'bunBottom': {
      ctx.fillStyle = '#e8a94e';
      rr(ctx, -42 * u, -14 * u, 84 * u, 30 * u, 8 * u); ctx.fill();
      ctx.fillStyle = '#c98a2e';
      rr(ctx, -42 * u, 6 * u, 84 * u, 10 * u, 5 * u); ctx.fill();
      ctx.fillStyle = '#f4c87a';
      rr(ctx, -38 * u, -14 * u, 76 * u, 8 * u, 4 * u); ctx.fill();
      break;
    }
    case 'bunTop': {
      ctx.fillStyle = '#e8a94e';
      ctx.beginPath();
      ctx.arc(0, 8 * u, 42 * u, Math.PI, 0);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c98a2e';
      rr(ctx, -42 * u, 4 * u, 84 * u, 10 * u, 5 * u); ctx.fill();
      ctx.fillStyle = '#fff3d0';
      for (const [sx, sy] of [[-22, -18], [0, -28], [22, -18], [-10, -8], [12, -8]]) {
        ellipse(ctx, sx * u, sy * u, 4 * u, 2.5 * u);
      }
      break;
    }
    case 'patty': {
      ctx.fillStyle = '#7a4a1f';
      rr(ctx, -44 * u, -16 * u, 88 * u, 32 * u, 14 * u); ctx.fill();
      ctx.fillStyle = '#5d3413';
      for (const gx of [-24, 0, 24]) {
        ctx.fillRect((gx - 3) * u, -14 * u, 6 * u, 28 * u);
      }
      ctx.fillStyle = '#935c28';
      rr(ctx, -40 * u, -12 * u, 80 * u, 8 * u, 4 * u); ctx.fill();
      break;
    }
    case 'meat': {
      ctx.fillStyle = '#a0522d';
      ctx.beginPath();
      ctx.moveTo(-42 * u, -6 * u);
      ctx.quadraticCurveTo(-30 * u, -26 * u, 0, -20 * u);
      ctx.quadraticCurveTo(34 * u, -26 * u, 42 * u, -4 * u);
      ctx.quadraticCurveTo(30 * u, 18 * u, 0, 16 * u);
      ctx.quadraticCurveTo(-34 * u, 18 * u, -42 * u, -6 * u);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d98c4a';
      for (const [sx, sy] of [[-18, -6], [4, -10], [20, 2], [-4, 6]]) ellipse(ctx, sx * u, sy * u, 3 * u, 3 * u);
      ctx.fillStyle = '#7c3a1d';
      for (const [sx, sy] of [[-28, 4], [12, -2], [28, 8]]) ellipse(ctx, sx * u, sy * u, 2.5 * u, 2.5 * u);
      break;
    }
    case 'cheese': {
      ctx.fillStyle = '#f7c948';
      ctx.beginPath();
      ctx.moveTo(-42 * u, -14 * u); ctx.lineTo(42 * u, -14 * u);
      ctx.lineTo(42 * u, 6 * u); ctx.lineTo(18 * u, 22 * u); ctx.lineTo(18 * u, 2 * u);
      ctx.lineTo(-8 * u, 14 * u); ctx.lineTo(-8 * u, -2 * u); ctx.lineTo(-42 * u, 8 * u);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e0a92e';
      ctx.fillRect(-42 * u, -14 * u, 84 * u, 4 * u);
      break;
    }
    case 'lettuce': {
      ctx.fillStyle = '#69b455';
      for (const [lx, ly, r] of [[-26, 0, 18], [0, -8, 22], [26, 0, 18], [-12, 8, 16], [14, 8, 16]]) {
        ellipse(ctx, lx * u, ly * u, r * u, (r * 0.8) * u);
      }
      ctx.strokeStyle = '#4a8a3a';
      ctx.lineWidth = 2.5 * u;
      ctx.beginPath();
      ctx.moveTo(-30 * u, 2 * u); ctx.quadraticCurveTo(0, -14 * u, 30 * u, 2 * u);
      ctx.stroke();
      break;
    }
    case 'tomato': {
      ctx.fillStyle = '#e0492f';
      ellipse(ctx, 0, 0, 40 * u, 30 * u);
      ctx.fillStyle = '#f0755a';
      ellipse(ctx, -8 * u, -6 * u, 26 * u, 16 * u);
      ctx.fillStyle = '#c9331e';
      ellipse(ctx, 0, 0, 30 * u, 20 * u);
      ctx.fillStyle = '#f6b8a0';
      for (const [sx, sy] of [[-12, -4], [12, -4], [0, 6]]) ellipse(ctx, sx * u, sy * u, 5 * u, 3 * u);
      ctx.fillStyle = '#69b455';
      ellipse(ctx, 0, -28 * u, 8 * u, 4 * u);
      break;
    }
    case 'cucumber': {
      ctx.fillStyle = '#5da85f';
      ellipse(ctx, 0, 0, 38 * u, 38 * u);
      ctx.fillStyle = '#cfe8b8';
      ellipse(ctx, 0, 0, 28 * u, 28 * u);
      ctx.fillStyle = '#9dc98a';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ellipse(ctx, Math.cos(a) * 16 * u, Math.sin(a) * 16 * u, 4 * u, 4 * u);
      }
      ctx.fillStyle = '#eef7dd';
      ellipse(ctx, 0, 0, 8 * u, 8 * u);
      break;
    }
    case 'bowl': {
      ctx.fillStyle = '#5b8fb9';
      ctx.beginPath();
      ctx.arc(0, -6 * u, 40 * u, 0, Math.PI);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7fb3d5';
      rr(ctx, -42 * u, -12 * u, 84 * u, 8 * u, 4 * u); ctx.fill();
      ctx.fillStyle = '#3f6d94';
      ellipse(ctx, 0, -8 * u, 34 * u, 5 * u);
      break;
    }
    case 'dressing': {
      ctx.fillStyle = '#f2e3a1';
      ctx.beginPath();
      ctx.moveTo(0, -30 * u);
      ctx.quadraticCurveTo(26 * u, -6 * u, 18 * u, 18 * u);
      ctx.quadraticCurveTo(0, 30 * u, -18 * u, 18 * u);
      ctx.quadraticCurveTo(-26 * u, -6 * u, 0, -30 * u);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#d9c06a';
      ctx.lineWidth = 3 * u;
      ctx.beginPath();
      ctx.moveTo(-8 * u, -14 * u); ctx.quadraticCurveTo(10 * u, -2 * u, -6 * u, 12 * u);
      ctx.stroke();
      break;
    }
    case 'pasta': {
      ctx.strokeStyle = '#f0d089';
      ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        ctx.lineWidth = (7 - i) * u;
        ctx.beginPath();
        ctx.moveTo((-34 + i * 4) * u, (-14 + i * 7) * u);
        ctx.quadraticCurveTo((i * 10 - 20) * u, (6 - i * 3) * u, (34 - i * 3) * u, (16 - i * 6) * u);
        ctx.stroke();
      }
      ctx.strokeStyle = '#d9b45c';
      ctx.lineWidth = 3 * u;
      ctx.beginPath();
      ctx.moveTo(-30 * u, 4 * u); ctx.quadraticCurveTo(0, 14 * u, 30 * u, -2 * u);
      ctx.stroke();
      break;
    }
    case 'sauce': {
      ctx.fillStyle = '#c0392b';
      ellipse(ctx, 0, 2 * u, 38 * u, 28 * u);
      ctx.fillStyle = '#e05a40';
      ellipse(ctx, -6 * u, -6 * u, 24 * u, 14 * u);
      ctx.fillStyle = '#8e2418';
      for (const [sx, sy] of [[-14, 8], [10, 10], [18, -2]]) ellipse(ctx, sx * u, sy * u, 4 * u, 3 * u);
      ctx.fillStyle = '#7fb3d5';
      ctx.fillRect(14 * u, -34 * u, 6 * u, 26 * u);
      break;
    }
    case 'basil': {
      ctx.fillStyle = '#2e7d32';
      for (const [lx, ly, rot] of [[-14, 4, -0.5], [14, -6, 0.5], [0, 10, 0]]) {
        ctx.save();
        ctx.translate(lx * u, ly * u); ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, 20 * u, 11 * u, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.restore();
      }
      ctx.strokeStyle = '#1b5e20';
      ctx.lineWidth = 2 * u;
      ctx.beginPath(); ctx.moveTo(-28 * u, 8 * u); ctx.lineTo(28 * u, -8 * u); ctx.stroke();
      break;
    }
    case 'shell': {
      ctx.fillStyle = '#f2c14e';
      ctx.beginPath();
      ctx.arc(0, 10 * u, 40 * u, Math.PI, 0);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d9a521';
      ctx.beginPath();
      ctx.arc(0, 10 * u, 32 * u, Math.PI, 0);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f2c14e';
      for (const sx of [-24, -8, 8, 24]) {
        ctx.beginPath(); ctx.arc(sx * u, (10 - 26) * u, 5 * u, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    default: {
      ctx.fillStyle = '#888';
      ellipse(ctx, 0, 0, 30 * u, 30 * u);
    }
  }
  ctx.restore();
}

// ---- geometry helpers shared with input handling in main.js ----
export function binRect(i) {
  const b = LAYOUT.bins;
  const col = i % b.cols;
  const row = Math.floor(i / b.cols);
  return {
    x: b.x + col * (b.cellW + b.gap),
    y: b.y + 34 + row * (b.cellH + b.gap),
    w: b.cellW, h: b.cellH,
  };
}
export function grillSlotRect(i) {
  const g = LAYOUT.grill;
  return { x: g.x + 16 + i * 148, y: g.y + 58, w: 132, h: 118 };
}
export function potSlotRect() {
  const p = LAYOUT.pot;
  return { x: p.x + 16, y: p.y + 58, w: p.w - 32, h: 118 };
}
export function ticketRect(i) {
  const o = LAYOUT.orders;
  return { x: o.x + i * (o.ticketW + o.gap), y: o.y, w: o.ticketW, h: o.h };
}
export function serveRect() {
  const s = LAYOUT.side;
  return { x: s.x + 20, y: s.y + 96, w: 240, h: 64 };
}
export function trashRect() {
  const s = LAYOUT.side;
  return { x: s.x + 276, y: s.y + 96, w: 224, h: 64 };
}

// ---- kitchen backdrop ----
export function drawBackground(ctx, t) {
  // Wall tiles.
  ctx.fillStyle = '#f3e2c7';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.strokeStyle = 'rgba(180,140,90,0.25)';
  ctx.lineWidth = 1;
  for (let x = 0; x < CANVAS_W; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 430); ctx.stroke();
  }
  for (let y = 0; y < 430; y += 64) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
  }
  // Warm wall band below the top bar.
  ctx.fillStyle = '#e8b04b';
  ctx.fillRect(0, 56, CANVAS_W, 10);
  // Wooden counter band.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(0, 430, CANVAS_W, 290);
  ctx.fillStyle = '#a06a35';
  for (let y = 446; y < CANVAS_H; y += 46) ctx.fillRect(0, y, CANVAS_W, 3);
  // Soft light sweep.
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, 'rgba(255,255,255,0.10)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

function panel(ctx, x, y, w, h, title) {
  ctx.fillStyle = 'rgba(255,251,240,0.94)';
  rr(ctx, x, y, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 2;
  rr(ctx, x, y, w, h, 14); ctx.stroke();
  if (title) {
    ctx.fillStyle = '#7a4a1f';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(title, x + 14, y + 24);
  }
}

// ---- top bar: timer, score, combo, stars, canvas buttons ----
export function topBarButtonRect(name) {
  if (name === 'sound') return { x: 1032, y: 10, w: 78, h: 36 };
  if (name === 'pause') return { x: 1118, y: 10, w: 70, h: 36 };
  return { x: 1196, y: 10, w: 70, h: 36 }; // help
}

export function drawTopBar(ctx, G) {
  const b = LAYOUT.topBar;
  ctx.fillStyle = '#3d2b1f';
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = '#f7c948';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🍳 SIZZLE & SERVE', 20, 36);
  // Timer.
  const t = Math.max(0, Math.ceil(G.timeLeft));
  const mm = Math.floor(t / 60);
  const ss = String(t % 60).padStart(2, '0');
  const low = t <= 30 && G.screen === 'playing';
  ctx.fillStyle = low ? '#ff6b5e' : '#ffffff';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${mm}:${ss}`, 640, 38);
  ctx.fillStyle = '#cbb59a';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('SHIFT', 640, 52);
  // Stars + served, right of the timer.
  ctx.fillStyle = '#f7c948';
  ctx.font = '20px system-ui, sans-serif';
  ctx.textAlign = 'left';
  let stars = '';
  for (let i = 0; i < 3; i++) stars += i < G.stars ? '★' : '☆';
  ctx.fillText(stars, 706, 34);
  ctx.fillStyle = '#cbb59a';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`served ${G.served}`, 706, 52);
  // Score / combo, right-aligned before the buttons.
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText(`Score ${G.score}`, 1020, 30);
  ctx.fillStyle = G.combo >= 3 ? '#f7c948' : '#cbb59a';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(G.combo >= 2 ? `COMBO x${G.combo}` : 'no combo yet', 1020, 50);
  // Canvas buttons: Sound / Pause / Help.
  const labels = [
    ['sound', G.muted ? '🔇 Off' : '🔊 On'],
    ['pause', G.screen === 'paused' ? '▶ Play' : '⏸ Pause'],
    ['help', '? Help'],
  ];
  for (const [name, label] of labels) {
    const r = topBarButtonRect(name);
    ctx.fillStyle = 'rgba(255,248,234,0.94)';
    rr(ctx, r.x, r.y, r.w, r.h, 9); ctx.fill();
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 1.5;
    rr(ctx, r.x, r.y, r.w, r.h, 9); ctx.stroke();
    ctx.fillStyle = '#3d2b1f';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, r.x + r.w / 2, r.y + 23);
  }
}

// ---- order tickets ----
export function drawOrders(ctx, G) {
  if (G.orders.length === 0) {
    ctx.fillStyle = '#8a7a63';
    ctx.font = 'italic 15px system-ui, sans-serif';
    ctx.fillText('No orders yet — the lunch rush is coming…', LAYOUT.orders.x + 4, LAYOUT.orders.y + 60);
    return;
  }
  G.orders.forEach((order, i) => {
    const r = ticketRect(i);
    const dish = DISHES[order.dish];
    const selected = order.id === G.selectedOrderId;
    const urgent = order.patience < 12;
    ctx.fillStyle = selected ? '#fff6d8' : '#fffdf6';
    rr(ctx, r.x, r.y, r.w, r.h, 12); ctx.fill();
    ctx.strokeStyle = selected ? '#e8a94e' : '#d8c49a';
    ctx.lineWidth = selected ? 3 : 2;
    rr(ctx, r.x, r.y, r.w, r.h, 12); ctx.stroke();
    // Patience bar.
    const frac = Math.max(0, order.patience / order.maxPatience);
    ctx.fillStyle = '#e8ddd0';
    rr(ctx, r.x + 10, r.y + r.h - 16, r.w - 20, 8, 4); ctx.fill();
    ctx.fillStyle = urgent ? '#e0492f' : (frac < 0.5 ? '#e8a94e' : '#69b455');
    if (frac > 0) { rr(ctx, r.x + 10, r.y + r.h - 16, (r.w - 20) * frac, 8, 4); ctx.fill(); }
    // Dish name + price.
    ctx.fillStyle = '#3d2b1f';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(dish.name, r.x + 12, r.y + 26);
    ctx.fillStyle = '#8a7a63';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(`$${dish.price} base`, r.x + 12, r.y + 44);
    // Recipe dots: filled = already on the plate for this order.
    const need = {};
    for (const it of dish.recipe) need[it] = (need[it] || 0) + 1;
    const have = {};
    if (selected) for (const it of G.plate) have[it] = (have[it] || 0) + 1;
    let dx = r.x + 12;
    const dy = r.y + 78;
    for (const it of dish.recipe) {
      const done = selected && (have[it] || 0) > 0;
      if (done) have[it]--;
      ctx.fillStyle = done ? INGREDIENTS[it].color : '#e8ddd0';
      ctx.strokeStyle = '#b09a7a';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(dx + 11, dy, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      drawIngredient(ctx, it, dx + 11, dy, 16);
      dx += 27;
      if (dx > r.x + r.w - 24) break;
    }
    if (selected) {
      ctx.fillStyle = '#b97d1e';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('SELECTED', r.x + r.w - 10, r.y + 26);
    }
  });
}

// ---- cooking stations ----
export function drawStations(ctx, G, now) {
  const g = LAYOUT.grill;
  panel(ctx, g.x, g.y, g.w, g.h, 'GRILL — cook patties & meat');
  G.grill.forEach((slot, i) => {
    const r = grillSlotRect(i);
    ctx.fillStyle = '#3d2b1f';
    rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
    // Grill bars.
    ctx.strokeStyle = '#5d4030';
    ctx.lineWidth = 4;
    for (let gy = r.y + 16; gy < r.y + r.h - 8; gy += 14) {
      ctx.beginPath(); ctx.moveTo(r.x + 8, gy); ctx.lineTo(r.x + r.w - 8, gy); ctx.stroke();
    }
    if (!slot) {
      ctx.fillStyle = '#8a7a63';
      ctx.font = '13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('empty', r.x + r.w / 2, r.y + r.h / 2 + 5);
      return;
    }
    const ing = INGREDIENTS[slot.item];
    const frac = Math.min(1, slot.t / ing.cookSecs);
    const ready = slot.state === 'ready';
    const burnt = slot.state === 'burnt';
    drawIngredient(ctx, slot.item, r.x + r.w / 2, r.y + 52, burnt ? 62 : 72);
    if (burnt) {
      ctx.fillStyle = 'rgba(20,10,5,0.45)';
      rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
      ctx.fillStyle = '#ff6b5e';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BURNT!', r.x + r.w / 2, r.y + 26);
      ctx.fillStyle = '#fff';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('click to toss it', r.x + r.w / 2, r.y + r.h - 10);
    } else if (ready) {
      const pulse = 0.7 + 0.3 * Math.sin(now / 130);
      ctx.fillStyle = `rgba(247,201,72,${pulse})`;
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('READY!', r.x + r.w / 2, r.y + 24);
    } else {
      ctx.fillStyle = '#f7c948';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('cooking…', r.x + r.w / 2, r.y + 24);
    }
    // Progress ring around the slot.
    ctx.strokeStyle = burnt ? '#e0492f' : ready ? '#f7c948' : '#69b455';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(r.x + r.w / 2, r.y + 52, 52, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
    ctx.stroke();
  });

  const p = LAYOUT.pot;
  panel(ctx, p.x, p.y, p.w, p.h, 'POT — boil pasta');
  const pr = potSlotRect();
  ctx.fillStyle = '#2f4a5a';
  rr(ctx, pr.x, pr.y, pr.w, pr.h, 10); ctx.fill();
  ctx.fillStyle = '#7fb3d5';
  rr(ctx, pr.x + 8, pr.y + 18, pr.w - 16, 26, 8); ctx.fill();
  const slot = G.pot[0];
  if (!slot) {
    ctx.fillStyle = '#bcd6e8';
    ctx.font = '13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('empty pot', pr.x + pr.w / 2, pr.y + 84);
  } else {
    const ing = INGREDIENTS[slot.item];
    const frac = Math.min(1, slot.t / ing.cookSecs);
    drawIngredient(ctx, slot.item, pr.x + pr.w / 2, pr.y + 78, 66);
    if (slot.state === 'burnt') {
      ctx.fillStyle = '#ff6b5e';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SOGGY! click to toss', pr.x + pr.w / 2, pr.y + 24);
    } else if (slot.state === 'ready') {
      ctx.fillStyle = '#f7c948';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('READY!', pr.x + pr.w / 2, pr.y + 24);
    } else {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('boiling…', pr.x + pr.w / 2, pr.y + 24);
    }
    ctx.strokeStyle = slot.state === 'burnt' ? '#e0492f' : '#f7c948';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(pr.x + pr.w / 2, pr.y + 78, 46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
    ctx.stroke();
  }
}

// ---- ingredient counter ----
export function drawBins(ctx, G) {
  const b = LAYOUT.bins;
  panel(ctx, b.x, b.y, b.w, b.h, 'INGREDIENTS — click to add to the plate');
  const selected = G.orders.find((o) => o.id === G.selectedOrderId);
  const need = {};
  if (selected) for (const it of DISHES[selected.dish].recipe) need[it] = (need[it] || 0) + 1;
  const have = {};
  if (selected) for (const it of G.plate) have[it] = (have[it] || 0) + 1;
  BIN_ORDER.forEach((id, i) => {
    const r = binRect(i);
    const ing = INGREDIENTS[id];
    const remaining = (need[id] || 0) - (have[id] || 0);
    const needed = selected && remaining > 0;
    const over = selected && (need[id] || 0) > 0 && remaining <= 0;
    ctx.fillStyle = needed ? '#fff3cf' : '#fdf8ee';
    rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
    ctx.strokeStyle = needed ? '#e8a94e' : '#d8c49a';
    ctx.lineWidth = needed ? 3 : 1.5;
    rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.stroke();
    drawIngredient(ctx, id, r.x + r.w / 2, r.y + 36, 52);
    ctx.fillStyle = '#3d2b1f';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ing.short, r.x + r.w / 2, r.y + 70);
    ctx.fillStyle = '#8a7a63';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(ing.cook ? (ing.cook === 'grill' ? 'grill it!' : 'boil it!') : `key ${ing.key}`, r.x + r.w / 2, r.y + 85);
    if (needed) {
      ctx.fillStyle = '#b97d1e';
      ctx.beginPath(); ctx.arc(r.x + r.w - 12, r.y + 12, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText(String(remaining), r.x + r.w - 12, r.y + 16);
    } else if (over) {
      ctx.fillStyle = 'rgba(105,180,85,0.9)';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText('✓', r.x + r.w - 12, r.y + 17);
    }
  });
}

// ---- assembly plate + serve side panel ----
export function drawPlatePanel(ctx, G, now) {
  const p = LAYOUT.plate;
  panel(ctx, p.x, p.y, p.w, p.h, 'YOUR PLATE — click a layer to remove it');
  const cx = p.x + 200;
  const baseY = p.y + p.h - 56;
  G.plateHit = [];
  // Plate.
  ctx.fillStyle = '#fdfdf8';
  ctx.beginPath(); ctx.ellipse(cx, baseY + 6, 150, 26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9b896';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(cx, baseY + 6, 150, 26, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#e8e0cc';
  ctx.beginPath(); ctx.ellipse(cx, baseY + 6, 108, 17, 0, 0, Math.PI * 2); ctx.fill();
  if (G.plate.length === 0) {
    ctx.fillStyle = '#a08a68';
    ctx.font = 'italic 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Empty plate — pick an order, then add ingredients', cx, baseY - 60);
  }
  // Stacked layers, bottom ingredient first.
  let y = baseY;
  G.plate.forEach((id, i) => {
    const s = id === 'bowl' || id === 'shell' ? 96 : 118;
    y -= id === 'patty' || id === 'meat' ? 16 : id === 'bunTop' ? 20 : 13;
    if (i === G.plate.length - 1 && G.plateWobble > 0) {
      const wob = Math.sin(now / 40) * 3 * G.plateWobble;
      ctx.save(); ctx.translate(wob, 0);
      drawIngredient(ctx, id, cx, y, s);
      ctx.restore();
    } else {
      drawIngredient(ctx, id, cx, y, s);
    }
    // Remember where each layer sits so clicks can remove it.
    G.plateHit[i] = { x: cx - 70, y: y - 24, w: 140, h: 40, layer: i };
  });
  // Plate contents list.
  ctx.textAlign = 'left';
  ctx.fillStyle = '#3d2b1f';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText(`On the plate (${G.plate.length})`, p.x + 380, p.y + 34);
  ctx.font = '14px system-ui, sans-serif';
  G.plate.forEach((id, i) => {
    ctx.fillStyle = INGREDIENTS[id].color;
    ctx.beginPath(); ctx.arc(p.x + 392, p.y + 56 + i * 22, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5d4a33';
    ctx.fillText(`${i + 1}. ${INGREDIENTS[id].name}`, p.x + 404, p.y + 61 + i * 22);
  });
  // Message line.
  if (G.message) {
    ctx.fillStyle = G.messageKind === 'bad' ? '#e0492f' : G.messageKind === 'good' ? '#2e7d32' : '#7a4a1f';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(G.message, p.x + p.w / 2, p.y + p.h - 14);
  }
}

export function drawSidePanel(ctx, G, now) {
  const s = LAYOUT.side;
  panel(ctx, s.x, s.y, s.w, s.h, 'SERVE IT');
  const selected = G.orders.find((o) => o.id === G.selectedOrderId);
  if (selected) {
    const dish = DISHES[selected.dish];
    ctx.fillStyle = '#3d2b1f';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Selected: ${dish.name}`, s.x + 20, s.y + 52);
    ctx.fillStyle = '#8a7a63';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(dish.blurb, s.x + 20, s.y + 72);
  } else {
    ctx.fillStyle = '#8a7a63';
    ctx.font = '15px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Click an order ticket to select it.', s.x + 20, s.y + 52);
  }
  // Serve button.
  const sr = serveRect();
  const ready = selected && G.plate.length > 0;
  const glow = ready ? 0.75 + 0.25 * Math.sin(now / 200) : 1;
  ctx.fillStyle = ready ? `rgba(105,180,85,${glow})` : '#b8ab93';
  rr(ctx, sr.x, sr.y, sr.w, sr.h, 14); ctx.fill();
  ctx.strokeStyle = ready ? '#4a8a3a' : '#9a8a6a';
  ctx.lineWidth = 2;
  rr(ctx, sr.x, sr.y, sr.w, sr.h, 14); ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SERVE  ⏎', sr.x + sr.w / 2, sr.y + 40);
  // Trash button.
  const tr = trashRect();
  ctx.fillStyle = '#e0492f';
  rr(ctx, tr.x, tr.y, tr.w, tr.h, 14); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillText('🗑 CLEAR', tr.x + tr.w / 2, tr.y + 40);
  // Shift progress + hints.
  const elapsed = 180 - G.timeLeft;
  ctx.fillStyle = '#e8ddd0';
  rr(ctx, s.x + 20, s.y + 186, s.w - 40, 10, 5); ctx.fill();
  ctx.fillStyle = '#e8a94e';
  rr(ctx, s.x + 20, s.y + 186, (s.w - 40) * Math.min(1, elapsed / 180), 10, 5); ctx.fill();
  ctx.fillStyle = '#8a7a63';
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Shift progress', s.x + 20, s.y + 214);
  ctx.textAlign = 'right';
  ctx.fillText(`next order in ${Math.max(0, Math.ceil(G.nextSpawnIn))}s`, s.x + s.w - 20, s.y + 214);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#7a4a1f';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Keys: 1–0/Q/W/E/R ingredients · Enter serve · Del clear · P pause · M mute', s.x + 20, s.y + 240);
}

// ---- particles & floating score popups ----
export function drawParticles(ctx, G) {
  for (const pt of G.particles) {
    const a = Math.max(0, pt.life / pt.maxLife);
    if (pt.kind === 'steam') {
      ctx.fillStyle = `rgba(255,255,255,${0.5 * a})`;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r * (1.6 - a * 0.6), 0, Math.PI * 2); ctx.fill();
    } else if (pt.kind === 'spark') {
      ctx.fillStyle = `rgba(247,180,60,${a})`;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r * a, 0, Math.PI * 2); ctx.fill();
    } else if (pt.kind === 'confetti') {
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.rot);
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = a;
      ctx.fillRect(-pt.r, -pt.r / 2, pt.r * 2, pt.r);
      ctx.restore();
      ctx.globalAlpha = 1;
    } else if (pt.kind === 'smoke') {
      ctx.fillStyle = `rgba(60,50,45,${0.45 * a})`;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r * (2 - a), 0, Math.PI * 2); ctx.fill();
    }
  }
  for (const pop of G.popups) {
    const a = Math.max(0, pop.life / pop.maxLife);
    ctx.fillStyle = pop.color;
    ctx.globalAlpha = a;
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(pop.text, pop.x, pop.y);
    ctx.globalAlpha = 1;
  }
}
