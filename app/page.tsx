import { Header } from "@/components/Header";
import { GameCard } from "@/components/GameCard";
import { LeaderboardPreview } from "@/components/LeaderboardPreview";
import { AuthPanel } from "@/components/AuthPanel";
import { GAMES } from "@/lib/types";
import { getSession } from "@/lib/auth";
import { getLeaderboard } from "@/lib/leaderboard";

export default async function Home() {
  const session = await getSession();
  const topDaily = await getLeaderboard("crash", "daily");
  const topAllTime = await getLeaderboard("crash", "alltime");

  return (
    <main className="space-y-6">
      <Header />
      <div className="card grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-white/60 text-sm">Coins</p>
          <p className="text-3xl font-bold">{session?.wallet?.coins ?? 0}</p>
        </div>
        <div>
          <p className="text-white/60 text-sm">Logged in as</p>
          <p className="text-xl font-semibold">{session?.user.nickname ?? "Guest"}</p>
        </div>
        <div>
          <p className="text-white/60 text-sm">Safety</p>
          <p className="text-sm">For entertainment with virtual coins only.</p>
        </div>
      </div>

      <AuthPanel />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GAMES.map((game) => (
          <GameCard
            key={game.id}
            id={game.id}
            title={game.title}
            description={game.description}
            tickets={{
              crash: 10,
              mines: 5,
              plinko: 3,
              blackjack: 3,
              roulette: 3,
            }[game.id]}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LeaderboardPreview title="Crash – Daily Top" entries={topDaily.top} gameId="crash" />
        <LeaderboardPreview title="Crash – All-time" entries={topAllTime.top} gameId="crash" />
      </section>
    </main>
  );
}
