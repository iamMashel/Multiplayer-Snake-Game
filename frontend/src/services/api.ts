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
  } catch (error) {
    console.error('API Request Error:', error);
    return { success: false, error: 'Network error details' };
  }
}

// Session storage key
const SESSION_KEY = 'snake_game_session_v2';

// ============ Auth API ============

export const authApi = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    const response = await request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(response.data));
    }

    return response;
  },

  async signup(credentials: SignupCredentials): Promise<ApiResponse<User>> {
    const response = await request<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(response.data));
    }

    return response;
  },

  async logout(): Promise<ApiResponse<null>> {
    // In a real app we might call the backend too
    // await request('/auth/logout', { method: 'POST' });
    localStorage.removeItem(SESSION_KEY);
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
    username: string,
    challengeId?: string,
  ): Promise<ApiResponse<LeaderboardEntry>> {
    return request<LeaderboardEntry>('/leaderboard/', {
      method: 'POST',
      body: JSON.stringify({ score, mode, username, challenge_id: challengeId }),
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
