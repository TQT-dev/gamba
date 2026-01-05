import Link from "next/link";
import { ArrowRight } from "lucide-react";

type GameCardProps = {
  id: string;
  title: string;
  description: string;
  tickets: number;
};

export function GameCard({ id, title, description, tickets }: GameCardProps) {
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-white/50">Tickets today</p>
          <p className="text-lg font-semibold">{tickets}</p>
        </div>
        <span className="text-xs bg-white/10 px-2 py-1 rounded-full">Daily Seeded</span>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-white/70 text-sm">{description}</p>
      </div>
      <div className="flex gap-2 items-center justify-between">
        <Link className="btn-primary inline-flex items-center gap-2" href={`/games/${id}`}>
          Play
          <ArrowRight size={16} />
        </Link>
        <Link className="text-sm text-white/70 hover:text-white" href={`/leaderboards?gameId=${id}`}>
          Leaderboard
        </Link>
      </div>
    </div>
  );
}
