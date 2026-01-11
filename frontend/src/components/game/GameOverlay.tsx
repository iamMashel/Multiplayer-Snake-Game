import React from 'react';
import { Badge } from '@/components/ui/badge';
import { GameMode } from '@/types';
import { cn } from '@/lib/utils';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameOverlayProps {
  score: number;
  mode: GameMode;
  onOpenMenu: () => void;
}

export function GameOverlay({ score, mode, onOpenMenu }: GameOverlayProps) {
  return (
    <div className="w-full px-4 py-2 flex justify-between items-center z-10 bg-background/50 backdrop-blur-sm">
      <div className="flex flex-col gap-2">
        <div className="bg-background/80 backdrop-blur-md rounded-lg px-3 py-1.5 border border-primary/20 shadow-[0_0_15px_rgba(255,255,255,0.05)] neon-box-secondary">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-display">Score</span>
          <span className="text-2xl font-bold font-display text-secondary text-glow-secondary leading-none">
            {score}
          </span>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <Badge
          variant="outline"
          className={cn(
            "bg-background/80 backdrop-blur-md border-primary/30 font-display text-xs h-9",
            mode === 'walls' ? "text-destructive border-destructive/50" : "text-primary"
          )}
        >
          {mode === 'pass-through' ? 'NO WALLS' : 'WALLS'}
        </Badge>

        <Button
          variant="outline"
          size="icon"
          onClick={onOpenMenu}
          className="h-9 w-9 bg-background/80 backdrop-blur-md border-primary/30 hover:bg-primary/20"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
