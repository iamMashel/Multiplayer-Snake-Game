# PRODUCT.md

**What it is:** Snake — Neon Arcade. A fast, retro-neon browser Snake game with a Daily
Challenge (shared seeded board), global + daily leaderboards, shareable score cards, and
(in progress) deep player customization. Live at multiplayer-snake-game-199k.onrender.com.

**Register:** product (interactive game UI). Design *serves* play — controls and menus
disappear into the game — but the **arcade identity is part of the product**, so the board
and assets carry more visual personality than a typical tool. Customization is where brand
expression and product UX meet: players make the game theirs.

**Who uses it / scene:** a person on their phone or laptop, in a spare two minutes, wanting a
quick, satisfying, slightly competitive dopamine loop. Lit screen, dark room or commute.
The mood is playful and a little loud — neon, glow, motion — but never cluttered or noisy.

**Primary loop:** start → steer the snake → eat → grow + speed up → beat your best / climb the
daily board → share. The customization loop wraps it: pick a palette/skin/board, feel
ownership, come back.

**Design intent for customization (this milestone):**
- Players feel they *own* the game: switchable snake skins, full color palettes for every
  asset (snake / food / board / UI accent), grid vs no-grid board, food shape (classic dot vs
  heart) with a blink, haptics on mobile, sound.
- The customization surface must be **intuitive and fast**: live preview, sensible presets one
  tap away, advanced custom colors one level deeper. Changes persist instantly (no save button)
  and never block play.

**Non-goals (now):** account-synced cosmetics, paid skins, real-time multiplayer. Customization
is local-first (localStorage); a future account sync can layer on top.

**Constraints:** React 18 + TS + Vite + Tailwind + shadcn/ui; theming via HSL CSS variables
(already the token system). Mobile-first; most players are on phones. Respect
`prefers-reduced-motion`. Keep the bundle lean.
