import { describe, expect, it } from "vitest";
import { simulateCrashRun } from "../lib/games/crash";
import { simulateMines } from "../lib/games/mines";
import { simulatePlinko } from "../lib/games/plinko";
import { simulateBlackjack } from "../lib/games/blackjack";
import { simulateRoulette } from "../lib/games/roulette";

const transcriptSample = {
  crash: [{ type: "cashout", at: 2.5 }],
  mines: [
    { type: "reveal", payload: { index: 0 } },
    { type: "reveal", payload: { index: 1 } },
    { type: "bank" },
  ],
  plinko: [
    { type: "drop", payload: { slot: 3 } },
    { type: "drop", payload: { slot: 4, nudgeRow: 3, nudgeDir: -1 } },
  ],
  blackjack: [{ type: "hand", payload: { hand: 0, decisions: ["hit", "stand"] } }],
  roulette: [{ type: "spin", payload: { spin: 0, bets: [{ type: "red", amount: 5 }] } }],
};

describe("deterministic simulations", () => {
  it("crash uses deterministic crash point", () => {
    const seed = "seed-crash";
    const a = simulateCrashRun(seed, transcriptSample.crash);
    const b = simulateCrashRun(seed, transcriptSample.crash);
    expect(a.score).toBe(b.score);
  });

  it("mines uses deterministic grid", () => {
    const seed = "seed-mines";
    const a = simulateMines(seed, transcriptSample.mines);
    const b = simulateMines(seed, transcriptSample.mines);
    expect(a.score).toBe(b.score);
    expect(a.mines).toEqual(b.mines);
  });

  it("plinko repeatable", () => {
    const seed = "seed-plinko";
    const a = simulatePlinko(seed, transcriptSample.plinko);
    const b = simulatePlinko(seed, transcriptSample.plinko);
    expect(a.score).toBeCloseTo(b.score, 4);
  });

  it("blackjack shoe is deterministic", () => {
    const seed = "seed-blackjack";
    const a = simulateBlackjack(seed, transcriptSample.blackjack);
    const b = simulateBlackjack(seed, transcriptSample.blackjack);
    expect(a.score).toEqual(b.score);
  });

  it("roulette results repeat", () => {
    const seed = "seed-roulette";
    const a = simulateRoulette(seed, transcriptSample.roulette);
    const b = simulateRoulette(seed, transcriptSample.roulette);
    expect(a.score).toEqual(b.score);
    expect(a.results[0]).toEqual(b.results[0]);
  });
});
