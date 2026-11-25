# sizzle-and-serve-cooking-game

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/tuyulsembilanenam672-cell/sizzle-and-serve-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/tuyulsembilanenam672-cell/sizzle-and-serve-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Sizzle & Serve** — a fast, juicy cooking game for make.fun's "Make the best cooking game" bounty ($250 in USDC). Run a 3-minute lunch rush: orders fly in on the board, you grill patties, boil pasta, stack each plate exactly to the ticket, and serve before the customer's patience runs out.

## How to play

1. **Pick an order** — click a ticket on the order board. Its recipe dots show what the dish needs; filled dots are already on your plate.
2. **Cook what needs cooking** — click a patty, spiced meat or pasta bin and it goes to the grill or pot. Click it again when the ring turns gold (READY) — leave it too long and it burns.
3. **Build the plate** — click ingredient bins to stack them. Click a layer on the plate to remove just that one; CLEAR empties it.
4. **Serve** — hit SERVE (or Enter) when the plate matches the ticket exactly. Fast serves pay a speed bonus; streaks build a combo multiplier.
5. **Watch the clock** — a ticket that runs out of patience walks out: −100 points and a lost star. Lose all 3 stars and the kitchen closes early.

Four dishes: Classic Burger, Garden Salad, Pasta Alfredo, Crunchy Taco. Keyboard: `1–0/Q/W/E/R` ingredients, `Enter` serve, `Del` clear, `P` pause, `M` mute. All art is drawn in code and all sound is synthesized with WebAudio — no files, no network.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or open `game/index.html` directly from any static file server. The game is plain static files under `game/` with no build step and no network requests.

## Hand in

`main.ts` (Node 22+) copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Screenshots

`?shot=cover|grill|serve|end&seed=1` stages a deterministic scene for screenshots.

---

<sub>Entered on [make.fun](https://make.fun/?ref=sq78y28z&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
