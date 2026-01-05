import { GameId, RunAction } from "../types";
import { simulateCrashRun } from "./crash";
import { simulateMines } from "./mines";
import { simulatePlinko } from "./plinko";
import { simulateBlackjack } from "./blackjack";
import { simulateRoulette } from "./roulette";

export function simulateGame(gameId: GameId, seed: string, transcript: RunAction[]) {
  switch (gameId) {
    case "crash":
      return simulateCrashRun(seed, transcript);
    case "mines":
      return simulateMines(seed, transcript);
    case "plinko":
      return simulatePlinko(seed, transcript);
    case "blackjack":
      return simulateBlackjack(seed, transcript);
    case "roulette":
      return simulateRoulette(seed, transcript);
    default:
      throw new Error("Unknown game");
  }
}
