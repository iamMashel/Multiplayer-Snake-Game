import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GameBoard } from './GameBoard';
import type { ActivePlayer, GameState, Direction } from '@/types';
import { spectatorApi } from '@/services/api';
import { Eye, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { moveSnake, changeDirection, GRID_SIZE, generateFood } from '@/lib/gameLogic';

interface SpectatorViewProps {
  className?: string;
}

// Simulates AI playing the game
function useSimulatedGame(initialState: GameState) {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setGameState({ ...initialState, status: 'playing' });
    
    intervalRef.current = window.setInterval(() => {
      setGameState(prev => {
        if (prev.status !== 'playing') return prev;
        
        // Simple AI: Try to move towards food, avoid walls
        const head = prev.snake[0];
        const food = prev.food;
        
        let newDirection = prev.direction;
        
        // Random chance to change direction towards food
        if (Math.random() < 0.3) {
          const dx = food.x - head.x;
          const dy = food.y - head.y;
          
          const possibleDirections: Direction[] = [];
          
          if (dx > 0 && prev.direction !== 'LEFT') possibleDirections.push('RIGHT');
          if (dx < 0 && prev.direction !== 'RIGHT') possibleDirections.push('LEFT');
          if (dy > 0 && prev.direction !== 'UP') possibleDirections.push('DOWN');
          if (dy < 0 && prev.direction !== 'DOWN') possibleDirections.push('UP');
          
          if (possibleDirections.length > 0) {
            newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
          }
        }
        
        let newState = changeDirection(prev, newDirection);
        newState = moveSnake(newState);
        
        // If game over, restart
        if (newState.status === 'game-over') {
          const centerX = Math.floor(GRID_SIZE / 2);
          const centerY = Math.floor(GRID_SIZE / 2);
          const newSnake = [
            { x: centerX, y: centerY },
            { x: centerX + 1, y: centerY },
            { x: centerX + 2, y: centerY },
          ];
          return {
            ...prev,
            snake: newSnake,
            food: generateFood(newSnake),
            direction: 'LEFT',
            score: Math.floor(Math.random() * 200) + 50,
            status: 'playing',
          };
        }
        
        return newState;
      });
    }, 150);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return gameState;
}

function PlayerGameView({ player, onBack }: { player: ActivePlayer; onBack: () => void }) {
  const simulatedState = useSimulatedGame(player.gameState);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h3 className="font-display text-lg">{player.username}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            {player.viewers} watching
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl text-accent text-glow-accent">{simulatedState.score}</p>
          <p className="text-xs text-muted-foreground capitalize">{player.mode}</p>
        </div>
      </div>
      
      <div className="aspect-square max-w-md mx-auto">
        <GameBoard gameState={simulatedState} isSpectator />
      </div>
      
      <p className="text-center text-sm text-muted-foreground">
        Watching an AI demo snake · real multiplayer coming soon
      </p>
    </div>
  );
}

export function SpectatorView({ className }: SpectatorViewProps) {
  const [players, setPlayers] = useState<ActivePlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<ActivePlayer | null>(null);

  const fetchPlayers = useCallback(async () => {
    setIsLoading(true);
    const response = await spectatorApi.getActivePlayers();
    if (response.success && response.data) {
      setPlayers(response.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPlayers();
    
    // Refresh player list every 10 seconds
    const interval = setInterval(fetchPlayers, 10000);
    return () => clearInterval(interval);
  }, [fetchPlayers]);

  const handleWatchPlayer = async (player: ActivePlayer) => {
    const response = await spectatorApi.watchPlayer(player.id);
    if (response.success && response.data) {
      setSelectedPlayer(response.data);
    }
  };

  const handleStopWatching = async () => {
    if (selectedPlayer) {
      await spectatorApi.stopWatching(selectedPlayer.id);
      setSelectedPlayer(null);
    }
  };

  if (selectedPlayer) {
    return (
      <div className={cn("bg-card rounded-lg border border-border p-4", className)}>
        <PlayerGameView player={selectedPlayer} onBack={handleStopWatching} />
      </div>
    );
  }

  return (
    <div className={cn("bg-card rounded-lg border border-border overflow-hidden", className)}>
      <div className="p-4 border-b border-border">
        <h2 className="font-display text-xl text-accent text-glow-accent flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Demo Arena
          <span className="ml-1 text-[10px] font-display uppercase tracking-widest px-2 py-0.5 rounded border border-accent/40 text-accent">
            AI Demo
          </span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Watch {players.length} AI-controlled snakes · real-time multiplayer is coming soon
        </p>
      </div>

      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : players.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Eye className="w-8 h-8 mb-2 opacity-50" />
            <p>No active games right now</p>
            <p className="text-xs">Check back soon!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => handleWatchPlayer(player)}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-accent" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{player.username}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {player.mode} mode
                  </p>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <p className="font-display text-lg text-accent">{player.score}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                    <Users className="w-3 h-3" />
                    {player.viewers}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
