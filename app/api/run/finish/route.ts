import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDailySeed } from "@/lib/seeds";
import { simulateGame } from "@/lib/games";
import { GAME_RULES, GameId } from "@/lib/types";
import { currentBrusselsDate } from "@/lib/time";
import { updateLeaderboardAggregate } from "@/lib/leaderboard";

async function coinsForScore(userId: string, gameId: GameId, score: number, date: string) {
  const rule = GAME_RULES[gameId];
  const todayCoins = await prisma.run.aggregate({
    where: { user_id: userId, game_id: gameId, date, verified: true },
    _sum: { coins_awarded: true },
  });
  const remaining = Math.max(0, rule.maxCoinsPerDay - (todayCoins._sum.coins_awarded ?? 0));
  const computed = Math.min(remaining, Math.max(0, Math.floor(score * 2)));
  return computed;
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const { runId, transcript: providedTranscript } = await req.json();
    const run = await prisma.run.findUnique({ where: { id: runId } });
    if (!run || run.user_id !== session.user_id) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }
    const date = run.date || currentBrusselsDate();
    const { seed } = await getDailySeed(run.game_id as GameId, date);
    const transcript =
      (Array.isArray(providedTranscript) && providedTranscript) ||
      (Array.isArray(run.transcript_json) ? run.transcript_json : []);
    const result = simulateGame(run.game_id as GameId, seed, transcript);
    const coins = await coinsForScore(session.user_id, run.game_id as GameId, result.score, date);

    await prisma.$transaction([
      prisma.run.update({
        where: { id: runId },
        data: {
          score: Math.round(result.score),
          coins_awarded: coins,
          verified: true,
          transcript_json: transcript,
        },
      }),
      prisma.wallet.update({
        where: { user_id: session.user_id },
        data: { coins: { increment: coins } },
      }),
    ]);

    await updateLeaderboardAggregate(session.user_id, run.game_id as GameId, date);

    return NextResponse.json({ score: result.score, coins, verified: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed" }, { status: 400 });
  }
}
