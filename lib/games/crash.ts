import { rng } from "../seeds";
import { RunAction } from "../types";

export type CrashRunState = {
  crashPoint: number;
  actions: RunAction[];
};

function crashMultiplier(t: number) {
  return 1 + t * 0.6 + Math.pow(t, 2) * 0.08;
}

export function initialCrashState(seed: string): CrashRunState {
  const r = rng(seed + "-crash");
  const crashPoint = 1.5 + -Math.log(1 - r()) * 2.5; // 1.5x+ with long tail
  return { crashPoint, actions: [] };
}

export function simulateCrashRun(seed: string, transcript: RunAction[]) {
  const state = initialCrashState(seed);
  state.actions = transcript;
  const cash = transcript.find((a) => a.type === "cashout");
  const cashAt = cash?.at ?? 0;
  const multiplier = crashMultiplier(cashAt);
  const crashed = multiplier >= state.crashPoint;
  return {
    score: crashed ? 0 : Number(multiplier.toFixed(2)),
    crashPoint: Number(state.crashPoint.toFixed(2)),
    crashed,
  };
}
