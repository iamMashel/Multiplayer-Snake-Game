import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthContext } from '@/contexts/AuthContext';
import { User, LogOut, Trophy, Gamepad2, Palette, Eye } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAuthRequest: () => void;
  onCustomize: () => void;
}

export function Header({ activeTab, onTabChange, onAuthRequest, onCustomize }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuthContext();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center neon-box">
              <Gamepad2 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-xl text-primary text-glow-primary hidden sm:block">
              SNAKE
            </h1>
          </div>

          <nav className="flex items-center gap-0.5 sm:gap-1">
            <Button
              variant={activeTab === 'play' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('play')}
              className="font-display h-auto flex-col gap-0.5 px-2 py-1.5 text-[9px] sm:flex-row sm:gap-2 sm:text-xs"
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="leading-none">Play</span>
            </Button>
            <Button
              variant={activeTab === 'leaderboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('leaderboard')}
              className="font-display h-auto flex-col gap-0.5 px-2 py-1.5 text-[9px] sm:flex-row sm:gap-2 sm:text-xs"
            >
              <Trophy className="w-4 h-4" />
              <span className="leading-none">Ranks</span>
            </Button>
            <Button
              variant={activeTab === 'spectate' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('spectate')}
              className="font-display h-auto flex-col gap-0.5 px-2 py-1.5 text-[9px] sm:flex-row sm:gap-2 sm:text-xs"
            >
              <Eye className="w-4 h-4" />
              <span className="leading-none">Watch</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCustomize}
              className="font-display h-auto flex-col gap-0.5 px-2 py-1.5 text-[9px] text-accent hover:text-accent sm:flex-row sm:gap-2 sm:text-xs"
            >
              <Palette className="w-4 h-4" />
              <span className="leading-none">Theme</span>
            </Button>
          </nav>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="font-display">
                  <User className="w-4 h-4 mr-2" />
                  <span className="max-w-[100px] truncate">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Signed in as
                  <br />
                  <span className="font-medium text-foreground">{user.email}</span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={onAuthRequest}
              className="font-display neon-box"
              size="sm"
            >
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
