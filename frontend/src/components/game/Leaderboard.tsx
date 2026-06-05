import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LeaderboardEntry, GameMode } from '@/types';
import { leaderboardApi } from '@/services/api';
import { Trophy, Medal, Award, Loader2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDailyId } from '@/lib/gameLogic';

interface LeaderboardProps {
  className?: string;
}

export function Leaderboard({ className }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedMode, setSelectedMode] = useState<GameMode | 'all'>('all');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setHasError(false);
      // The "daily" filter shows only today's daily-challenge board.
      const mode = selectedMode === 'all' ? undefined : selectedMode;
      const challengeId = selectedMode === 'daily' ? getDailyId() : undefined;
      const response = await leaderboardApi.getLeaderboard(mode, challengeId);
      if (response.success && response.data) {
        setEntries(response.data);
      } else {
        setHasError(true);
      }
      setIsLoading(false);
    };

    fetchLeaderboard();
  }, [selectedMode, reloadKey]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-700" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-muted-foreground font-display text-sm">{rank}</span>;
    }
  };

  return (
    <div className={cn("bg-card rounded-lg border border-border overflow-hidden", className)}>
      <div className="p-4 border-b border-border">
        <h2 className="font-display text-xl text-primary text-glow-primary flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Leaderboard
        </h2>
        
        {/* Mode Filter */}
        <div className="flex flex-wrap gap-2 mt-3">
          {(['all', 'pass-through', 'walls', 'daily'] as const).map((mode) => (
            <Button
              key={mode}
              variant={selectedMode === mode ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedMode(mode)}
              className="text-xs capitalize"
            >
              {mode === 'all' ? 'All' : mode === 'daily' ? "Today's Daily" : mode}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-center px-4">
            <p className="text-muted-foreground">Couldn't load the leaderboard.</p>
            <p className="text-xs text-muted-foreground">The server may be waking up. Give it a moment.</p>
            <Button variant="outline" size="sm" onClick={() => setReloadKey(k => k + 1)} className="border-primary/30">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try again
            </Button>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No scores yet. Be the first.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry, index) => (
              <div 
                key={entry.id}
                className={cn(
                  "flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors",
                  index === 0 && "bg-yellow-500/5",
                  index === 1 && "bg-gray-400/5",
                  index === 2 && "bg-amber-700/5"
                )}
              >
                <div className="flex-shrink-0">
                  {getRankIcon(entry.rank)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{entry.username}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {entry.mode} • {new Date(entry.playedAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <p className="font-display text-lg text-secondary">{entry.score.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
