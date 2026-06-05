import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Check, RotateCcw, Smartphone } from 'lucide-react';
import { useCustomization } from '@/contexts/CustomizationContext';
import {
  PALETTES,
  type BoardStyle,
  type SnakeSkin,
  type FoodShape,
  type TouchControl,
  type CustomColors,
} from '@/lib/customization';

interface CustomizePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Reusable segmented control. */
function Segmented<T extends string>({
  value, options, onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-flow-col auto-cols-fr gap-1 p-1 rounded-lg bg-muted/40 border border-border">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            'px-3 py-2 rounded-md text-sm font-display transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            value === opt.value
              ? 'bg-primary text-primary-foreground neon-box'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** Live mini board that reflects the current theme (data-* are on <html>). */
function MiniPreview() {
  const N = 7;
  const body = new Set(['1,3', '2,3', '3,3']);
  const head = '4,3';
  const food = '5,2';
  const cells = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const key = `${x},${y}`;
      cells.push(
        <div key={key} className="aspect-square bg-grid-bg">
          {key === head || body.has(key) ? (
            <div className="w-full h-full rounded-sm snake-segment scale-90" />
          ) : key === food ? (
            <div className="food-cell">
              <span className="food-dot food-item w-[60%] h-[60%] rounded-full" />
              <svg className="food-heart" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          ) : null}
        </div>,
      );
    }
  }
  return (
    <div className="rounded-lg overflow-hidden neon-box">
      <div
        className="game-grid bg-grid-line p-1"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${N}, 1fr)`, gap: '1px' }}
      >
        {cells}
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm text-foreground">{label}</span>
      <span className="relative inline-flex items-center justify-center w-10 h-10 rounded-md border border-border overflow-hidden">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="absolute inset-[-25%] w-[150%] h-[150%] cursor-pointer border-0 bg-transparent p-0"
          aria-label={label}
        />
      </span>
    </label>
  );
}

export function CustomizePanel({ open, onOpenChange }: CustomizePanelProps) {
  const { customization: c, update, reset } = useCustomization();

  const setCustomColor = (key: keyof CustomColors, hex: string) =>
    update({ paletteId: 'custom', custom: { ...c.custom, [key]: hex } });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-primary/20 max-w-md max-h-[88dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-primary text-glow-primary">Make it yours</DialogTitle>
          <DialogDescription>Theme the snake, food, board, and feel. Changes save instantly.</DialogDescription>
        </DialogHeader>

        <div className="px-1 pb-2">
          <MiniPreview />
        </div>

        <Tabs defaultValue="palette" className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="palette" className="text-xs">Palette</TabsTrigger>
            <TabsTrigger value="board" className="text-xs">Board</TabsTrigger>
            <TabsTrigger value="snake" className="text-xs">Snake</TabsTrigger>
            <TabsTrigger value="food" className="text-xs">Food</TabsTrigger>
            <TabsTrigger value="feel" className="text-xs">Feel</TabsTrigger>
          </TabsList>

          {/* Palette */}
          <TabsContent value="palette" className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-2">
              {PALETTES.map(p => (
                <button
                  key={p.id}
                  onClick={() => update({ paletteId: p.id })}
                  className={cn(
                    'relative flex items-center gap-2 p-2.5 rounded-lg border text-left transition-colors',
                    c.paletteId === p.id ? 'border-primary neon-box' : 'border-border hover:border-primary/40',
                  )}
                >
                  <span className="flex -space-x-1.5">
                    {p.swatch.map((s, i) => (
                      <span key={i} className="w-5 h-5 rounded-full border border-background" style={{ background: s }} />
                    ))}
                  </span>
                  <span className="text-sm font-display">{p.name}</span>
                  {c.paletteId === p.id && <Check className="w-4 h-4 text-primary ml-auto" />}
                </button>
              ))}
            </div>

            <div className={cn(
              'rounded-lg border p-3 transition-colors',
              c.paletteId === 'custom' ? 'border-primary neon-box' : 'border-border',
            )}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-display">Custom colors</span>
                {c.paletteId === 'custom' && <Check className="w-4 h-4 text-primary" />}
              </div>
              <div className="mt-1 divide-y divide-border/60">
                <ColorField label="Snake" value={c.custom.snake} onChange={v => setCustomColor('snake', v)} />
                <ColorField label="Food" value={c.custom.food} onChange={v => setCustomColor('food', v)} />
                <ColorField label="Board" value={c.custom.board} onChange={v => setCustomColor('board', v)} />
                <ColorField label="Accent" value={c.custom.accent} onChange={v => setCustomColor('accent', v)} />
              </div>
            </div>
          </TabsContent>

          {/* Board */}
          <TabsContent value="board" className="space-y-2 pt-3">
            <Label className="text-xs text-muted-foreground">Board style</Label>
            <Segmented<BoardStyle>
              value={c.boardStyle}
              onChange={v => update({ boardStyle: v })}
              options={[{ value: 'grid', label: 'Grid' }, { value: 'plain', label: 'No grid' }]}
            />
          </TabsContent>

          {/* Snake */}
          <TabsContent value="snake" className="space-y-2 pt-3">
            <Label className="text-xs text-muted-foreground">Snake skin</Label>
            <Segmented<SnakeSkin>
              value={c.snakeSkin}
              onChange={v => update({ snakeSkin: v })}
              options={[
                { value: 'glow', label: 'Glow' },
                { value: 'gradient', label: 'Gradient' },
                { value: 'striped', label: 'Striped' },
                { value: 'solid', label: 'Solid' },
              ]}
            />
          </TabsContent>

          {/* Food */}
          <TabsContent value="food" className="space-y-4 pt-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Food shape</Label>
              <Segmented<FoodShape>
                value={c.foodShape}
                onChange={v => update({ foodShape: v })}
                options={[{ value: 'heart', label: 'Heart' }, { value: 'classic', label: 'Classic' }]}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="blink" className="text-sm">Blink</Label>
              <Switch id="blink" checked={c.foodBlink} onCheckedChange={v => update({ foodBlink: v })} />
            </div>
          </TabsContent>

          {/* Feel */}
          <TabsContent value="feel" className="space-y-4 pt-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Touch controls (mobile)</Label>
              <Segmented<TouchControl>
                value={c.touchControl}
                onChange={v => update({ touchControl: v })}
                options={[
                  { value: 'both', label: 'Both' },
                  { value: 'swipe', label: 'Swipe' },
                  { value: 'buttons', label: 'Buttons' },
                ]}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="haptics" className="text-sm flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" /> Haptics
                </Label>
                <p className="text-[11px] text-muted-foreground">Vibrate on eat and crash (mobile only)</p>
              </div>
              <Switch id="haptics" checked={c.haptics} onCheckedChange={v => update({ haptics: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound" className="text-sm">Sound</Label>
              <Switch id="sound" checked={c.sound} onCheckedChange={v => update({ sound: v })} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { reset(); toast.success('Reset to default theme'); }}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to default
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
