import crypto from "crypto";
import { prisma } from "./prisma";
import { currentBrusselsDate } from "./time";
import { GameId } from "./types";

const SECRET = process.env.SERVER_SECRET || "dev-secret";

export function buildSeed(gameId: GameId, date: string, variant = "default") {
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(`${gameId}:${date}:${variant}`);
  return hmac.digest("hex");
}

export function rng(seed: string) {
  let state = crypto.createHash("sha256").update(seed).digest();
  return () => {
    state = crypto.createHash("sha256").update(state).digest();
    return Number("0x" + state.subarray(0, 6).toString("hex")) / 0xffffff;
  };
}

export async function getDailySeed(gameId: GameId, date = currentBrusselsDate()) {
  const seedHash = buildSeed(gameId, date);
  let record = await prisma.dailySeed.findFirst({ where: { game_id: gameId, date } });
  if (!record) {
    record = await prisma.dailySeed.create({
      data: {
        game_id: gameId,
        date,
        seed_hash: crypto.createHash("sha256").update(seedHash).digest("hex"),
        revealed_seed: null,
      },
    });
  }
  return { seed: seedHash, record };
}
