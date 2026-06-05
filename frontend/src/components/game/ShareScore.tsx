import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { GameMode } from '@/types';
import {
  shareScoreCard,
  copyShareLink,
  getShareUrl,
  type ScoreCardData,
} from '@/lib/shareCard';

const MODE_TITLE: Record<GameMode, string> = {
  'pass-through': 'No Walls',
  walls: 'Walls',
  daily: 'Daily Challenge',
};

interface ShareScoreProps {
  score: number;
  mode: GameMode;
  /** Daily date (YYYY-MM-DD) when this was a daily run. */
  dailyId?: string;
  isNewBest?: boolean;
}

export function ShareScore({ score, mode, dailyId, isNewBest }: ShareScoreProps) {
  const [busy, setBusy] = useState(false);
  const url = getShareUrl();

  const data: ScoreCardData = {
    score,
    title: MODE_TITLE[mode],
    subtitle:
      mode === 'daily' && dailyId
        ? `Daily · ${dailyId}`
        : isNewBest
          ? 'New personal best!'
          : undefined,
    url,
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const result = await shareScoreCard(data);
      toast.success(
        result === 'shared'
          ? 'Shared!'
          : 'Score card saved — share it anywhere!',
      );
    } catch {
      toast.error('Could not create the score card');
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    const ok = await copyShareLink(url);
    if (ok) toast.success('Link copied!');
    else toast.error('Could not copy link');
  };

  return (
    <div className="flex gap-2 justify-center">
      <Button
        size="sm"
        onClick={handleShare}
        disabled={busy}
        className="font-display arcade-button neon-box"
      >
        {busy ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Share2 className="w-4 h-4 mr-2" />
        )}
        Share score
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleCopy}
        className="font-display border-primary/30"
      >
        <Copy className="w-4 h-4 mr-2" />
        Copy link
      </Button>
    </div>
  );
}
