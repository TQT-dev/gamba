"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GameId, RunAction } from "@/lib/types";

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

async function finishRun(runId: string, transcript: RunAction[]) {
  const res = await fetch("/api/run/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ runId, transcript }),
  });
  if (!res.ok) throw new Error("Failed to finish run");
  return res.json();
}

const GAME_DESCRIPTIONS: Record<GameId, string> = {
  crash: "Tap to cash out before the seeded crash.",
  mines: "Reveal tiles and bank before you hit a mine.",
  plinko: "Choose a slot and optional nudge each ball.",
  blackjack: "Shared shoe; choose actions per hand.",
  roulette: "Allocate bets per spin; same results for all.",
};

export function GameRunner({ gameId }: { gameId: GameId }) {
  const [status, setStatus] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<RunAction[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    setStatus("Starting run...");
    setResult(null);
    setTranscript([]);
    try {
      const newRunId = await startRun(gameId);
      setRunId(newRunId);
      setStatus("Run active. Build your moves then finish.");
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFinish() {
    if (!runId) return;
    setLoading(true);
    setStatus("Finishing run...");
    try {
      const finished = await finishRun(runId, transcript);
      setResult(finished);
      setStatus("Run complete");
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setLoading(false);
      setRunId(null);
    }
  }

  function pushAction(action: RunAction) {
    setTranscript((prev) => [...prev, action]);
  }

  const controls = useMemo(() => {
    switch (gameId) {
      case "crash":
        return <CrashControls active={!!runId} onAction={pushAction} />;
      case "mines":
        return <MinesControls active={!!runId} onAction={pushAction} />;
      case "plinko":
        return <PlinkoControls active={!!runId} onAction={pushAction} />;
      case "blackjack":
        return <BlackjackControls active={!!runId} onAction={pushAction} />;
      case "roulette":
        return <RouletteControls active={!!runId} onAction={pushAction} />;
    }
  }, [gameId, runId]);

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase text-white/50">Gameplay</p>
          <p className="text-sm text-white/80">{GAME_DESCRIPTIONS[gameId]}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleStart} disabled={loading} className="btn-secondary">
            {runId ? "Restart" : "Start run"}
          </button>
          <button onClick={handleFinish} disabled={loading || !runId} className="btn-primary">
            Finish & submit
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <LivePreview gameId={gameId} transcript={transcript} />
        {controls}
      </div>

      <div className="bg-white/5 rounded-lg p-3 text-sm space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-white/70">Transcript (server will verify using daily seed)</p>
          <span className="text-xs bg-white/10 rounded-full px-2 py-1">{transcript.length} actions</span>
        </div>
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(transcript, null, 2)}</pre>
      </div>

      {result && (
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-sm">
            Score: {result.score} | Coins: {result.coins}
          </p>
        </div>
      )}
      {status && <p className="text-xs text-white/60">{status}</p>}
    </div>
  );
}

function LivePreview({ gameId, transcript }: { gameId: GameId; transcript: RunAction[] }) {
  switch (gameId) {
    case "crash":
      return <CrashLive transcript={transcript} />;
    case "mines":
      return <MinesLive transcript={transcript} />;
    case "plinko":
      return <PlinkoLive transcript={transcript} />;
    case "blackjack":
      return <BlackjackLive transcript={transcript} />;
    case "roulette":
      return <RouletteLive transcript={transcript} />;
  }
}

function CrashControls({ active, onAction }: { active: boolean; onAction: (a: RunAction) => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [cashed, setCashed] = useState(false);
  const timer = useRef<NodeJS.Timer | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (active) {
      startTime.current = Date.now();
      timer.current = setInterval(() => {
        if (!startTime.current) return;
        setElapsed((Date.now() - startTime.current) / 1000);
      }, 100);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
      startTime.current = null;
    };
  }, [active]);

  const multiplier = 1 + elapsed * 0.6 + Math.pow(elapsed, 2) * 0.08;

  function cashOut() {
    if (!active || cashed) return;
    const at = Number(elapsed.toFixed(2));
    onAction({ type: "cashout", at });
    setCashed(true);
  }

  return (
    <div className="bg-white/5 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between text-xs text-white/70">
        <span>Live multiplier (client-side preview)</span>
        <span>{multiplier.toFixed(2)}x</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-green-400 via-yellow-300 to-red-500" style={{ width: `${Math.min(100, multiplier * 10)}%` }} />
      </div>
      <button onClick={cashOut} disabled={!active || cashed} className="btn-primary w-full">
        {cashed ? "Cash-out locked" : "Cash out now"}
      </button>
      <p className="text-xs text-white/60">
        Your action records the time you press cash-out. Server simulates with the shared daily seed; if it crashes before your timestamp, the score is 0.
      </p>
    </div>
  );
}

function MinesControls({ active, onAction }: { active: boolean; onAction: (a: RunAction) => void }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const cells = Array.from({ length: 25 });

  function reveal(idx: number) {
    if (!active || revealed.has(idx)) return;
    const next = new Set(revealed);
    next.add(idx);
    setRevealed(next);
    onAction({ type: "reveal", payload: { index: idx }, at: Date.now() });
  }

  function bank() {
    if (!active) return;
    onAction({ type: "bank", at: Date.now() });
  }

  return (
    <div className="bg-white/5 rounded-lg p-3 space-y-2">
      <p className="text-xs text-white/60">Tap tiles to reveal; hit bank anytime to lock points.</p>
      <div className="grid grid-cols-5 gap-1">
        {cells.map((_, idx) => (
          <button
            key={idx}
            onClick={() => reveal(idx)}
            className={`aspect-square rounded-md border border-white/10 text-sm font-semibold ${
              revealed.has(idx) ? "bg-green-500/30" : "bg-white/5 hover:bg-white/10"
            }`}
            disabled={!active}
          >
            {revealed.has(idx) ? "+" : ""}
          </button>
        ))}
      </div>
      <button onClick={bank} disabled={!active} className="btn-secondary w-full">
        Bank now
      </button>
    </div>
  );
}

function PlinkoControls({ active, onAction }: { active: boolean; onAction: (a: RunAction) => void }) {
  const [slot, setSlot] = useState(3);
  const [nudgeRow, setNudgeRow] = useState<number | undefined>(4);
  const [nudgeDir, setNudgeDir] = useState<-1 | 1>(1);
  const [ball, setBall] = useState(0);

  function addDrop() {
    if (!active || ball >= 10) return;
    onAction({
      type: "drop",
      payload: { slot, nudgeRow, nudgeDir },
      at: ball,
    });
    setBall((b) => b + 1);
  }

  return (
    <div className="bg-white/5 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <label className="flex flex-col text-xs text-white/60">
          Slot (0-6)
          <input type="number" min={0} max={6} value={slot} onChange={(e) => setSlot(Number(e.target.value))} />
        </label>
        <label className="flex flex-col text-xs text-white/60">
          Nudge row (0-9)
          <input
            type="number"
            min={0}
            max={9}
            value={nudgeRow ?? ""}
            onChange={(e) => setNudgeRow(e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </label>
        <label className="flex flex-col text-xs text-white/60">
          Nudge dir
          <select value={nudgeDir} onChange={(e) => setNudgeDir(Number(e.target.value) as -1 | 1)}>
            <option value={1}>Right</option>
            <option value={-1}>Left</option>
          </select>
        </label>
      </div>
      <button onClick={addDrop} disabled={!active || ball >= 10} className="btn-primary w-full">
        Drop ball {ball + 1} / 10
      </button>
      <p className="text-xs text-white/60">Each drop records your chosen slot and optional nudge. Ten balls max per run.</p>
    </div>
  );
}

function BlackjackControls({ active, onAction }: { active: boolean; onAction: (a: RunAction) => void }) {
  const [hand, setHand] = useState(0);
  const [decisions, setDecisions] = useState("hit,stand");

  function addHand() {
    if (!active || hand > 9) return;
    const parsed = decisions
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
    onAction({ type: "hand", payload: { hand, decisions: parsed }, at: hand });
    setHand((h) => h + 1);
  }

  return (
    <div className="bg-white/5 rounded-lg p-3 space-y-2">
      <p className="text-xs text-white/60">Enter actions for a hand (comma separated, e.g., hit,stand or double).</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <label className="flex flex-col text-xs text-white/60 flex-1">
          Hand index (0-9)
          <input type="number" min={0} max={9} value={hand} onChange={(e) => setHand(Number(e.target.value))} />
        </label>
        <label className="flex flex-col text-xs text-white/60 flex-1">
          Decisions
          <input value={decisions} onChange={(e) => setDecisions(e.target.value)} placeholder="hit,stand" />
        </label>
      </div>
      <button onClick={addHand} disabled={!active || hand > 9} className="btn-secondary w-full">
        Add hand actions
      </button>
    </div>
  );
}

type BetType = "red" | "black" | "even" | "odd" | "dozen" | "straight";

function RouletteControls({ active, onAction }: { active: boolean; onAction: (a: RunAction) => void }) {
  const [spin, setSpin] = useState(0);
  const [betType, setBetType] = useState<BetType>("red");
  const [value, setValue] = useState<number | undefined>(undefined);
  const [amount, setAmount] = useState(5);
  const [betsBySpin, setBetsBySpin] = useState<Record<number, any[]>>({});

  function addBet() {
    if (!active || spin > 9) return;
    const bet = { type: betType, value: value ?? undefined, amount };
    setBetsBySpin((prev) => {
      const next = { ...prev };
      const arr = next[spin] ? [...next[spin]] : [];
      arr.push(bet);
      next[spin] = arr;
      return next;
    });
  }

  function commitSpin() {
    if (!active || spin > 9) return;
    const bets = betsBySpin[spin] || [];
    onAction({ type: "spin", payload: { spin, bets }, at: spin });
    setSpin((s) => s + 1);
    setBetsBySpin({});
  }

  return (
    <div className="bg-white/5 rounded-lg p-3 space-y-2">
      <p className="text-xs text-white/60">Add bets to the current spin, then commit the spin.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-white/60">
        <label className="flex flex-col">
          Spin (0-9)
          <input type="number" min={0} max={9} value={spin} onChange={(e) => setSpin(Number(e.target.value))} />
        </label>
        <label className="flex flex-col">
          Bet type
          <select value={betType} onChange={(e) => setBetType(e.target.value as BetType)}>
            <option value="red">Red</option>
            <option value="black">Black</option>
            <option value="even">Even</option>
            <option value="odd">Odd</option>
            <option value="dozen">Dozen (1,2,3)</option>
            <option value="straight">Straight</option>
          </select>
        </label>
        <label className="flex flex-col">
          Value (for dozen/straight)
          <input
            type="number"
            min={0}
            max={36}
            value={value ?? ""}
            onChange={(e) => setValue(e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </label>
        <label className="flex flex-col">
          Amount
          <input type="number" min={1} max={50} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={addBet} disabled={!active || spin > 9} className="btn-secondary flex-1">
          Add bet
        </button>
        <button onClick={commitSpin} disabled={!active || spin > 9} className="btn-primary flex-1">
          Commit spin {spin + 1}/10
        </button>
      </div>
      <div className="text-xs text-white/70">
        Pending bets for spin {spin}: {betsBySpin[spin]?.length ?? 0}
      </div>
    </div>
  );
}

function CrashLive({ transcript }: { transcript: RunAction[] }) {
  const cashout = [...transcript].reverse().find((a) => a.type === "cashout")?.at ?? null;
  return (
    <div className="bg-white/5 rounded-lg p-3 space-y-1">
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>Crash timeline preview</span>
        <span>{cashout ? `${cashout.toFixed(2)}s` : "No cash-out yet"}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 via-yellow-300 to-red-500"
          style={{ width: `${Math.min(100, (cashout ?? 0) * 12)}%` }}
        />
      </div>
      <p className="text-xs text-white/60">
        The crash curve is deterministic. This bar marks when you cashed out relative to the run timer.
      </p>
    </div>
  );
}

function MinesLive({ transcript }: { transcript: RunAction[] }) {
  const reveals = transcript.filter((a) => a.type === "reveal").map((a) => a.payload?.index);
  const banked = transcript.some((a) => a.type === "bank");
  return (
    <div className="bg-white/5 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>Revealed tiles preview</span>
        <span>{reveals.length} flipped</span>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {Array.from({ length: 25 }).map((_, idx) => (
          <div
            key={idx}
            className={`aspect-square rounded-md border border-white/10 ${reveals.includes(idx) ? "bg-green-500/30" : "bg-white/5"}`}
          />
        ))}
      </div>
      <p className="text-xs text-white/60">{banked ? "You banked this run." : "Bank to lock your multiplier before a mine."}</p>
    </div>
  );
}

function PlinkoLive({ transcript }: { transcript: RunAction[] }) {
  const lastDrop = [...transcript].reverse().find((a) => a.type === "drop");
  const path = useMemo(() => buildPlinkoPath(lastDrop?.payload), [lastDrop]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    if (!path.length) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= path.length - 1) {
          clearInterval(id);
          return s;
        }
        return s + 1;
      });
    }, 150);
    return () => clearInterval(id);
  }, [path]);

  return (
    <div className="bg-white/5 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>Plinko drop preview</span>
        <span>{lastDrop ? `Ball path (${path.length} rows)` : "No drops yet"}</span>
      </div>
      <div className="space-y-1">
        {Array.from({ length: path.length || 8 }).map((_, row) => {
          const col = path[row] ?? 3;
          return (
            <div key={row} className="flex justify-center gap-2">
              {Array.from({ length: 7 }).map((__, c) => (
                <div
                  key={c}
                  className={`h-3 w-3 rounded-full ${row <= step && c === col ? "bg-accent" : "bg-white/20"}`}
                />
              ))}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-white/60">Latest drop animates through the board so you can see your slot + nudge choice.</p>
    </div>
  );
}

function BlackjackLive({ transcript }: { transcript: RunAction[] }) {
  const lastHand = [...transcript].reverse().find((a) => a.type === "hand");
  const decisions = (lastHand?.payload?.decisions as string[]) || [];
  const samplePlayer = ["A♠", "9♥"];
  const sampleDealer = ["10♣", "7♦"];
  return (
    <div className="bg-white/5 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>Blackjack hand preview</span>
        <span>{lastHand ? `Hand ${lastHand.payload?.hand}` : "No hand queued"}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <MiniCardRow label="You (sample)" cards={samplePlayer} highlight />
        <MiniCardRow label="Dealer (sample)" cards={sampleDealer} />
      </div>
      <p className="text-xs text-white/60">
        Decisions for this hand: {decisions.length ? decisions.join(" → ") : "none yet"}. Actual cards are set server-side from the shared shoe.
      </p>
    </div>
  );
}

function RouletteLive({ transcript }: { transcript: RunAction[] }) {
  const lastSpin = [...transcript].reverse().find((a) => a.type === "spin");
  const spinIndex = lastSpin?.payload?.spin ?? 0;
  const pseudoOutcome = (spinIndex * 7 + 3) % 37;
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    if (!lastSpin) return;
    const target = (pseudoOutcome / 37) * 360 + 720; // spin + land
    setAngle((prev) => prev + target);
  }, [lastSpin, pseudoOutcome]);

  return (
    <div className="bg-white/5 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>Roulette wheel preview</span>
        <span>{lastSpin ? `Spin ${spinIndex + 1}` : "No spins yet"}</span>
      </div>
      <div className="relative h-32 w-full overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-slate-800 to-slate-950">
        <div
          className="absolute inset-0"
          style={{
            transform: `rotate(${angle}deg)`,
            transition: "transform 1s ease-out",
            backgroundImage:
              "conic-gradient(#22c55e 0deg 10deg, #ef4444 10deg 20deg, #ffffff33 20deg 30deg, #ef4444 30deg 40deg, #22c55e 40deg 50deg, #ffffff33 50deg 60deg, #ef4444 60deg 70deg, #22c55e 70deg 80deg, #ffffff33 80deg 90deg, #ef4444 90deg 100deg, #22c55e 100deg 110deg, #ffffff33 110deg 120deg, #ef4444 120deg 130deg, #22c55e 130deg 140deg, #ffffff33 140deg 150deg, #ef4444 150deg 160deg, #22c55e 160deg 170deg, #ffffff33 170deg 180deg, #ef4444 180deg 190deg, #22c55e 190deg 200deg, #ffffff33 200deg 210deg, #ef4444 210deg 220deg, #22c55e 220deg 230deg, #ffffff33 230deg 240deg, #ef4444 240deg 250deg, #22c55e 250deg 260deg, #ffffff33 260deg 270deg, #ef4444 270deg 280deg, #22c55e 280deg 290deg, #ffffff33 290deg 300deg, #ef4444 300deg 310deg, #22c55e 310deg 320deg, #ffffff33 320deg 330deg, #ef4444 330deg 340deg, #22c55e 340deg 350deg, #ffffff33 350deg 360deg)",
          }}
        />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow" />
      </div>
      <p className="text-xs text-white/60">
        Wheel animation is for feedback only; server reveals the actual spin result when the run is scored.
      </p>
    </div>
  );
}

function buildPlinkoPath(payload?: { slot?: number; nudgeRow?: number; nudgeDir?: -1 | 1 }) {
  if (!payload) return [];
  const rows = 8;
  const slots = 7;
  let position = clamp(payload.slot ?? 3, 0, slots - 1);
  const path: number[] = [];
  for (let row = 0; row < rows; row++) {
    path.push(position);
    const bias = position / (slots - 1) - 0.5;
    let dir = bias >= 0 ? 1 : -1;
    if (row === payload.nudgeRow && payload.nudgeDir) dir = payload.nudgeDir;
    position = clamp(position + dir, 0, slots - 1);
  }
  path.push(position);
  return path;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function MiniCardRow({ label, cards, highlight }: { label: string; cards: string[]; highlight?: boolean }) {
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
