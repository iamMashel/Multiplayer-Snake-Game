/**
 * Player customization: palettes, board/snake/food options, and the runtime
 * mapping onto the game's HSL CSS variables. Local-first (localStorage).
 *
 * Theming works by overriding the design-token CSS variables (defined in
 * index.css) on the document root, plus data-* attributes for structural
 * variants (board grid, snake skin, food shape) handled in CSS.
 */

export type BoardStyle = 'grid' | 'plain';
export type SnakeSkin = 'solid' | 'gradient' | 'striped' | 'glow';
export type FoodShape = 'classic' | 'heart';
export type TouchControl = 'both' | 'swipe' | 'buttons';

export interface CustomColors {
  snake: string; // hex
  food: string; // hex
  board: string; // hex (used as a dark tint)
  accent: string; // hex
}

export interface Customization {
  paletteId: string; // preset id or 'custom'
  custom: CustomColors;
  boardStyle: BoardStyle;
  snakeSkin: SnakeSkin;
  foodShape: FoodShape;
  foodBlink: boolean;
  haptics: boolean;
  sound: boolean;
  touchControl: TouchControl;
}

/** A curated palette = a set of CSS-variable overrides ("H S% L%" values). */
export interface Palette {
  id: string;
  name: string;
  vars: Record<string, string>;
  /** [snake, food, accent] as full hsl() strings, for the swatch UI. */
  swatch: [string, string, string];
}

export const PALETTES: Palette[] = [
  {
    id: 'neon',
    name: 'Neon Green',
    swatch: ['hsl(142 80% 55%)', 'hsl(0 100% 60%)', 'hsl(280 100% 60%)'],
    vars: {
      '--primary': '142 76% 50%', '--secondary': '185 100% 50%', '--accent': '280 100% 60%',
      '--snake-head': '142 80% 55%', '--snake-body': '142 70% 45%', '--snake-glow': '142 100% 50%',
      '--food': '0 100% 60%', '--food-glow': '0 100% 70%',
      '--grid-line': '222 40% 12%', '--grid-bg': '222 47% 5%', '--background': '222 47% 6%',
    },
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    swatch: ['hsl(315 90% 62%)', 'hsl(50 100% 60%)', 'hsl(265 90% 65%)'],
    vars: {
      '--primary': '315 90% 60%', '--secondary': '190 100% 55%', '--accent': '265 90% 65%',
      '--snake-head': '315 90% 62%', '--snake-body': '315 80% 50%', '--snake-glow': '315 100% 60%',
      '--food': '50 100% 60%', '--food-glow': '50 100% 70%',
      '--grid-line': '265 50% 18%', '--grid-bg': '260 50% 7%', '--background': '260 45% 8%',
    },
  },
  {
    id: 'vapor',
    name: 'Vapor',
    swatch: ['hsl(330 80% 68%)', 'hsl(175 70% 60%)', 'hsl(250 70% 70%)'],
    vars: {
      '--primary': '330 80% 65%', '--secondary': '175 70% 55%', '--accent': '250 70% 70%',
      '--snake-head': '330 80% 68%', '--snake-body': '330 60% 55%', '--snake-glow': '330 90% 65%',
      '--food': '175 70% 60%', '--food-glow': '175 80% 70%',
      '--grid-line': '250 30% 20%', '--grid-bg': '250 30% 9%', '--background': '250 28% 10%',
    },
  },
  {
    id: 'inferno',
    name: 'Inferno',
    swatch: ['hsl(30 95% 58%)', 'hsl(50 100% 60%)', 'hsl(0 90% 60%)'],
    vars: {
      '--primary': '25 95% 55%', '--secondary': '45 100% 55%', '--accent': '0 90% 60%',
      '--snake-head': '30 95% 58%', '--snake-body': '18 90% 48%', '--snake-glow': '25 100% 55%',
      '--food': '50 100% 60%', '--food-glow': '50 100% 70%',
      '--grid-line': '20 40% 14%', '--grid-bg': '15 45% 5%', '--background': '12 40% 6%',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    swatch: ['hsl(185 90% 55%)', 'hsl(45 100% 60%)', 'hsl(160 80% 50%)'],
    vars: {
      '--primary': '190 90% 50%', '--secondary': '210 100% 60%', '--accent': '160 80% 50%',
      '--snake-head': '185 90% 55%', '--snake-body': '200 85% 45%', '--snake-glow': '190 100% 55%',
      '--food': '45 100% 60%', '--food-glow': '45 100% 70%',
      '--grid-line': '205 50% 14%', '--grid-bg': '210 55% 6%', '--background': '210 50% 7%',
    },
  },
  {
    id: 'mono',
    name: 'Mono',
    swatch: ['hsl(0 0% 90%)', 'hsl(142 76% 50%)', 'hsl(142 70% 50%)'],
    vars: {
      '--primary': '0 0% 85%', '--secondary': '0 0% 60%', '--accent': '142 70% 50%',
      '--snake-head': '0 0% 90%', '--snake-body': '0 0% 70%', '--snake-glow': '0 0% 100%',
      '--food': '142 76% 50%', '--food-glow': '142 90% 60%',
      '--grid-line': '0 0% 18%', '--grid-bg': '0 0% 4%', '--background': '0 0% 5%',
    },
  },
];

export const DEFAULT_CUSTOMIZATION: Customization = {
  paletteId: 'neon',
  custom: { snake: '#36d96f', food: '#ff4d4d', board: '#0a0e17', accent: '#b46bff' },
  boardStyle: 'grid',
  snakeSkin: 'glow',
  foodShape: 'heart',
  foodBlink: true,
  haptics: true,
  sound: true,
  touchControl: 'both',
};

const STORAGE_KEY = 'snake_customization_v1';

export function loadCustomization(): Customization {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CUSTOMIZATION };
    return { ...DEFAULT_CUSTOMIZATION, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CUSTOMIZATION };
  }
}

export function saveCustomization(c: Customization): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {
    /* storage full / unavailable — non-fatal */
  }
}

// ---- color helpers ----

/** Convert "#rrggbb" to HSL parts {h, s, l}. */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { h: 0, s: 0, l: 50 };
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const parts = (h: number, s: number, l: number) => `${h} ${clamp(s, 0, 100)}% ${clamp(l, 0, 100)}%`;

/** Build the full CSS-variable map for a fully custom palette from 4 picked colors. */
export function customVars(colors: CustomColors): Record<string, string> {
  const snake = hexToHsl(colors.snake);
  const food = hexToHsl(colors.food);
  const board = hexToHsl(colors.board);
  const accent = hexToHsl(colors.accent);
  return {
    '--primary': parts(snake.h, snake.s, snake.l),
    '--secondary': parts(accent.h, accent.s, clamp(accent.l + 5, 0, 100)),
    '--accent': parts(accent.h, accent.s, accent.l),
    '--snake-head': parts(snake.h, snake.s, snake.l),
    '--snake-body': parts(snake.h, Math.max(snake.s - 10, 0), clamp(snake.l - 12, 0, 100)),
    '--snake-glow': parts(snake.h, 100, snake.l),
    '--food': parts(food.h, food.s, food.l),
    '--food-glow': parts(food.h, 100, clamp(food.l + 10, 0, 100)),
    // Board hue becomes a dark tint so the snake/food stay high-contrast.
    '--grid-line': parts(board.h, Math.min(board.s, 45), 13),
    '--grid-bg': parts(board.h, Math.min(board.s, 50), 5),
    '--background': parts(board.h, Math.min(board.s, 45), 7),
  };
}

/** The CSS variables to apply for the current selection. */
export function resolveVars(c: Customization): Record<string, string> {
  if (c.paletteId === 'custom') return customVars(c.custom);
  const p = PALETTES.find(p => p.id === c.paletteId) ?? PALETTES[0];
  return p.vars;
}
