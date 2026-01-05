import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/leaderboard";
import { GameId, LeaderboardScope } from "@/lib/types";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const gameId = (searchParams.get("gameId") ?? "crash") as GameId;
  const scope = (searchParams.get("scope") ?? "daily") as LeaderboardScope;
  const friendsOnly = searchParams.get("friendsOnly") === "true";
  const session = await getSession();
  const leaderboard = await getLeaderboard(gameId, scope, session?.user_id, friendsOnly);
  return NextResponse.json({ gameId, scope, ...leaderboard });
}
