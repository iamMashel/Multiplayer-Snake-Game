import React, { memo } from 'react';
import type { GameState, Direction } from '@/types';
import { GRID_SIZE } from '@/lib/gameLogic';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trophy, UserPlus } from 'lucide-react';

// Eye positions for the snake head, based on travel direction.
const EYE_POSITIONS: Record<Direction, [string, string]> = {
  UP: ['top-[14%] left-[22%]', 'top-[14%] right-[22%]'],
  DOWN: ['bottom-[14%] left-[22%]', 'bottom-[14%] right-[22%]'],
  LEFT: ['top-[22%] left-[14%]', 'bottom-[22%] left-[14%]'],
  RIGHT: ['top-[22%] right-[14%]', 'bottom-[22%] right-[14%]'],
};

const SnakeHead = memo(({ direction }: { direction: Direction }) => {
  const [eyeA, eyeB] = EYE_POSITIONS[direction];
  return (
    <div className="w-full h-full rounded-sm snake-segment relative scale-90">
      <div className="absolute inset-0.5 bg-primary/30 rounded-sm" />
      <span className={cn('absolute w-[20%] h-[20%] rounded-full bg-background', eyeA)} />
      <span className={cn('absolute w-[20%] h-[20%] rounded-full bg-background', eyeB)} />
    </div>
  );
});
SnakeHead.displayName = 'SnakeHead';

const Cell = memo(({ isSnakeHead, isSnakeBody, isFood, direction }: {
  isSnakeHead: boolean;
  isSnakeBody: boolean;
  isFood: boolean;
  direction: Direction;
}) => {
  if (isSnakeHead) {
    return <SnakeHead direction={direction} />;
  }

  if (isSnakeBody) {
    return (
      <div className="w-full h-full rounded-sm snake-segment opacity-80 scale-90" />
    );
  }

  if (isFood) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-[60%] h-[60%] rounded-full food-item" />
      </div>
    );
  }

  return null;
});

Cell.displayName = 'Cell';

interface GameBoardProps {
  gameState: GameState;
  isSpectator?: boolean;
  finalScore?: number;
  isNewBest?: boolean;
  /** True when no one is signed in — show a "save your score" prompt on game over. */
  isGuest?: boolean;
  onRequestAuth?: () => void;
}

export const GameBoard = memo(({
  gameState,
  isSpectator = false,
  finalScore = 0,
  isNewBest = false,
  isGuest = false,
  onRequestAuth,
}: GameBoardProps) => {
  const { snake, food, status, direction } = gameState;

  // Create a map for quick lookup
  const snakeMap = new Map<string, number>();
  snake.forEach((segment, index) => {
    snakeMap.set(`${segment.x},${segment.y}`, index);
  });

  const cells = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const key = `${x},${y}`;
      const snakeIndex = snakeMap.get(key);
      const isSnakeHead = snakeIndex === 0;
      const isSnakeBody = snakeIndex !== undefined && snakeIndex > 0;
      const isFood = food.x === x && food.y === y;

      cells.push(
        <div key={key} className="aspect-square bg-grid-bg">
          <Cell
            isSnakeHead={isSnakeHead}
            isSnakeBody={isSnakeBody}
            isFood={isFood}
            direction={direction}
          />
        </div>
      );
    }
  }

  return (
    <div className={cn(
      "relative rounded-lg overflow-hidden neon-box",
      isSpectator && "neon-box-accent",
      status === 'game-over' && !isSpectator && "game-shake"
    )}>
      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines z-10 pointer-events-none" />

      {/* Grid */}
      <div
        className="game-grid bg-grid-line p-1"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gap: '1px',
        }}
      >
        {cells}
      </div>

      {/* Game over overlay */}
      {status === 'game-over' && !isSpectator && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20 animate-fade-in">
          <div className="text-center px-4">
            <h2 className="font-display text-3xl text-destructive neon-text mb-2">GAME OVER</h2>

            {isNewBest && finalScore > 0 && (
              <p className="font-display text-sm text-primary text-glow-primary mb-1 flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4" /> NEW BEST!
              </p>
            )}

            <p className="font-display text-2xl text-secondary text-glow-secondary mb-4">
              Score: {finalScore}
            </p>

            {isGuest && finalScore > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Sign up to save your score to the global leaderboard
                </p>
                <Button
                  size="sm"
                  onClick={onRequestAuth}
                  className="font-display arcade-button neon-box"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Save my score
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">Press Start to play again</p>
            )}
          </div>
        </div>
      )}

      {/* Paused overlay */}
      {status === 'paused' && !isSpectator && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20 animate-fade-in">
          <div className="text-center">
            <h2 className="font-display text-3xl text-secondary text-glow-secondary mb-2">PAUSED</h2>
            <p className="text-muted-foreground">Press Resume to continue</p>
          </div>
        </div>
      )}

      {/* Idle overlay */}
      {status === 'idle' && !isSpectator && (
        <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-20">
          <div className="text-center">
            <h2 className="font-display text-2xl text-primary text-glow-primary mb-2">READY</h2>
            <p className="text-muted-foreground">Press Start to begin</p>
          </div>
        </div>
      )}
    </div>
  );
});

GameBoard.displayName = 'GameBoard';
