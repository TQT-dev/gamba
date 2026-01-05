import { rng } from "../seeds";
import { RunAction } from "../types";

const SUITS = ["S", "H", "D", "C"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

type Hand = string[];

type Decision = "hit" | "stand" | "double";

export function makeShoe(seed: string) {
  const r = rng(seed + "-shoe");
  const deck: string[] = [];
  const cards = SUITS.flatMap((suit) => VALUES.map((v) => `${v}${suit}`));
  const shoe: string[] = [];
  for (let i = 0; i < 6; i++) {
    const copy = [...cards];
    while (copy.length) {
      const idx = Math.floor(r() * copy.length);
      shoe.push(copy.splice(idx, 1)[0]);
    }
  }
  return shoe;
}

function cardValue(card: string) {
  const v = card.replace(/[SHDC]/, "");
  if (v === "A") return 11;
  if (["K", "Q", "J"].includes(v)) return 10;
  return parseInt(v, 10);
}

function handValue(hand: Hand) {
  let total = hand.reduce((sum, card) => sum + cardValue(card), 0);
  let aces = hand.filter((c) => c.startsWith("A")).length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

function deal(shoe: string[], count: number) {
  return shoe.splice(0, count);
}

export function simulateBlackjack(seed: string, transcript: RunAction[]) {
  const shoe = makeShoe(seed);
  let score = 0;
  let streak = 0;

  for (let handIndex = 0; handIndex < 10; handIndex++) {
    const player: Hand = deal(shoe, 2);
    const dealer: Hand = deal(shoe, 2);
    const actions = (transcript.find(
      (a) => a.type === "hand" && a.payload?.hand === handIndex
    )?.payload?.decisions || []) as Decision[];

    let betMultiplier = 1;
    for (const decision of actions) {
      if (decision === "hit") player.push(...deal(shoe, 1));
      if (decision === "double" && player.length === 2) {
        betMultiplier = 2;
        player.push(...deal(shoe, 1));
        break;
      }
      if (decision === "stand") break;
    }

    while (handValue(dealer) < 17) {
      dealer.push(...deal(shoe, 1));
    }

    const pVal = handValue(player);
    const dVal = handValue(dealer);
    if (pVal > 21) {
      score -= 5 * betMultiplier;
      streak = 0;
    } else if (dVal > 21 || pVal > dVal) {
      score += 10 * betMultiplier;
      if (pVal === 21 && player.length === 2) score += 5; // blackjack bonus
      streak += 1;
      score += streak;
    } else if (pVal === dVal) {
      score += 2; // push bonus
      streak = 0;
    } else {
      score -= 5 * betMultiplier;
      streak = 0;
    }
  }

  return { score };
}
