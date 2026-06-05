# DESIGN.md

The visual system for Snake — Neon Arcade, and the architecture for player customization.

## Identity
Retro-neon arcade on near-black. Glow is the signature material (text-shadow / box-shadow
halos), with scanlines and a subtle grid evoking a CRT. Loud but controlled: one bright
primary, a cool secondary, a special accent — never a rainbow by default.

## Tokens (HSL CSS variables, defined in `frontend/src/index.css`)
Core: `--background 222 47% 6%`, `--foreground 180 100% 95%`, `--card`, `--muted`, `--border`.
Roles: `--primary 142 76% 50%` (neon green), `--secondary 185 100% 50%` (cyan),
`--accent 280 100% 60%` (purple), `--destructive 0 85% 60%`.
Game assets (the customizable surface):
`--snake-head`, `--snake-body`, `--snake-glow`, `--food`, `--food-glow`,
`--grid-line`, `--grid-bg`. Glow helpers: `--glow-primary/secondary/accent/danger`.

**Theming rule:** customization overrides these CSS variables at runtime on a root element.
Components read the variables; they never hardcode colors. Structural variants (grid on/off,
heart vs dot, snake skin) are driven by `data-*` attributes on the board container + CSS.

## Type
Display: Orbitron (headings, score, arcade labels). Body/UI: Inter. Mono: Share Tech Mono
(URLs, code-ish). Cap at these three. Uppercase only for short arcade labels/badges.

## Motion
Eat/turn/crash feedback, food pulse, death shake, fade-ins. 150–250ms, ease-out. Every
animation needs a `prefers-reduced-motion` fallback (crossfade/instant). Food blink and skin
shimmer must also respect it.

## Customization architecture (this milestone)
- **Store:** `useCustomization` hook + Context, persisted to `localStorage` (key
  `snake_customization_v1`). Shape:
  - `paletteId`: preset id, or `'custom'`
  - `colors`: `{ snake, food, board, accent }` (HSL strings) — used when custom or as overrides
  - `boardStyle`: `'grid' | 'plain'` (grid lines vs none)
  - `snakeSkin`: `'solid' | 'gradient' | 'striped' | 'glow'`
  - `foodShape`: `'classic' | 'heart'` ; `foodBlink`: boolean
  - `haptics`: boolean ; `sound`: boolean (mirrors existing mute)
- **Presets:** curated palettes (Neon Green default, Synthwave, Vapor, Inferno, Ocean, Mono).
  Each sets snake/food/board/accent. One tap to apply; custom colors live one level deeper.
- **Apply:** a `useEffect` writes the CSS variables + `data-board`, `data-skin`, `data-food`
  attributes onto the game root. No save button — changes are instant + persisted.
- **Panel UX (patterns):** a Drawer on mobile / Dialog on desktop with **Tabs**
  (Palette · Board · Snake · Food · Feel). Segmented controls for board/food/skin, swatch grid
  for palettes, color pickers for custom, toggles for haptics/sound/blink, **live preview**
  of the board, and a **Reset to default**. Toast on reset only; everything else is live.
- **Haptics:** `navigator.vibrate` on eat/crash, gated by the `haptics` flag and capability
  detection. Never on desktop.

## Component vocabulary
shadcn/ui throughout (Dialog, Drawer, Tabs, Switch, Slider, RadioGroup, Button, Badge, Sonner
toasts). Same button shape and control vocabulary everywhere. States: default/hover/focus/
active/disabled present on every control.
