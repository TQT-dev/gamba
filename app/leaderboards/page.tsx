import { Header } from "@/components/Header";
import { GAMES, GameId } from "@/lib/types";
import { getLeaderboard } from "@/lib/leaderboard";
import { getSession } from "@/lib/auth";

function gameFromSearch(searchParams: Record<string, string | string[] | undefined>): GameId {
  const g = searchParams.gameId;
  if (typeof g === "string" && ["crash", "mines", "plinko", "blackjack", "roulette"].includes(g)) {
    return g as GameId;
  }
  return "crash";
}

export default async function LeaderboardsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const session = await getSession();
  const gameId = gameFromSearch(searchParams);
  const daily = await getLeaderboard(gameId, "daily", session?.user_id);
  const allTime = await getLeaderboard(gameId, "alltime", session?.user_id);
  const gameTitle = GAMES.find((g) => g.id === gameId)?.title ?? "Game";

  return (
    <main className="space-y-4">
      <Header />
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-white/50">Leaderboards</p>
            <h2 className="text-2xl font-bold">{gameTitle}</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{ title: "Daily (UTC+1)", data: daily }, { title: "All-time", data: allTime }].map((board) => (
            <div key={board.title} className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{board.title}</h3>
                {board.data.myRank && (
                  <span className="text-xs text-white/70">My rank: {board.data.myRank}</span>
                )}
              </div>
              <div className="space-y-2">
                {board.data.top.map((entry, idx) => (
                  <div key={entry.userId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-sm w-5">{idx + 1}</span>
                      <span className="font-semibold">{entry.nickname}</span>
                    </div>
                    <span className="text-accent font-semibold">{entry.score}</span>
                  </div>
                ))}
                {board.data.top.length === 0 && <p className="text-white/60 text-sm">No scores yet.</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
