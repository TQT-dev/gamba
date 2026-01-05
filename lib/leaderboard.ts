import { prisma } from "./prisma";
import { GameId, GAME_RULES, LeaderboardEntry, LeaderboardScope } from "./types";
import { currentBrusselsDate } from "./time";

function bestOfScores(scores: number[], bestOf: number) {
  return scores
    .sort((a, b) => b - a)
    .slice(0, bestOf)
    .reduce((sum, v) => sum + v, 0);
}

export async function computeDailyScore(userId: string, gameId: GameId, date = currentBrusselsDate()) {
  const runs = await prisma.run.findMany({
    where: { user_id: userId, game_id: gameId, date, verified: true },
    orderBy: { score: "desc" },
  });
  const scores = runs.map((r) => r.score);
  const rule = GAME_RULES[gameId];
  return bestOfScores(scores, rule.bestOf);
}

export async function updateLeaderboardAggregate(userId: string, gameId: GameId, date = currentBrusselsDate()) {
  const dailyScore = await computeDailyScore(userId, gameId, date);
  await prisma.leaderboardAggregate.upsert({
    where: { game_id_date_user_id: { game_id: gameId, date, user_id: userId } },
    update: { daily_score: dailyScore, updated_at: new Date() },
    create: { game_id: gameId, date, user_id: userId, daily_score: dailyScore },
  });
}

export async function getLeaderboard(
  gameId: GameId,
  scope: LeaderboardScope,
  userId?: string,
  friendsOnly?: boolean
): Promise<{ top: LeaderboardEntry[]; myRank?: number; myScore?: number }> {
  const date = currentBrusselsDate();
  const friendUserIds =
    friendsOnly && userId
      ? (await prisma.friendship.findMany({ where: { user_id: userId } })).map((f) => f.friend_user_id)
      : undefined;

  if (scope === "daily") {
    const aggregates = await prisma.leaderboardAggregate.findMany({
      where: {
        game_id: gameId,
        date,
        ...(friendUserIds ? { user_id: { in: friendUserIds.concat(userId ?? "") } } : {}),
      },
      include: { user: true },
      orderBy: { daily_score: "desc" },
      take: 20,
    });

    const top: LeaderboardEntry[] = aggregates.map((a) => ({
      userId: a.user_id,
      nickname: a.user.nickname,
      score: a.daily_score,
    }));

    let myRank: number | undefined;
    let myScore: number | undefined;
    if (userId) {
      const myRecords = await prisma.leaderboardAggregate.findMany({
        where: {
          game_id: gameId,
          date,
          ...(friendUserIds ? { user_id: { in: friendUserIds.concat(userId) } } : { user_id: userId }),
        },
        orderBy: { daily_score: "desc" },
      });
      myScore = myRecords.find((r) => r.user_id === userId)?.daily_score;
      if (myScore !== undefined) myRank = myRecords.findIndex((r) => r.user_id === userId) + 1;
    }
    return { top, myRank, myScore };
  }

  // All-time aggregates: sum of daily scores across dates
  const grouped = await prisma.leaderboardAggregate.groupBy({
    by: ["user_id"],
    where: {
      game_id: gameId,
      ...(friendUserIds ? { user_id: { in: friendUserIds.concat(userId ?? "") } } : {}),
    },
    _sum: { daily_score: true },
  });

  const userMap = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.user_id) } },
  });
  const top = grouped
    .map((g) => ({
      userId: g.user_id,
      nickname: userMap.find((u) => u.id === g.user_id)?.nickname ?? "player",
      score: g._sum.daily_score ?? 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  let myRank: number | undefined;
  let myScore: number | undefined;
  if (userId) {
    const entry = top.find((e) => e.userId === userId);
    myScore = entry?.score;
    if (entry) myRank = top.findIndex((e) => e.userId === userId) + 1;
  }

  return { top, myRank, myScore };
}
