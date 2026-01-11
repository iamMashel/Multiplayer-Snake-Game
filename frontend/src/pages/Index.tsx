import React, { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { GameBoard } from '@/components/game/GameBoard';
import { GameControls } from '@/components/game/GameControls';
import { Leaderboard } from '@/components/game/Leaderboard';
import { SpectatorView } from '@/components/game/SpectatorView';
import { GameOverlay } from '@/components/game/GameOverlay';
import { MenuModal } from '@/components/game/MenuModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { useSnakeGame } from '@/hooks/useSnakeGame';

function GamePage() {
  const [activeTab, setActiveTab] = useState<string>('play');
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const game = useSnakeGame('pass-through');

  // Pause game when modals are open
  React.useEffect(() => {
    if (menuOpen || authOpen) {
      game.pauseGame();
    }
  }, [menuOpen, authOpen]);

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden relative touch-none">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAuthRequest={() => setAuthOpen(true)}
      />

      <main className="flex-1 flex flex-col min-h-0 container mx-auto px-2 pb-safe">
        {activeTab === 'play' && (
          <div className="h-full flex flex-col items-center pt-2 gap-2">

            {/* Game Controls & Info Header */}
            <div className="w-full max-w-[500px] relative z-10 shrink-0">
              <GameOverlay
                score={game.finalScore}
                mode={game.gameState.mode}
                onOpenMenu={() => setMenuOpen(true)}
              />
            </div>

            {/* Game Area Container - Dynamic Fitting */}
            <div className="flex-1 min-h-0 w-full flex items-center justify-center py-2">
              <div className="aspect-square h-full max-h-full max-w-full shadow-2xl rounded-xl overflow-hidden border border-primary/20 bg-card/10 backdrop-blur-sm relative">
                <GameBoard gameState={game.gameState} finalScore={game.finalScore} />
              </div>
            </div>

            {/* Controls Area */}
            <div className="w-full max-w-[400px] shrink-0 relative z-10 pb-2">
              <GameControls
                gameState={game.gameState}
                onStart={game.startGame}
                onPause={game.pauseGame}
                onResume={game.resumeGame}
                onReset={game.resetGame}
                onDirectionChange={game.handleDirectionChange}
              />
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="max-w-2xl mx-auto w-full h-full overflow-y-auto pr-2 py-4">
            <Leaderboard />
          </div>
        )}

        {activeTab === 'spectate' && (
          <div className="max-w-2xl mx-auto w-full h-full overflow-y-auto pr-2 py-4">
            <SpectatorView />
          </div>
        )}
      </main>

      <MenuModal
        open={menuOpen}
        onOpenChange={setMenuOpen}
        currentMode={game.gameState.mode}
        onModeChange={(mode) => {
          game.setMode(mode);
          setMenuOpen(false);
        }}
        gameStatus={game.gameState.status}
      />

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}

const Index = () => {
  return (
    <AuthProvider>
      <GamePage />
    </AuthProvider>
  );
};

export default Index;
