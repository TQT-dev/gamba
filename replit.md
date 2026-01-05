# Gamba Arcade

## Overview

Gamba Arcade is a skill-forward virtual coin arcade featuring five deterministic daily mini-games. The core innovation is that all players share the same daily seeds (generated via HMAC), ensuring fair competition on leaderboards. Games include Crash, Mines, Plinko, Blackjack, and Roulette—each with server-authoritative scoring and transcript verification.

The platform uses virtual coins only (no real money) and implements daily leaderboards with "best-of" scoring rules to reduce luck variance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 App Router with TypeScript
- **Styling**: Tailwind CSS with custom dark theme (bg-dark, card, accent colors)
- **Components**: React Server Components for data fetching, Client Components for interactivity
- **Key UI patterns**: Card-based layouts, game visualizers, auth panel, leaderboard previews

### Backend Architecture
- **API Layer**: Next.js Route Handlers under `/app/api/`
- **Authentication**: Session-based with nickname + PIN, bcrypt hashing, SHA-256 token hashing
- **Session storage**: Database-backed with 7-day expiry, cookie-based token
- **Game runs**: Three-phase flow (start → actions → finish) with server-side verification

### Deterministic Game Engine
- **Seed generation**: HMAC-SHA256 using server secret + gameId + date + variant
- **RNG**: Deterministic pseudo-random via SHA-256 chain seeded from daily seed
- **Simulation**: All game logic runs server-side with identical results for same seed + transcript
- **Games implemented**: crash, mines, plinko, blackjack, roulette (each in `/lib/games/`)

### Data Model Design
- **Users**: nickname (unique), hashed PIN, linked wallet
- **Wallets**: Virtual coin balance per user
- **Runs**: Game attempts with transcript JSON, score, verification status
- **Daily Seeds**: Per-game per-day seed hashes for fairness verification
- **Leaderboard Aggregates**: Pre-computed daily scores using best-of rules
- **Friendships**: Simple friend list for friends-only leaderboards

### Key Design Decisions

1. **Server-authoritative scoring**: Clients submit action transcripts; server replays deterministically to compute scores. Prevents cheating.

2. **Daily seed sharing**: Same HMAC seed for all players per game per day ensures fair competition.

3. **Best-of scoring**: Daily leaderboards use top N runs (configurable per game) to reduce single-run luck variance.

4. **Coin caps**: Daily maximum coins per game prevents grinding exploits.

5. **Timezone handling**: Brussels timezone (UTC+1) used for daily boundaries via date-fns-tz.

## External Dependencies

### Database
- **ORM**: Prisma 5.18
- **Default**: SQLite for local development
- **Production-ready**: Schema supports PostgreSQL switch via `DATABASE_PROVIDER` env var

### Authentication & Security
- **bcryptjs**: PIN hashing
- **Node crypto**: HMAC seeds, SHA-256 token hashing, deterministic RNG

### Date/Time
- **date-fns-tz**: Brussels timezone handling for daily seed boundaries

### Environment Variables Required
- `SERVER_SECRET`: HMAC key for deterministic seed generation (critical for game fairness)
- `DATABASE_URL`: Database connection string
- `DATABASE_PROVIDER`: "sqlite" or "postgresql"

### Testing
- **Vitest**: Unit tests for deterministic game simulations (`tests/games.test.ts`)