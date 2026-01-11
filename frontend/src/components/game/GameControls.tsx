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
    <div className="space-y-4">
      {/* Game Action Buttons */}
      <div className="space-y-2">
        {status === 'idle' && (
          <Button
            onClick={onStart}
            className="w-full font-display arcade-button neon-box h-12 text-lg"
            size="lg"
          >
            <Play className="w-5 h-5 mr-2" />
            START
          </Button>
        )}

        {status === 'playing' && (
          <Button
            onClick={onPause}
            variant="secondary"
            className="w-full font-display arcade-button neon-box-secondary h-12 text-lg"
            size="lg"
          >
            <Pause className="w-5 h-5 mr-2" />
            PAUSE
          </Button>
        )}

        {status === 'paused' && (
          <div className="flex gap-2">
            <Button
              onClick={onResume}
              className="flex-1 font-display arcade-button neon-box h-12"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              RESUME
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              className="px-4 border-destructive text-destructive hover:bg-destructive/10 h-12"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        )}

        {status === 'game-over' && (
          <Button
            onClick={onReset}
            variant="outline"
            className="w-full font-display h-12 text-lg neon-box-primary bg-primary/20 hover:bg-primary/30 text-primary border-primary"
            size="lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            PLAY AGAIN
          </Button>
        )}
      </div>

      {/* Mobile D-Pad Controls */}
      <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 shadow-xl md:hidden">
        <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
          <div />
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDirectionChange('UP')}
            disabled={status !== 'playing'}
            className="aspect-square h-14 w-14 rounded-full bg-background/50 border-primary/30 active:scale-95 transition-transform"
          >
            <ArrowUp className="w-6 h-6" />
          </Button>
          <div />

          <Button
            variant="outline"
            size="icon"
            onClick={() => onDirectionChange('LEFT')}
            disabled={status !== 'playing'}
            className="aspect-square h-14 w-14 rounded-full bg-background/50 border-primary/30 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div />
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDirectionChange('RIGHT')}
            disabled={status !== 'playing'}
            className="aspect-square h-14 w-14 rounded-full bg-background/50 border-primary/30 active:scale-95 transition-transform"
          >
            <ArrowRight className="w-6 h-6" />
          </Button>

          <div />
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDirectionChange('DOWN')}
            disabled={status !== 'playing'}
            className="aspect-square h-14 w-14 rounded-full bg-background/50 border-primary/30 active:scale-95 transition-transform"
          >
            <ArrowDown className="w-6 h-6" />
          </Button>
          <div />
        </div>
      </div>
    </div>
  );
}

