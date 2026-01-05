import { Header } from "@/components/Header";
import { GameRunner } from "@/components/GameRunner";
import { GAMES, GameId } from "@/lib/types";

function toGameId(value: string): GameId {
  if (["crash", "mines", "plinko", "blackjack", "roulette"].includes(value)) return value as GameId;
  return "crash";
}

export default function GamePage({ params }: { params: { gameId: string } }) {
  const gameId = toGameId(params.gameId);
  const game = GAMES.find((g) => g.id === gameId);
  return (
    <main className="space-y-4">
      <Header />
      <div className="space-y-2">
        <p className="text-xs uppercase text-white/50">Daily seed. Best runs only.</p>
        <h2 className="text-3xl font-bold">{game?.title ?? "Game"}</h2>
        <p className="text-white/70 text-sm">{game?.description}</p>
      </div>
      <GameRunner gameId={gameId} />
      <div className="text-xs text-white/60">
        Server authoritative scoring. Every run uses today&apos;s deterministic seed for fairness. Virtual coins only.
      </div>
    </main>
  );
}
