import { rng } from "../seeds";
import { RunAction } from "../types";

const GRID_SIZE = 25;
const MINE_COUNT = 5;

export type MinesState = {
  mines: Set<number>;
  banked: number;
};

function generateMines(seed: string) {
  const r = rng(seed + "-mines");
  const mines = new Set<number>();
  while (mines.size < MINE_COUNT) {
    mines.add(Math.floor(r() * GRID_SIZE));
  }
  return mines;
}

export function simulateMines(seed: string, transcript: RunAction[]) {
  const mines = generateMines(seed);
  let safeCount = 0;
  let banked = 0;
  let busted = false;
  const reveals: number[] = [];

  for (const action of transcript) {
    if (action.type === "reveal") {
      const idx = action.payload?.index ?? 0;
      if (mines.has(idx)) {
        busted = true;
        break;
      }
      safeCount += 1;
      reveals.push(idx);
    }
    if (action.type === "bank") {
      const multiplier = 1 + safeCount * 0.25;
      banked = Math.max(banked, Math.round(10 * multiplier));
    }
  }

  if (busted) {
    return { score: banked, busted: true, mines, details: { reveals, banked } };
  }

  const multiplier = 1 + safeCount * 0.25;
  banked = banked || Math.round(10 * multiplier);
  return { score: banked, busted: false, mines, details: { reveals, banked } };
}
