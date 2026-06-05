import React from 'react';
import { Badge } from '@/components/ui/badge';
import { GameMode } from '@/types';
import { cn } from '@/lib/utils';
import { Settings2, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { unlockAudio } from '@/lib/sound';
import { useCustomization } from '@/contexts/CustomizationContext';

interface GameOverlayProps {
  score: number;
  best?: number;
  mode: GameMode;
  onOpenMenu: () => void;
}

export function GameOverlay({ score, best = 0, mode, onOpenMenu }: GameOverlayProps) {
  const { customization, update } = useCustomization();
  const muted = !customization.sound;

  const toggleMute = () => {
    const nextSound = !customization.sound;
    update({ sound: nextSound });
    if (nextSound) unlockAudio(); // unmuting counts as a gesture — prime the audio context
  };

  return (
    <div className="w-full px-4 py-2 flex justify-between items-center z-10 bg-background/60">
      <div className="flex items-center gap-2">
        <div className="bg-background/90 rounded-lg px-3 py-1.5 border border-primary/20 neon-box-secondary">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-display">Score</span>
          <span className="text-2xl font-bold font-display text-secondary text-glow-secondary leading-none">
            {score}
          </span>
        </div>

        <div className="bg-background/90 rounded-lg px-3 py-1.5 border border-primary/20">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-display">Best</span>
          <span className="text-2xl font-bold font-display text-primary text-glow-primary leading-none">
            {best}
          </span>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <Badge
          variant="outline"
          className={cn(
            "bg-background/90 border-primary/30 font-display text-xs h-9",
            mode === 'walls' && "text-destructive border-destructive/50",
            mode === 'daily' && "text-accent border-accent/50",
            mode === 'pass-through' && "text-primary"
          )}
        >
          {mode === 'walls' ? 'WALLS' : mode === 'daily' ? 'DAILY' : 'NO WALLS'}
        </Badge>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="h-11 w-11 sm:h-9 sm:w-9 bg-background/90 border-primary/30 hover:bg-primary/20"
        >
          {muted ? <VolumeX className="h-5 w-5 sm:h-4 sm:w-4" /> : <Volume2 className="h-5 w-5 sm:h-4 sm:w-4" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="h-11 w-11 sm:h-9 sm:w-9 bg-background/90 border-primary/30 hover:bg-primary/20"
        >
          <Settings2 className="h-5 w-5 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
}
