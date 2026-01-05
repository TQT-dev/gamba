import { rng } from "../seeds";
import { RunAction } from "../types";

type Bet = { type: "red" | "black" | "even" | "odd" | "dozen" | "straight"; value?: number; amount: number };

const REDS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

function spin(seed: string, index: number) {
  const r = rng(seed + "-roulette" + index);
  return Math.floor(r() * 37); // 0-36
}

function payout(bet: Bet, result: number) {
  switch (bet.type) {
    case "red":
      return REDS.has(result) ? bet.amount : -bet.amount;
    case "black":
      return result !== 0 && !REDS.has(result) ? bet.amount : -bet.amount;
    case "even":
      return result !== 0 && result % 2 === 0 ? bet.amount : -bet.amount;
    case "odd":
      return result % 2 === 1 ? bet.amount : -bet.amount;
    case "dozen": {
      const dozen = bet.value ?? 1;
      const start = (dozen - 1) * 12 + 1;
      const hit = result >= start && result < start + 12;
      return hit ? bet.amount * 2 : -bet.amount;
    }
    case "straight":
      return bet.value === result ? bet.amount * 35 : -bet.amount;
  }
}

export function simulateRoulette(seed: string, transcript: RunAction[]) {
  let bankroll = 100;
  const results: number[] = [];
  const spins: { spin: number; result: number; bets: Bet[] }[] = [];
  for (let i = 0; i < 10; i++) {
    const action = transcript.find((a) => a.type === "spin" && a.payload?.spin === i);
    const bets = (action?.payload?.bets as Bet[]) || [];
    const result = spin(seed, i);
    results.push(result);
    spins.push({ spin: i, result, bets });
    for (const bet of bets) {
      bankroll += payout(bet, result);
    }
  }
  const variancePenalty = Math.max(0, (bankroll - 100) * 0.1);
  const score = Math.round(bankroll - variancePenalty);
  return { score, results, details: { spins } };
}
