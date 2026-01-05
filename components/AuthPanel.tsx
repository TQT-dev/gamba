"use client";

import { useState } from "react";

export function AuthPanel() {
  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState("");
  const [mode, setMode] = useState<"login" | "register">("register");
  const [status, setStatus] = useState("");

  async function submit() {
    setStatus("...");
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, pin }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || "Failed");
      return;
    }
    setStatus(`${mode === "login" ? "Logged in" : "Registered"} as ${data.user.nickname}. Refresh to load session.`);
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Session</h3>
        <div className="text-xs bg-white/10 rounded-full px-2 py-1">Nickname + PIN</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span>Nickname</span>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="player1" />
        </label>
        <label className="flex flex-col gap-1">
          <span>PIN</span>
          <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="1234" type="password" />
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { setMode("register"); submit(); }} className="btn-primary">Register</button>
        <button onClick={() => { setMode("login"); submit(); }} className="btn-secondary">Login</button>
      </div>
      {status && <p className="text-xs text-white/60">{status}</p>}
    </div>
  );
}
