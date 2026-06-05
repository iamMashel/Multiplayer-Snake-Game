// Game Types
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameMode = 'pass-through' | 'walls' | 'daily';
export type GameStatus = 'idle' | 'playing' | 'paused' | 'game-over';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  status: GameStatus;
  mode: GameMode;
  speed: number;
  /** Daily Challenge only: seed + pre-rolled food queue for a deterministic board. */
  seed?: number;
  foodQueue?: Position[];
  foodIndex?: number;
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Leaderboard Types
export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  score: number;
  mode: GameMode;
  playedAt: string;
}

// Spectator Types
export interface ActivePlayer {
  id: string;
  username: string;
  score: number;
  mode: GameMode;
  gameState: GameState;
  viewers: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}
