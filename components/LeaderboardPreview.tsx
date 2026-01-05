import Link from "next/link";
import { LeaderboardEntry } from "@/lib/types";

type Props = {
  title: string;
  entries: LeaderboardEntry[];
  gameId?: string;
};

export function LeaderboardPreview({ title, entries, gameId }: Props) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">{title}</h3>
        <Link className="text-sm text-white/70 hover:text-white" href={`/leaderboards${gameId ? `?gameId=${gameId}` : ""}`}>
          View all
        </Link>
      </div>
      <div className="space-y-2">
        {entries.length === 0 && <p className="text-white/60 text-sm">No scores yet.</p>}
        {entries.map((entry, idx) => (
          <div key={`${entry.userId}-${idx}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-sm w-5">{idx + 1}</span>
              <span className="font-medium">{entry.nickname}</span>
            </div>
            <span className="text-accent font-semibold">{entry.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
