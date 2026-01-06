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
  const cashAt = cash?.at ?? state.crashPoint + 1; // if no cash, treat as after crash
  const multiplier = crashMultiplier(cashAt);
  const cashOutMultiplier = Number(multiplier.toFixed(2));
  const crashPoint = Number(state.crashPoint.toFixed(2));
  const crashed = multiplier >= state.crashPoint;
  // TODO(Codex 5.2): The user is confused because results show time (s) but crash is in multiplier (x).
  // Please calculate the user's cash-out multiplier here:
  // const cashOutMultiplier = crashMultiplier(cashAt);
  // And return it in the 'details' object below so the frontend can display it.
  return {
    score: crashed ? 0 : cashOutMultiplier,
    crashPoint,
    crashed,
    details: { crashPoint, cashAt: Number(cashAt.toFixed(2)), cashOutMultiplier },
  };
}
