/**
 * Pure game logic functions for the Snake game
 * These are separated for easy testing
 */

import type { Position, Direction, GameState, GameMode } from '@/types';

export const GRID_SIZE = 20;
export const INITIAL_SPEED = 150;
export const SPEED_INCREMENT = 5;
export const MIN_SPEED = 50;

// Direction vectors
export const DIRECTION_VECTORS: Record<Direction, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// Opposite directions (can't reverse directly)
export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

// ---- Daily Challenge: deterministic, seeded food ----

// How many food positions to pre-roll for a daily run (a snake can't realistically eat this many).
const FOOD_QUEUE_SIZE = 600;

/** Small, fast, deterministic PRNG. Same seed → same sequence on every device. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Numeric seed for a given UTC day, e.g. 20260605. Same for everyone on that calendar day. */
export function getDailySeed(date: Date = new Date()): number {
  return (
    date.getUTCFullYear() * 10000 +
    (date.getUTCMonth() + 1) * 100 +
    date.getUTCDate()
  );
}

/** Human/stable id for a given UTC day, e.g. "2026-06-05" — used as the daily leaderboard key. */
export function getDailyId(date: Date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Pre-roll a deterministic list of candidate food positions from a seed. */
export function buildFoodQueue(seed: number): Position[] {
  const rng = mulberry32(seed);
  const queue: Position[] = [];
  for (let i = 0; i < FOOD_QUEUE_SIZE; i++) {
    queue.push({
      x: Math.floor(rng() * GRID_SIZE),
      y: Math.floor(rng() * GRID_SIZE),
    });
  }
  return queue;
}

/** Take the next queued food not under the snake; falls back to random if exhausted. */
function nextQueuedFood(
  queue: Position[],
  startIndex: number,
  snake: Position[],
): { food: Position; index: number } {
  const occupied = new Set(snake.map(p => `${p.x},${p.y}`));
  let i = startIndex;
  while (i < queue.length) {
    const f = queue[i];
    i++;
    if (!occupied.has(`${f.x},${f.y}`)) {
      return { food: f, index: i };
    }
  }
  return { food: generateFood(snake), index: i };
}

/**
 * Create initial game state
 */
export function createInitialState(mode: GameMode): GameState {
  const centerX = Math.floor(GRID_SIZE / 2);
  const centerY = Math.floor(GRID_SIZE / 2);

  const snake: Position[] = [
    { x: centerX, y: centerY },
    { x: centerX + 1, y: centerY },
    { x: centerX + 2, y: centerY },
  ];

  // Daily Challenge: same board for everyone on a given UTC day.
  if (mode === 'daily') {
    const seed = getDailySeed();
    const foodQueue = buildFoodQueue(seed);
    const { food, index } = nextQueuedFood(foodQueue, 0, snake);
    return {
      snake,
      food,
      direction: 'LEFT',
      score: 0,
      status: 'idle',
      mode,
      speed: INITIAL_SPEED,
      seed,
      foodQueue,
      foodIndex: index,
    };
  }

  return {
    snake,
    food: generateFood(snake),
    direction: 'LEFT',
    score: 0,
    status: 'idle',
    mode,
    speed: INITIAL_SPEED,
  };
}

/**
 * Generate food at random position not occupied by snake.
 * Accepts an optional RNG so daily runs can be deterministic (defaults to Math.random).
 */
export function generateFood(snake: Position[], rng: () => number = Math.random): Position {
  const occupied = new Set(snake.map(p => `${p.x},${p.y}`));

  let food: Position;
  do {
    food = {
      x: Math.floor(rng() * GRID_SIZE),
      y: Math.floor(rng() * GRID_SIZE),
    };
  } while (occupied.has(`${food.x},${food.y}`));

  return food;
}

/**
 * Calculate next head position based on direction
 */
export function getNextHeadPosition(head: Position, direction: Direction, mode: GameMode): Position {
  const delta = DIRECTION_VECTORS[direction];
  let newX = head.x + delta.x;
  let newY = head.y + delta.y;

  if (mode !== 'walls') {
    // Wrap around edges (pass-through and daily); only 'walls' has hard edges.
    newX = (newX + GRID_SIZE) % GRID_SIZE;
    newY = (newY + GRID_SIZE) % GRID_SIZE;
  }

  return { x: newX, y: newY };
}

/**
 * Check if position is out of bounds (only matters in 'walls' mode)
 */
export function isOutOfBounds(position: Position): boolean {
  return position.x < 0 || position.x >= GRID_SIZE || position.y < 0 || position.y >= GRID_SIZE;
}

/**
 * Check if snake collides with itself
 */
export function checkSelfCollision(snake: Position[]): boolean {
  const head = snake[0];
  return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
}

/**
 * Check if head is at food position
 */
export function checkFoodCollision(head: Position, food: Position): boolean {
  return head.x === food.x && head.y === food.y;
}

/**
 * Validate direction change (can't reverse directly)
 */
export function isValidDirectionChange(current: Direction, next: Direction): boolean {
  return OPPOSITE_DIRECTIONS[current] !== next;
}

/**
 * Move the snake one step
 * Returns new game state
 */
export function moveSnake(state: GameState): GameState {
  if (state.status !== 'playing') {
    return state;
  }

  const head = state.snake[0];
  const newHead = getNextHeadPosition(head, state.direction, state.mode);

  // Check wall collision in 'walls' mode
  if (state.mode === 'walls' && isOutOfBounds(newHead)) {
    return { ...state, status: 'game-over' };
  }

  // Create new snake with new head
  const newSnake = [newHead, ...state.snake];

  // Check self collision (before removing tail)
  if (checkSelfCollision(newSnake.slice(0, -1))) {
    return { ...state, status: 'game-over' };
  }

  // Check food collision
  const ateFood = checkFoodCollision(newHead, state.food);

  if (ateFood) {
    const newSpeed = Math.max(MIN_SPEED, state.speed - SPEED_INCREMENT);

    // Daily runs draw from the deterministic queue; others use random food.
    let newFood: Position;
    let newFoodIndex = state.foodIndex;
    if (state.foodQueue && state.foodIndex !== undefined) {
      const next = nextQueuedFood(state.foodQueue, state.foodIndex, newSnake);
      newFood = next.food;
      newFoodIndex = next.index;
    } else {
      newFood = generateFood(newSnake);
    }

    return {
      ...state,
      snake: newSnake,
      food: newFood,
      foodIndex: newFoodIndex,
      score: state.score + 10,
      speed: newSpeed,
    };
  } else {
    // Remove tail
    newSnake.pop();
    return {
      ...state,
      snake: newSnake,
    };
  }
}

/**
 * Change direction if valid
 */
export function changeDirection(state: GameState, newDirection: Direction): GameState {
  if (!isValidDirectionChange(state.direction, newDirection)) {
    return state;
  }

  return { ...state, direction: newDirection };
}

/**
 * Calculate score multiplier based on mode
 */
export function getScoreMultiplier(mode: GameMode): number {
  return mode === 'walls' ? 1.5 : 1;
}

/**
 * Get final score with multiplier applied
 */
export function getFinalScore(state: GameState): number {
  return Math.floor(state.score * getScoreMultiplier(state.mode));
}
