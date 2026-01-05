"use client";

import { useMemo } from "react";
import { GameId } from "@/lib/types";

export function GameVisualizer({ gameId }: { gameId: GameId }) {
  const view = useMemo(() => buildView(gameId), [gameId]);

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-white/50">Visual preview</p>
          <p className="text-sm text-white/80">Quick glance at how this game feels.</p>
        </div>
        <span className="text-xs bg-white/10 px-2 py-1 rounded-full">Virtual coins only</span>
      </div>
      {view}
    </div>
  );
}

function buildView(gameId: GameId) {
  switch (gameId) {
    case "crash":
      return <CrashPreview />;
    case "mines":
      return <MinesPreview />;
    case "plinko":
      return <PlinkoPreview />;
    case "blackjack":
      return <BlackjackPreview />;
    case "roulette":
      return <RoulettePreview />;
  }
}

function CrashPreview() {
  const crashPoint = 3.4;
  const cashOut = 2.6;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-white/60">
        <span>Multiplier timeline</span>
        <span>Crash at {crashPoint.toFixed(2)}x</span>
      </div>
      <div className="h-10 rounded-lg bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 relative overflow-hidden">
        <div
          className="absolute top-0 bottom-0 bg-white/40"
          style={{ left: `${(cashOut / crashPoint) * 100}%`, width: "2px" }}
        />
        <div className="absolute inset-0 flex items-center px-2 text-xs font-semibold">
          <span className="bg-black/40 px-2 py-1 rounded-full">Cash out @ {cashOut.toFixed(2)}x</span>
        </div>
        <div
          className="absolute top-0 bottom-0 bg-red-400/60"
          style={{ left: `${(crashPoint / (crashPoint + 1.5)) * 100}%`, width: "3px" }}
        />
      </div>
      <p className="text-xs text-white/70">Tap before the red crash line. Everyone sees the same multiplier curve each day.</p>
    </div>
  );
}

function MinesPreview() {
  const grid = Array.from({ length: 25 }).map((_, i) => ({
    mine: [3, 5, 8, 19, 22].includes(i),
    revealed: [0, 6, 7, 12].includes(i),
  }));
  return (
    <div className="space-y-2">
      <p className="text-xs text-white/60">5x5 board · K=5 mines · bank before hitting red</p>
      <div className="grid grid-cols-5 gap-1">
        {grid.map((cell, idx) => (
          <div
            key={idx}
            className={`aspect-square rounded-md border border-white/10 flex items-center justify-center text-xs font-semibold ${
              cell.mine ? "bg-red-500/30" : cell.revealed ? "bg-green-500/30" : "bg-white/5"
            }`}
          >
            {cell.mine ? "✕" : cell.revealed ? "+" : ""}
          </div>
        ))}
      </div>
      <p className="text-xs text-white/70">Every daily seed fixes mine positions. Choose when to bank.</p>
    </div>
  );
}

function PlinkoPreview() {
  const rows = 8;
  const slots = 7;
  const path = [3, 3, 4, 4, 3, 4, 4, 5];
  return (
    <div className="space-y-2">
      <p className="text-xs text-white/60">Drop 10 balls · one nudge per ball</p>
      <div className="space-y-1">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex justify-center gap-2">
            {Array.from({ length: slots }).map((_, c) => {
              const active = path[r] === c;
              return (
                <div
                  key={c}
                  className={`h-3 w-3 rounded-full ${active ? "bg-accent" : "bg-white/30"}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-white/60">
        <span>Start</span>
        <span>Landing slot → 2.0x</span>
      </div>
    </div>
  );
}

function BlackjackPreview() {
  const player = ["A♠", "9♥", "K♦"];
  const dealer = ["10♣", "7♦"];
  return (
    <div className="space-y-2">
      <p className="text-xs text-white/60">Shared shoe · 10 hands · hit / stand / double</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <CardRow label="You" cards={player} highlight />
        <CardRow label="Dealer" cards={dealer} />
      </div>
      <p className="text-xs text-white/70">Same shoe for all players each day. Streaks add bonus points.</p>
    </div>
  );
}

function CardRow({ label, cards, highlight }: { label: string; cards: string[]; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border border-white/10 p-3 ${highlight ? "bg-white/5" : "bg-white/0"}`}>
      <div className="text-xs text-white/60 mb-2">{label}</div>
      <div className="flex gap-2">
        {cards.map((card) => (
          <div key={card} className="px-3 py-2 rounded-md bg-card border border-white/10 text-sm font-semibold">
            {card}
          </div>
        ))}
      </div>
    </div>
  );
}

function RoulettePreview() {
  const results = [0, 17, 32, 5];
  return (
    <div className="space-y-2">
      <p className="text-xs text-white/60">Allocate bets · 10 spins · risk efficiency bonus</p>
      <div className="flex items-center gap-2 overflow-hidden rounded-lg border border-white/10 bg-white/5">
        {Array.from({ length: 37 }).map((_, i) => (
          <div
            key={i}
            className={`h-8 flex-1 ${i === 0 ? "bg-green-500/80" : i % 2 === 0 ? "bg-red-500/70" : "bg-white/30"}`}
          />
        ))}
      </div>
      <div className="flex gap-2 text-xs">
        {results.map((n, idx) => (
          <span key={idx} className="px-2 py-1 rounded-full bg-white/10">
            Spin {idx + 1}: {n}
          </span>
        ))}
      </div>
      <p className="text-xs text-white/70">Wheel outcomes are seeded per day; bankroll growth drives score.</p>
    </div>
  );
}
