import { useRef, useCallback } from 'react';
import type { Direction } from '@/types';

const THRESHOLD = 24; // px before a drag counts as a swipe

/**
 * Touch handlers that turn swipes into direction changes. Fires mid-drag once
 * the threshold is crossed and re-anchors, so a single fluid drag can chain
 * multiple turns. No-op on devices without touch.
 */
export function useSwipe(onSwipe: (dir: Direction) => void) {
  const origin = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    origin.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!origin.current) return;
    const t = e.touches[0];
    const dx = t.clientX - origin.current.x;
    const dy = t.clientY - origin.current.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < THRESHOLD) return;

    const dir: Direction =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0 ? 'RIGHT' : 'LEFT'
        : dy > 0 ? 'DOWN' : 'UP';
    onSwipe(dir);
    origin.current = { x: t.clientX, y: t.clientY };
  }, [onSwipe]);

  const onTouchEnd = useCallback(() => {
    origin.current = null;
  }, []);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
