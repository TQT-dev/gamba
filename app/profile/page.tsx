import { Header } from "@/components/Header";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GAMES } from "@/lib/types";

async function getStats(userId: string) {
  const runs = await prisma.run.groupBy({
    by: ["game_id"],
    _max: { score: true },
    _sum: { coins_awarded: true },
    where: { user_id: userId, verified: true },
  });
  return runs;
}

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    return (
      <main className="space-y-4">
        <Header />
        <div className="card">Please log in to view your profile.</div>
      </main>
    );
  }
  const stats = await getStats(session.user_id);

  return (
    <main className="space-y-4">
      <Header />
      <div className="card space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Nickname</p>
            <p className="text-xl font-semibold">{(session as any).user.nickname}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/60">Coins</p>
            <p className="text-xl font-semibold">{(session as any).user.wallet?.coins ?? 0}</p>
          </div>
        </div>
        <p className="text-sm text-white/60">Stats summary</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {GAMES.map((game) => {
            const row = stats.find((s) => s.game_id === game.id);
            return (
              <div key={game.id} className="bg-white/5 rounded-lg p-3">
                <p className="font-semibold">{game.title}</p>
                <p className="text-sm text-white/60">Best run: {row?._max.score ?? 0}</p>
                <p className="text-sm text-white/60">Coins earned: {row?._sum.coins_awarded ?? 0}</p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
