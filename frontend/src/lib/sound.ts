/**
 * Lightweight retro sound effects synthesized with the Web Audio API.
 * No audio asset files needed — everything is generated at runtime.
 *
 * The AudioContext is created lazily on the first user gesture (browsers block
 * audio until then). A mute preference is persisted in localStorage.
 */

let ctx: AudioContext | null = null;
const MUTE_KEY = 'snake_muted';

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // Resume if the browser auto-suspended it (e.g. before first gesture).
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => { /* ignore */ });
  }
  return ctx;
}

/** Call from a user gesture (e.g. Start button) to unlock audio. */
export function unlockAudio(): void {
  getCtx();
}

export function isMuted(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(MUTE_KEY) === '1';
}

export function setMuted(muted: boolean): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
}

/** Play a single tone. `when` is an offset (seconds) for sequencing notes. */
function tone(
  freq: number,
  durationMs: number,
  type: OscillatorType = 'square',
  gain = 0.06,
  when = 0,
): void {
  const c = getCtx();
  if (!c || isMuted()) return;

  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;

  const t0 = c.currentTime + when;
  const dur = durationMs / 1000;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  eat(): void {
    tone(660, 90, 'square', 0.05);
    tone(880, 90, 'square', 0.04, 0.04);
  },
  turn(): void {
    tone(300, 35, 'sine', 0.015);
  },
  start(): void {
    tone(523, 90, 'square', 0.05);
    tone(659, 90, 'square', 0.05, 0.09);
    tone(784, 150, 'square', 0.05, 0.18);
  },
  gameOver(): void {
    tone(400, 180, 'sawtooth', 0.05);
    tone(300, 200, 'sawtooth', 0.05, 0.16);
    tone(180, 340, 'sawtooth', 0.05, 0.34);
  },
  best(): void {
    tone(784, 100, 'square', 0.05);
    tone(988, 100, 'square', 0.05, 0.1);
    tone(1319, 240, 'square', 0.05, 0.2);
  },
};
