# Gamba Arcade

Skill-forward, virtual coin arcade built with Next.js App Router, Prisma, and SQLite. Five deterministic daily mini-games share the same seeds so friends can compete fairly. For entertainment with virtual coins only – no real-money betting or payouts.

## Tech stack
- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma ORM with SQLite locally (easy switch to Postgres)
- API routes for auth, runs, and leaderboards
- Deterministic game simulations per daily HMAC seed

## Getting started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your env file:
   ```bash
   cp .env.example .env
   ```
   - Set `SERVER_SECRET` to a strong secret.
   - Use `DATABASE_PROVIDER=sqlite` for local, or `postgresql` with a Postgres URL.
3. Generate the Prisma client and migrate:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Run tests (determinism for simulations):
   ```bash
   npm test
   ```

## Available API routes
- `POST /api/auth/register` – nickname + pin, returns session token cookie.
- `POST /api/auth/login` – authenticate and start session.
- `POST /api/run/start` – begin a run for a game.
- `POST /api/run/action` – append an action to a run transcript (server validates deterministically).
- `POST /api/run/finish` – finalize, simulate server-side, award coins.
- `GET /api/leaderboard` – fetch daily or all-time leaderboard; supports friends-only scope.

## Games implemented
- **Daily Crash Run** – tap cash out before the crash point.
- **Mines Run** – bank points before hitting a mine on 5x5 grid.
- **Plinko Trials** – drop 10 balls with one nudge each.
- **Blackjack Challenge** – 10 hands vs dealer using shared shoe.
- **Roulette Strategy** – 10 spins to grow bankroll with simple bets.

Each game uses a deterministic daily seed so everyone faces identical conditions. Daily leaderboards use best-of rules to reduce luck, and transcripts are stored for verification.

## Deployment
- Vercel-ready: just set environment variables and deploy.
- For Postgres, set `DATABASE_PROVIDER=postgresql` and `DATABASE_URL` accordingly, then run `prisma migrate deploy`.

## Notes
- The app is virtual-coins-only. There are no real-money features or payouts.
- Anti-cheat: scoring is server-authoritative and transcript-based; runs are verified on the server using deterministic seeds.
