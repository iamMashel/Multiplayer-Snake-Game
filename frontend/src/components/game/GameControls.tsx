import React from 'react';
import { Button } from '@/components/ui/button';
import type { GameState, GameMode, Direction } from '@/types';
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface GameControlsProps {
  gameState: GameState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onDirectionChange: (direction: Direction) => void;
}

export function GameControls({
  gameState,
  onStart,
  onPause,
  onResume,
  onReset,
  onDirectionChange,
}: GameControlsProps) {
  const { status } = gameState;

  return (
    <div className="space-y-2">
      {/* Game Action Buttons - Compact Row */}
      <div className="flex gap-2 justify-center">
        {status === 'idle' && (
          <Button
            onClick={onStart}
            className="flex-1 font-display arcade-button neon-box h-10 text-base"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            START
          </Button>
        )}

        {status === 'playing' && (
          <Button
            onClick={onPause}
            variant="secondary"
            className="flex-1 font-display arcade-button neon-box-secondary h-10 text-base"
            size="sm"
          >
            <Pause className="w-4 h-4 mr-2" />
            PAUSE
          </Button>
        )}

        {status === 'paused' && (
          <>
            <Button
              onClick={onResume}
              className="flex-1 font-display arcade-button neon-box h-10"
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              RESUME
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              className="px-4 border-destructive text-destructive hover:bg-destructive/10 h-10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </>
        )}

        {status === 'game-over' && (
          <Button
            onClick={onReset}
            variant="outline"
            className="flex-1 font-display h-10 text-base neon-box-primary bg-primary/20 hover:bg-primary/30 text-primary border-primary"
            size="sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            PLAY AGAIN
          </Button>
        )}
      </div>

      {/* Mobile D-Pad Controls - Larger & Centered */}
      <div className="bg-card/50 backdrop-blur-sm rounded-xl p-2 border border-border/50 shadow-xl md:hidden">
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
          <div />
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDirectionChange('UP')}
            disabled={status !== 'playing'}
            className="aspect-square h-16 w-16 rounded-2xl bg-background/50 border-primary/30 active:scale-95 transition-transform active:bg-primary/20"
          >
            <ArrowUp className="w-8 h-8" />
          </Button>
          <div />

          <Button
            variant="outline"
            size="icon"
            onClick={() => onDirectionChange('LEFT')}
            disabled={status !== 'playing'}
            className="aspect-square h-16 w-16 rounded-2xl bg-background/50 border-primary/30 active:scale-95 transition-transform active:bg-primary/20"
          >
            <ArrowLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDirectionChange('DOWN')}
            disabled={status !== 'playing'}
            className="aspect-square h-16 w-16 rounded-2xl bg-background/50 border-primary/30 active:scale-95 transition-transform active:bg-primary/20"
          >
            <ArrowDown className="w-8 h-8" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDirectionChange('RIGHT')}
            disabled={status !== 'playing'}
            className="aspect-square h-16 w-16 rounded-2xl bg-background/50 border-primary/30 active:scale-95 transition-transform active:bg-primary/20"
          >
            <ArrowRight className="w-8 h-8" />
          </Button>
        </div>
      </div>
    </div>
  );
}

