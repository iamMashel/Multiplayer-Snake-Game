/**
 * Light haptic feedback on capable devices (mobile). The Vibration API is a
 * no-op on desktop, so callers only need to gate on the user's haptics setting.
 */
function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

function vibrate(pattern: number | number[]): void {
  if (canVibrate()) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* some browsers throw if called outside a user gesture — ignore */
    }
  }
}

export const haptics = {
  eat(): void {
    vibrate(12);
  },
  turn(): void {
    vibrate(6);
  },
  crash(): void {
    vibrate([35, 30, 55]);
  },
};
