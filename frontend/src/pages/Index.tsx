import React, { useState } from 'react';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { GameBoard } from '@/components/game/GameBoard';
import { GameControls } from '@/components/game/GameControls';
import { Leaderboard } from '@/components/game/Leaderboard';
import { SpectatorView } from '@/components/game/SpectatorView';
import { GameOverlay } from '@/components/game/GameOverlay';
import { MenuModal } from '@/components/game/MenuModal';
import { CustomizePanel } from '@/components/game/CustomizePanel';
import { AuthModal } from '@/components/auth/AuthModal';
import { useSnakeGame } from '@/hooks/useSnakeGame';

function GamePage() {
  const [activeTab, setActiveTab] = useState<string>('play');
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const { isAuthenticated } = useAuthContext();
  const game = useSnakeGame('pass-through');

  // Pause game when any overlay is open
  React.useEffect(() => {
    if (menuOpen || authOpen || customizeOpen) {
      game.pauseGame();
    }
  }, [menuOpen, authOpen, customizeOpen]);

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden relative touch-none">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAuthRequest={() => setAuthOpen(true)}
        onCustomize={() => setCustomizeOpen(true)}
      />

      <main className="flex-1 flex flex-col min-h-0 container mx-auto px-2 pb-safe justify-center items-center">
        {activeTab === 'play' && (
          <div className="w-full max-w-[500px] flex flex-col items-center gap-0 max-h-full justify-center">

            {/* Game Controls & Info Header */}
            <div className="w-full shrink-0 z-10">
              <GameOverlay
                score={game.finalScore}
                best={game.personalBest}
                mode={game.gameState.mode}
                onOpenMenu={() => setMenuOpen(true)}
              />
            </div>

            {/* Game Area Container - Hugs content */}
            <div className="w-full aspect-square shrink shadow-2xl rounded-xl overflow-hidden border border-primary/20 bg-card/10 backdrop-blur-sm relative min-h-0">
              <GameBoard
                gameState={game.gameState}
                finalScore={game.finalScore}
                isNewBest={game.isNewBest}
                isGuest={!isAuthenticated}
                onRequestAuth={() => setAuthOpen(true)}
              />
            </div>

            {/* Controls Area */}
            <div className="w-full shrink-0 relative z-10 pt-2 pb-2">
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

      <CustomizePanel open={customizeOpen} onOpenChange={setCustomizeOpen} />

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
