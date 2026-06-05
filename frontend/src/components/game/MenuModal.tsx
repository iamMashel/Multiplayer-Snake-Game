import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { GameMode } from '@/types';
import { cn } from '@/lib/utils';
import { Keyboard, MousePointer2, CalendarDays } from 'lucide-react';

interface MenuModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  gameStatus: string;
}

export function MenuModal({
  open,
  onOpenChange,
  currentMode,
  onModeChange,
  gameStatus
}: MenuModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-display text-primary text-glow-primary">Game Settings</DialogTitle>
          <DialogDescription>
            Configure your game experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <h4 className="font-display text-sm text-foreground">Game Mode</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={currentMode === 'pass-through' ? 'default' : 'outline'}
                onClick={() => onModeChange('pass-through')}
                className={cn("h-auto py-3 flex flex-col items-center gap-1", currentMode === 'pass-through' && "neon-box")}
              >
                <div className="font-bold">Pass Through</div>
                <div className="text-[10px] opacity-70 font-normal">Safe Edges</div>
              </Button>
              <Button
                variant={currentMode === 'walls' ? 'default' : 'outline'}
                onClick={() => onModeChange('walls')}
                className={cn("h-auto py-3 flex flex-col items-center gap-1", currentMode === 'walls' && "neon-box")}
              >
                <div className="font-bold">Walls</div>
                <div className="text-[10px] opacity-70 font-normal">Dangerous Edges (1.5x)</div>
              </Button>
            </div>

            <Button
              variant={currentMode === 'daily' ? 'default' : 'outline'}
              onClick={() => onModeChange('daily')}
              className={cn(
                "w-full h-auto py-3 flex items-center justify-center gap-2",
                currentMode === 'daily' && "neon-box"
              )}
            >
              <CalendarDays className="w-4 h-4" />
              <div className="text-left">
                <div className="font-bold">Daily Challenge</div>
                <div className="text-[10px] opacity-70 font-normal">Same board for everyone today · compete on the daily board</div>
              </div>
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="font-display text-sm text-foreground flex items-center gap-2">
              <Keyboard className="w-4 h-4" /> Controls
            </h4>
            <div className="bg-background/50 rounded-lg p-3 text-sm space-y-2 text-muted-foreground border border-border">
              <div className="flex justify-between">
                <span>Move</span>
                <span className="text-foreground font-mono">WASD / Arrows</span>
              </div>
              <div className="flex justify-between">
                <span>Pause</span>
                <span className="text-foreground font-mono">Space</span>
              </div>
              <div className="flex justify-between">
                <span>Restart</span>
                <span className="text-foreground font-mono">R</span>
              </div>
            </div>

            <div className="md:hidden flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <MousePointer2 className="w-3 h-3" />
              <span>Use on-screen controls or swipe</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
