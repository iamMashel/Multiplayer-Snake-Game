import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { authApi, leaderboardApi, gameApi } from '@/services/api';
import type { User, LeaderboardEntry } from '@/types';

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('API Service', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockUser: User = {
    id: '1',
    username: 'TestUser',
    email: 'test@example.com',
    createdAt: '2024-01-01',
  };

  describe('authApi', () => {
    it('successfully logs in with valid credentials', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { user: mockUser, token: 'tok-123' } }),
      });

      const response = await authApi.login({ email: 'test@example.com', password: 'password123' });

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockUser);
      expect(localStorage.getItem('snake_game_session_v3')).toBeTruthy();
      expect(localStorage.getItem('snake_game_token_v3')).toBe('tok-123');
      expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/api/auth/login', expect.any(Object));
    });

    it('fails with invalid credentials', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, error: 'Invalid credentials' }),
      });

      const response = await authApi.login({ email: 'wrong@example.com', password: 'wrong' });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid credentials');
    });

    it('successfully signs up', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { user: mockUser, token: 'tok-456' } }),
      });

      const response = await authApi.signup({ username: 'TestUser', email: 'test@example.com', password: 'password123' });

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockUser);
      expect(localStorage.getItem('snake_game_token_v3')).toBe('tok-456');
    });
  });

  describe('leaderboardApi', () => {
    const mockEntries: LeaderboardEntry[] = [
      { id: '1', rank: 1, username: 'Player1', score: 100, mode: 'walls', playedAt: '2024-01-01' },
      { id: '2', rank: 2, username: 'Player2', score: 50, mode: 'pass-through', playedAt: '2024-01-01' },
    ];

    it('returns all entries when no mode filter', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockEntries }),
      });

      const response = await leaderboardApi.getLeaderboard();

      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(2);
      expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/api/leaderboard/', expect.any(Object));
    });

    it('filters entries by mode', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [mockEntries[0]] }),
      });

      const response = await leaderboardApi.getLeaderboard('walls');

      expect(response.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/api/leaderboard/?mode=walls', expect.any(Object));
    });
  });

  describe('gameApi', () => {
    it('saveGame succeeds', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await gameApi.saveGame({} as any, 'user-1');
      expect(response.success).toBe(true);
    });

    it('loadGame returns null when no saved game', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: null }),
      });

      const response = await gameApi.loadGame('user-1');
      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
    });
  });
});
