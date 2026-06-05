import { Link } from "react-router-dom";
import { Gamepad2 } from "lucide-react";

const NotFound = () => {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-6 text-center scanlines">
      <div className="relative">
        <p className="font-display text-7xl sm:text-8xl text-primary neon-text">404</p>
        <h1 className="font-display text-xl sm:text-2xl text-secondary text-glow-secondary mt-3">
          Lost in the grid
        </h1>
        <p className="text-muted-foreground mt-2">This square isn't on the board.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-display text-primary-foreground neon-box transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Gamepad2 className="h-4 w-4" />
          Back to the game
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
