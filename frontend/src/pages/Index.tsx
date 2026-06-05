import React, { useState, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { GameBoard } from '@/components/game/GameBoard';
import { GameControls } from '@/components/game/GameControls';
import { GameOverlay } from '@/components/game/GameOverlay';
import { useSnakeGame } from '@/hooks/useSnakeGame';
import { useSwipe } from '@/hooks/useSwipe';

// Split out the surfaces that aren't on the critical play path.
const Leaderboard = lazy(() => import('@/components/game/Leaderboard').then(m => ({ default: m.Leaderboard })));
const SpectatorView = lazy(() => import('@/components/game/SpectatorView').then(m => ({ default: m.SpectatorView })));
const MenuModal = lazy(() => import('@/components/game/MenuModal').then(m => ({ default: m.MenuModal })));
const CustomizePanel = lazy(() => import('@/components/game/CustomizePanel').then(m => ({ default: m.CustomizePanel })));
const AuthModal = lazy(() => import('@/components/auth/AuthModal').then(m => ({ default: m.AuthModal })));

function TabFallback() {
  return (
    <div className="flex items-center justify-center h-32">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
}

function GamePage() {
  const [activeTab, setActiveTab] = useState<string>('play');
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const { isAuthenticated } = useAuthContext();
  const game = useSnakeGame('pass-through');
  const swipe = useSwipe(game.handleDirectionChange);

  // Pause game when any overlay is open OR the player leaves the Play tab
  // (the loop lives in the hook, so it would otherwise keep running unseen).
  React.useEffect(() => {
    if (menuOpen || authOpen || customizeOpen || activeTab !== 'play') {
      game.pauseGame();
    }
  }, [menuOpen, authOpen, customizeOpen, activeTab]);

  const liveMessage =
    game.gameState.status === 'game-over'
      ? `Game over. Final score ${game.finalScore}.`
      : game.gameState.status === 'playing'
        ? `Score ${game.finalScore}`
        : '';

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden relative touch-none">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAuthRequest={() => setAuthOpen(true)}
        onCustomize={() => setCustomizeOpen(true)}
      />

      {/* Screen-reader announcer for score + game over */}
      <div className="sr-only" role="status" aria-live="polite">{liveMessage}</div>

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
            <div
              className="w-full aspect-square shrink shadow-2xl rounded-xl overflow-hidden border border-primary/20 bg-card/10 relative min-h-0 touch-none"
              role="application"
              aria-label="Snake game board. Use arrow keys or WASD, or swipe on touch, to steer."
              {...swipe}
            >
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
            <Suspense fallback={<TabFallback />}>
              <Leaderboard />
            </Suspense>
          </div>
        )}

        {activeTab === 'spectate' && (
          <div className="max-w-2xl mx-auto w-full h-full overflow-y-auto pr-2 py-4">
            <Suspense fallback={<TabFallback />}>
              <SpectatorView />
            </Suspense>
          </div>
        )}
      </main>

      {/* Overlays mount on demand so their code is split out of the initial load. */}
      {menuOpen && (
        <Suspense fallback={null}>
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
        </Suspense>
      )}

      {customizeOpen && (
        <Suspense fallback={null}>
          <CustomizePanel open={customizeOpen} onOpenChange={setCustomizeOpen} />
        </Suspense>
      )}

      {authOpen && (
        <Suspense fallback={null}>
          <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
        </Suspense>
      )}
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
