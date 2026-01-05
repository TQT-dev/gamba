import { rng } from "../seeds";
import { RunAction } from "../types";

const PEG_ROWS = 10;
const SLOTS = 7;
const SLOT_MULTIPLIERS = [0.2, 0.5, 1, 2, 1, 0.5, 0.2];

export type PlinkoAction = RunAction & { payload: { slot: number; nudgeRow?: number; nudgeDir?: -1 | 1 } };

export function simulatePlinko(seed: string, transcript: RunAction[]) {
  const r = rng(seed + "-plinko");
  let score = 0;
  let ballIndex = 0;
  const landings: number[] = [];
  for (const action of transcript as PlinkoAction[]) {
    if (action.type !== "drop") continue;
    let position = Math.min(Math.max(action.payload.slot, 0), SLOTS - 1);
    for (let row = 0; row < PEG_ROWS; row++) {
      const bias = position / (SLOTS - 1) - 0.5; // -0.5..0.5
      const dirRand = r() + bias * 0.3;
      let dir = dirRand > 0.5 ? 1 : -1;
      if (action.payload.nudgeRow === row) {
        dir = action.payload.nudgeDir ?? dir;
      }
      position = Math.min(Math.max(position + dir, 0), SLOTS - 1);
    }
    const landed = SLOT_MULTIPLIERS[position];
    score += landed;
    landings.push(position);
    ballIndex += 1;
    if (ballIndex >= 10) break;
  }
  return { score: Number(score.toFixed(2)), details: { landings } };
}
