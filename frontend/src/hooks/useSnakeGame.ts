import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, Direction, GameMode } from '@/types';
import {
  createInitialState,
  moveSnake,
  changeDirection,
  getFinalScore,
  getDailyId,
} from '@/lib/gameLogic';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCustomization } from '@/contexts/CustomizationContext';
import { leaderboardApi } from '@/services/api';
import { sfx, unlockAudio } from '@/lib/sound';
import { haptics } from '@/lib/haptics';
import { toast } from 'sonner';

interface UseSnakeGameReturn {
  gameState: GameState;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  setMode: (mode: GameMode) => void;
  handleDirectionChange: (direction: Direction) => void;
  finalScore: number;
  /** Best score on this device for the current mode (works for guests too). */
  personalBest: number;
  /** True when the most recent game beat the device personal best. */
  isNewBest: boolean;
}

// ---- Local personal-best storage (per mode, persists for guests & logged-in) ----
const BEST_KEY = 'snake_personal_best';

function loadBests(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) || '{}');
  } catch {
    return {};
  }
}

function getBest(mode: GameMode): number {
  return loadBests()[mode] ?? 0;
}

/** Persist a new best if it beats the stored one. Returns whether it was a new best. */
function recordBest(mode: GameMode, score: number): boolean {
  const bests = loadBests();
  if (score > (bests[mode] ?? 0)) {
    bests[mode] = score;
    localStorage.setItem(BEST_KEY, JSON.stringify(bests));
    return true;
  }
  return false;
}

export function useSnakeGame(initialMode: GameMode = 'pass-through'): UseSnakeGameReturn {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(initialMode));
  const [personalBest, setPersonalBest] = useState<number>(() => getBest(initialMode));
  const [isNewBest, setIsNewBest] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  const directionQueueRef = useRef<Direction[]>([]);
  const previousStatusRef = useRef<GameState['status']>('idle');
  const prevScoreRef = useRef(0);
  const { user } = useAuthContext();
  const { customization } = useCustomization();
  const hapticsOn = customization.haptics;

  // Submit score + record personal best when a game ends
  useEffect(() => {
    if (
      gameState.status === 'game-over' &&
      previousStatusRef.current === 'playing'
    ) {
      const finalScore = getFinalScore(gameState);

      // Personal best is tracked locally for everyone (guests included).
      const beatBest = recordBest(gameState.mode, finalScore);
      setIsNewBest(beatBest);
      if (beatBest) {
        setPersonalBest(finalScore);
      }

      // Game-over jingle (celebratory if it's a new best) + crash buzz.
      sfx.gameOver();
      if (hapticsOn) haptics.crash();
      if (beatBest && finalScore > 0) {
        sfx.best();
      }

      // Only logged-in users contribute to the global leaderboard.
      // Daily runs are tagged with the day so they land on the daily board.
      if (user && finalScore > 0) {
        const challengeId = gameState.mode === 'daily' ? getDailyId() : undefined;
        leaderboardApi
          .submitScore(finalScore, gameState.mode, challengeId)
          .then(res => {
            if (res.success) toast.success('Score saved to the leaderboard');
            else toast.error("Couldn't save your score. It'll retry next run.");
          })
          .catch(() => toast.error("Couldn't save your score. It'll retry next run."));
      }
    }
    previousStatusRef.current = gameState.status;
  }, [gameState.status, gameState.score, gameState.mode, user, hapticsOn]);

  // Eat feedback: fires whenever the score increases mid-game.
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.score > prevScoreRef.current) {
      sfx.eat();
      if (hapticsOn) haptics.eat();
    }
    prevScoreRef.current = gameState.score;
  }, [gameState.score, gameState.status, hapticsOn]);

  // Process direction queue to handle rapid inputs
  const processDirectionQueue = useCallback(() => {
    if (directionQueueRef.current.length === 0) return;

    setGameState(prev => {
      let newState = prev;
      while (directionQueueRef.current.length > 0) {
        const nextDirection = directionQueueRef.current.shift()!;
        const updated = changeDirection(newState, nextDirection);
        if (updated !== newState) {
          newState = updated;
          sfx.turn();
          break;
        }
      }
      return newState;
    });
  }, []);

  // Main game loop
  useEffect(() => {
    if (gameState.status !== 'playing') {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = window.setInterval(() => {
      processDirectionQueue();
      setGameState(prev => moveSnake(prev));
    }, gameState.speed);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.status, gameState.speed, processDirectionQueue]);

  // Reset game when user changes (new login/logout)
  useEffect(() => {
    setGameState(createInitialState(initialMode));
    setPersonalBest(getBest(initialMode));
    setIsNewBest(false);
    directionQueueRef.current = [];
    prevScoreRef.current = 0;
  }, [user?.username]); // Use username as trigger

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent game controls when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (gameState.status !== 'playing') return;

      const keyToDirection: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        s: 'DOWN',
        a: 'LEFT',
        d: 'RIGHT',
        W: 'UP',
        S: 'DOWN',
        A: 'LEFT',
        D: 'RIGHT',
      };

      const direction = keyToDirection[e.key];
      if (direction) {
        e.preventDefault();
        directionQueueRef.current.push(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status]);

  const startGame = useCallback(() => {
    unlockAudio();
    sfx.start();
    setIsNewBest(false);
    prevScoreRef.current = 0;
    setGameState(prev => ({ ...prev, status: 'playing' }));
    directionQueueRef.current = [];
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => {
      if (prev.status === 'playing') {
        return { ...prev, status: 'paused' };
      }
      return prev;
    });
  }, []);

  const resumeGame = useCallback(() => {
    setGameState(prev => {
      if (prev.status === 'paused') {
        return { ...prev, status: 'playing' };
      }
      return prev;
    });
  }, []);

  const resetGame = useCallback(() => {
    setIsNewBest(false);
    prevScoreRef.current = 0;
    setGameState(createInitialState(gameState.mode));
    directionQueueRef.current = [];
  }, [gameState.mode]);

  const setMode = useCallback((mode: GameMode) => {
    setIsNewBest(false);
    prevScoreRef.current = 0;
    setPersonalBest(getBest(mode));
    setGameState(createInitialState(mode));
    directionQueueRef.current = [];
  }, []);

  const handleDirectionChange = useCallback((direction: Direction) => {
    if (gameState.status === 'playing') {
      directionQueueRef.current.push(direction);
    }
  }, [gameState.status]);

  // Space / Enter to start, restart, pause, and resume (let focused buttons handle it natively).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLButtonElement
      ) {
        return;
      }
      const status = gameState.status;
      if (status === 'idle') { e.preventDefault(); startGame(); }
      else if (status === 'game-over') { e.preventDefault(); resetGame(); }
      else if (status === 'playing') { e.preventDefault(); pauseGame(); }
      else if (status === 'paused') { e.preventDefault(); resumeGame(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState.status, startGame, resetGame, pauseGame, resumeGame]);

  const finalScore = getFinalScore(gameState);

  return {
    gameState,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    setMode,
    handleDirectionChange,
    finalScore,
    personalBest,
    isNewBest,
  };
}
