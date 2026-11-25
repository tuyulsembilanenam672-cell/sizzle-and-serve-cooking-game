// Sizzle & Serve — the hand-in program for the make.fun cooking bounty.
//
// It copies the static game and the maker's screenshots into the output
// directory and writes the dossier the gate reads, using the kit's own
// vendored library (vendor/makefun-game.ts, unchanged from the kit).
//
// The grader runs it twice in a sandbox with no network; the output is
// deterministic because the copy is a plain file copy and the dossier is
// built from the files exactly as they stand. Outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { chmodSync, cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Everything the grader reads must be world-readable, whatever the
// sandbox umask is: files 0644, directories 0755.
function fixModes(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      chmodSync(p, 0o755);
      fixModes(p);
    } else {
      chmodSync(p, 0o644);
    }
  }
}

// Start from a clean output directory so a stale file can never leak in.
mkdirSync(out, { recursive: true });

cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}
fixModes(out);

// The scorer's own caps, mirrored here so a bad entry is refused early:
// at most 4 screenshots, each at most 256 KiB; game/ at most 993 files
// and 48 MiB in all, with no path under it over 1000 bytes. game/,
// screenshots/ and dossier.json share /output's own 1000-entry cap.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
chmodSync(join(out, 'dossier.json'), 0o644);
chmodSync(out, 0o755);

console.log(`Sizzle & Serve handed in to ${out}`);
