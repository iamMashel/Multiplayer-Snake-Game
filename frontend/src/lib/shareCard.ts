/**
 * Shareable score cards.
 *
 * Renders a neon "I scored N" image on a canvas (no server needed) and shares it
 * via the Web Share API where available, falling back to a PNG download. Also
 * provides a copy-link helper. Used on the game-over screen for organic growth.
 */

export interface ScoreCardData {
  score: number;
  /** Big label above the score, e.g. "Daily Challenge" / "No Walls" / "Walls". */
  title: string;
  /** Optional small line under the score, e.g. "Daily · 2026-06-05". */
  subtitle?: string;
  /** Link to put on the card and in the share sheet. */
  url: string;
}

/** URL to share — current origin + path (works on localhost and once deployed). */
export function getShareUrl(): string {
  if (typeof window === 'undefined') return '';
  return (window.location.origin + window.location.pathname).replace(/\/$/, '');
}

async function ensureFonts(): Promise<void> {
  try {
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.load) {
      await Promise.all([
        fonts.load("900 190px Orbitron"),
        fonts.load("700 64px Orbitron"),
        fonts.load("500 34px Orbitron"),
      ]);
      await fonts.ready;
    }
  } catch {
    /* fallback fonts are fine */
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draw the score card and return it as a PNG blob. */
export async function generateScoreCard(data: ScoreCardData): Promise<Blob> {
  await ensureFonts();

  const W = 1200;
  const H = 630;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // Background
  ctx.fillStyle = '#0a0e17';
  ctx.fillRect(0, 0, W, H);

  // Soft radial glow
  const glow = ctx.createRadialGradient(W / 2, H / 2 - 40, 80, W / 2, H / 2, W / 1.05);
  glow.addColorStop(0, 'rgba(34, 197, 94, 0.12)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Faint grid
  ctx.strokeStyle = 'rgba(120, 180, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Neon border
  ctx.strokeStyle = 'hsl(142, 76%, 50%)';
  ctx.lineWidth = 4;
  ctx.shadowColor = 'hsl(142, 100%, 50%)';
  ctx.shadowBlur = 22;
  roundRect(ctx, 24, 24, W - 48, H - 48, 26);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.textAlign = 'center';

  // Wordmark + tiny snake
  ctx.font = "700 60px Orbitron, 'Arial Black', sans-serif";
  ctx.fillStyle = 'hsl(142, 76%, 56%)';
  ctx.shadowColor = 'hsl(142, 100%, 50%)';
  ctx.shadowBlur = 18;
  ctx.fillText('SNAKE', W / 2, 150);
  ctx.shadowBlur = 0;

  // Mode / title
  ctx.font = "500 32px Orbitron, sans-serif";
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillText(data.title.toUpperCase(), W / 2, 212);

  // Big score
  ctx.font = "900 190px Orbitron, 'Arial Black', sans-serif";
  ctx.fillStyle = 'hsl(185, 100%, 56%)';
  ctx.shadowColor = 'hsl(185, 100%, 50%)';
  ctx.shadowBlur = 30;
  ctx.fillText(String(data.score), W / 2, 400);
  ctx.shadowBlur = 0;

  // Subtitle
  if (data.subtitle) {
    ctx.font = "500 30px Orbitron, sans-serif";
    ctx.fillStyle = 'hsl(280, 100%, 72%)';
    ctx.fillText(data.subtitle, W / 2, 458);
  }

  // CTA
  ctx.font = "700 38px Orbitron, sans-serif";
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fillText('Can you beat me?', W / 2, 532);

  ctx.font = "400 26px 'Share Tech Mono', monospace";
  ctx.fillStyle = 'hsl(142, 76%, 56%)';
  ctx.fillText(data.url.replace(/^https?:\/\//, ''), W / 2, 576);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Failed to render image'))),
      'image/png',
    );
  });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type ShareResult = 'shared' | 'downloaded';

interface ShareNavigator extends Navigator {
  canShare?: (data?: ShareData) => boolean;
}

/** Share the score card (native share sheet) or fall back to downloading it. */
export async function shareScoreCard(data: ScoreCardData): Promise<ShareResult> {
  const blob = await generateScoreCard(data);
  const file = new File([blob], 'snake-score.png', { type: 'image/png' });
  const text = `I scored ${data.score} on Snake${data.subtitle ? ` (${data.subtitle})` : ''} — can you beat me?`;

  const nav = navigator as ShareNavigator;
  if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: 'Snake', text, url: data.url });
      return 'shared';
    } catch (err) {
      // User dismissed the share sheet — treat as a no-op, don't also download.
      if (err instanceof DOMException && err.name === 'AbortError') return 'shared';
    }
  }

  downloadBlob(blob, 'snake-score.png');
  return 'downloaded';
}

/** Copy the share link to the clipboard. Returns whether it succeeded. */
export async function copyShareLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
