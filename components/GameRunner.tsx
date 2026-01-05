"use client";

import { useState, useMemo } from "react";
import { GameId } from "@/lib/types";

async function startRun(gameId: GameId) {
  const res = await fetch("/api/run/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId }),
  });
  if (!res.ok) throw new Error("Failed to start run");
  const data = await res.json();
  return data.runId as string;
}

async function finishRun(runId: string, transcript: any[]) {
  const res = await fetch("/api/run/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ runId, transcript }),
  });
  if (!res.ok) throw new Error("Failed to finish run");
  return res.json();
}

const GAME_DESCRIPTIONS: Record<GameId, string> = {
  crash: "Tap cash out multiplier before crash.",
  mines: "Reveal safe tiles and bank before hitting a mine.",
  plinko: "Drop 10 balls, each with one optional nudge.",
  blackjack: "10 hands vs dealer from shared shoe.",
  roulette: "Allocate bets over 10 spins.",
};

export function GameRunner({ gameId }: { gameId: GameId }) {
  const [status, setStatus] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const defaultTranscript = useMemo(() => buildDefaultTranscript(gameId), [gameId]);

  async function play() {
    setLoading(true);
    setStatus("Starting run...");
    try {
      const runId = await startRun(gameId);
      setStatus("Finishing run...");
      const finished = await finishRun(runId, defaultTranscript);
      setResult(finished);
      setStatus("Run complete");
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-white/50">Tutorial</p>
          <p className="text-sm text-white/80">{GAME_DESCRIPTIONS[gameId]}</p>
        </div>
        <button onClick={play} disabled={loading} className="btn-primary">
          {loading ? "Running..." : "Quick play"}
        </button>
      </div>
      <div className="bg-white/5 rounded-lg p-3 text-sm">
        <p className="text-white/70">Transcript preview</p>
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(defaultTranscript, null, 2)}</pre>
      </div>
      {result && (
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-sm">Score: {result.score} | Coins: {result.coins}</p>
        </div>
      )}
      {status && <p className="text-xs text-white/60">{status}</p>}
    </div>
  );
}

function buildDefaultTranscript(gameId: GameId) {
  switch (gameId) {
    case "crash":
      return [{ type: "cashout", at: 3.2 }];
    case "mines":
      return [
        { type: "reveal", payload: { index: 0 }, at: 0 },
        { type: "reveal", payload: { index: 6 }, at: 5 },
        { type: "bank", at: 8 },
      ];
    case "plinko":
      return Array.from({ length: 10 }).map((_, i) => ({
        type: "drop",
        payload: { slot: (i % 3) + 2, nudgeRow: 4, nudgeDir: i % 2 === 0 ? 1 : -1 },
        at: i,
      }));
    case "blackjack":
      return Array.from({ length: 10 }).map((_, i) => ({
        type: "hand",
        payload: { hand: i, decisions: i % 2 === 0 ? ["hit", "stand"] : ["stand"] },
        at: i,
      }));
    case "roulette":
      return Array.from({ length: 10 }).map((_, i) => ({
        type: "spin",
        payload: { spin: i, bets: [{ type: "red", amount: 5 }, { type: "even", amount: 3 }] },
        at: i,
      }));
  }
}
