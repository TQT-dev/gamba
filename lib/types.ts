export type GameId = "crash" | "mines" | "plinko" | "blackjack" | "roulette";

export type LeaderboardScope = "daily" | "alltime";

export type LeaderboardEntry = {
  userId: string;
  nickname: string;
  score: number;
};

export type RunAction = {
  at: number;
  type: string;
  payload?: any;
};

export type RunResult = {
  score: number;
  transcript: RunAction[];
};

export type GameRules = {
  tickets: number;
  bestOf: number;
  maxCoinsPerDay: number;
};

export const GAME_RULES: Record<GameId, GameRules> = {
  crash: { tickets: 10, bestOf: 3, maxCoinsPerDay: 500 },
  mines: { tickets: 5, bestOf: 3, maxCoinsPerDay: 400 },
  plinko: { tickets: 3, bestOf: 1, maxCoinsPerDay: 350 },
  blackjack: { tickets: 3, bestOf: 1, maxCoinsPerDay: 300 },
  roulette: { tickets: 3, bestOf: 1, maxCoinsPerDay: 300 },
};

export type GameMetadata = {
  id: GameId;
  title: string;
  description: string;
};

export const GAMES: GameMetadata[] = [
  {
    id: "crash",
    title: "Daily Crash Run",
    description: "Tap to cash out before the inevitable crash. Timing matters!",
  },
  {
    id: "mines",
    title: "Mines Run",
    description: "Navigate a 5x5 grid and bank your winnings before you hit a mine.",
  },
  {
    id: "plinko",
    title: "Plinko Trials",
    description: "Drop 10 balls, aim your slot, and use one nudge to steer fate.",
  },
  {
    id: "blackjack",
    title: "Blackjack Challenge",
    description: "Play 10 hands against the dealer using the shared daily shoe.",
  },
  {
    id: "roulette",
    title: "Roulette Strategy",
    description: "Allocate bets for 10 spins; grow your bankroll efficiently.",
  },
];
