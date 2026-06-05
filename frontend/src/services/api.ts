/**
 * API Service
 * Connects to the Python FastAPI Backend
 */

import type {
  User,
  LoginCredentials,
  SignupCredentials,
  LeaderboardEntry,
  ActivePlayer,
  GameMode,
  ApiResponse,
  GameState,
} from '@/types';
import { API_BASE } from '../config';

// Helper for making requests
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    // Check if network response was not ok but we have error data
    if (!response.ok && !data.success) {
      return { success: false, error: data.detail || data.error || 'An error occurred' };
    }

    return data;
  } catch {
    return { success: false, error: 'Network error. Check your connection and try again.' };
  }
}

// Session storage keys (v3: sessions now carry an auth token)
const SESSION_KEY = 'snake_game_session_v3';
const TOKEN_KEY = 'snake_game_token_v3';

/** Auth payload returned by login/signup. */
interface AuthData {
  user: User;
  token: string;
}

/** The current Bearer token, if logged in. */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Persist the user + token from an auth response and normalize to ApiResponse<User>. */
function persistAuth(response: ApiResponse<AuthData>): ApiResponse<User> {
  if (response.success && response.data) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(response.data.user));
    localStorage.setItem(TOKEN_KEY, response.data.token);
    return { success: true, data: response.data.user };
  }
  return { success: false, error: response.error };
}

// ============ Auth API ============

export const authApi = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    const response = await request<AuthData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return persistAuth(response);
  },

  async signup(credentials: SignupCredentials): Promise<ApiResponse<User>> {
    const response = await request<AuthData>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return persistAuth(response);
  },

  async logout(): Promise<ApiResponse<null>> {
    // In a real app we might call the backend too
    // await request('/auth/logout', { method: 'POST' });
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    return { success: true };
  },

  async getSession(): Promise<ApiResponse<User | null>> {
    // For this MVP, we rely on localStorage as per the mock implementation
    // But verify with backend if needed. For now, trusting local storage to match current flow
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      return { success: true, data: JSON.parse(stored) };
    }
    return { success: true, data: null };
  },
};

// ============ Leaderboard API ============

export const leaderboardApi = {
  async getLeaderboard(mode?: GameMode, challengeId?: string): Promise<ApiResponse<LeaderboardEntry[]>> {
    const params = new URLSearchParams();
    if (mode) params.set('mode', mode);
    if (challengeId) params.set('challenge_id', challengeId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<LeaderboardEntry[]>(`/leaderboard/${query}`);
  },

  async submitScore(
    score: number,
    mode: GameMode,
    challengeId?: string,
  ): Promise<ApiResponse<LeaderboardEntry>> {
    const token = getAuthToken();
    return request<LeaderboardEntry>('/leaderboard/', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ score, mode, challenge_id: challengeId }),
    });
  },
};

// ============ Spectator API ============

export const spectatorApi = {
  async getActivePlayers(): Promise<ApiResponse<ActivePlayer[]>> {
    return request<ActivePlayer[]>('/spectator/active');
  },

  async watchPlayer(playerId: string): Promise<ApiResponse<ActivePlayer>> {
    return request<ActivePlayer>(`/spectator/watch/${playerId}`, {
      method: 'POST',
    });
  },

  async stopWatching(playerId: string): Promise<ApiResponse<null>> {
    return request<null>(`/spectator/stop/${playerId}`, {
      method: 'POST',
    });
  },
};

// ============ Game API ============

export const gameApi = {
  async saveGame(gameState: GameState, userId: string): Promise<ApiResponse<null>> {
    return request<null>('/game/save', {
      method: 'POST',
      body: JSON.stringify({ gameState, userId }),
    });
  },

  async loadGame(userId: string): Promise<ApiResponse<GameState | null>> {
    return request<GameState | null>(`/game/load/${userId}`);
  },
};
