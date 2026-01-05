import { NextResponse } from "next/server";
import { getDailySeed } from "@/lib/seeds";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GameId } from "@/lib/types";
import { currentBrusselsDate } from "@/lib/time";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const { gameId } = await req.json();
    const date = currentBrusselsDate();
    const { seed, record } = await getDailySeed(gameId as GameId, date);
    const run = await prisma.run.create({
      data: {
        user: { connect: { id: session.user_id } },
        game_id: gameId,
        date,
        transcript_json: [],
        score: 0,
        coins_awarded: 0,
        verified: false,
      },
    });
    return NextResponse.json({ runId: run.id, seedHash: record.seed_hash });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed" }, { status: 400 });
  }
}
