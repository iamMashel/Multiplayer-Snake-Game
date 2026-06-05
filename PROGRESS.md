# Project Progress Log

> Purpose: a durable record of what's been done, why, and where to pick up next — so
> anyone (the owner, or an AI assistant resuming later) can get oriented in 2 minutes.
> **If you're resuming work, read the "Pick up here next" section at the bottom first.**

Last updated: **2026-06-05** (Phase 0 + 1A sound/juice + 1C Daily Challenge)

---

## TL;DR — what this project actually is

Despite the repo name, this is a **single-player** classic grid Snake (React + TS + Vite
frontend on port 8080, FastAPI + SQLite backend on port 8000). "Spectator mode" watches a
**local AI bot**, not real players. "Multiplayer" today = shared leaderboard + auth only.

**Chosen direction (2026-06-05):** build toward a *real product with real players*, by
**polishing single-player first** (fast, low-risk, gives acquisition + shareability), then
adding **true real-time multiplayer** (WebSocket arena) later as the retention engine.

---

## Roadmap & status

Legend: ✅ done · 🚧 in progress · ⬜ not started · ⏭️ deferred

### Phase 0 — Fix what's broken/misleading  ✅ DONE (2026-06-05)
- ✅ 0.1 Removed debug `console.log`s from `useSnakeGame.ts` score-submit
- ✅ 0.2 Guest score capture: local per-mode personal best (`snake_personal_best`), "NEW BEST!" on game over, and a "Save my score" sign-up nudge for guests (GameBoard + Index)
- ✅ 0.3 Reframed "Spectator" → "Demo Arena" with an "AI Demo" badge + honest copy ("real multiplayer coming soon") in `SpectatorView.tsx`
- ✅ 0.4 Leaderboard trailing-slash — already correct in `api.ts` (`/leaderboard/`); no code change needed
- ✅ 0.5 Verified: backend `game.py` persistence is an **in-memory mock dict** (`SAVED_GAMES`, commented "unused in frontend currently") — it is a STUB, not real persistence. README claim is aspirational. TODO when needed: persist saved games to the DB + wire the frontend `gameApi`.

### Phase 1 — Make single-player genuinely great + shareable
**1A. Game feel / juice**  (partially done)
- ✅ Sound effects via Web Audio synth (`src/lib/sound.ts`): eat, turn, start, game-over, new-best — no asset files; persisted mute toggle in the HUD (`GameOverlay`)
- ✅ Visual juice: direction-aware snake head/eyes + one-shot death screen-shake (`game-shake` in index.css); BEST readout added to HUD
- ⬜ Combo / streak multiplier (deferred — needs game-logic timing changes)
- ⬜ Floating "+score" popups on eat (deferred)
- ⏭️ Smooth movement interpolation (bigger change; deferred until after cheaper juice)

**1B. Depth**
- ⬜ Power-ups / hazards (speed, slow-mo, shrink, ghost, bonus fruit, obstacles)
- ⬜ Difficulty curve / themed arenas
- ⬜ Mobile swipe controls (currently on-screen arrows only)

**1C. Retention & virality**
- ✅ Daily Challenge with shared seed + daily leaderboard — seeded board (same for everyone each UTC day), `DAILY` mode in menu/HUD, daily scores tagged with `challenge_id`, "Today's Daily" filter in the leaderboard. Backend: `challenge_id` column (migration `a1b2c3d4e5f6`) + filter.
- ⬜ Shareable score cards (image + link) — NEXT
- 🚧 Real leaderboards: global + daily + mode filter ✅; "around-me" / friends ⬜
- ⬜ PWA / installable + offline
- 🚧 Frictionless guest play: device personal-best + sign-up nudge done (Phase 0); full "play first" polish ⬜

**1D. Product hygiene**
- ⬜ Analytics (Plausible/PostHog)
- ⬜ Proper deploy + custom domain + OG/share image
- ⬜ Server-side score validation / anti-cheat

### Phase 2 — Real-time multiplayer (.io arena) — not started
WebSocket authoritative server, rooms/matchmaking, real spectating. **Open decision:** keep
grid co-op/versus vs. full slither.io continuous arena.

### Phase 3 — Growth & monetization — not started
Cosmetic skins, light ads, seasons/events.

---

## Open decisions (waiting on owner)
1. Multiplayer flavor for Phase 2: grid rooms vs. slither.io continuous arena.
2. Hosting: repo's Render blueprint vs. split (frontend→Vercel / backend→Render).
3. Monetization a real goal, or is "lots of players" the win? (Affects anti-cheat/skins timing.)

---

## Session log (newest first)

### 2026-06-05 — Phase 1C: Daily Challenge
- Pushed `polish/phase0-and-juice` to GitHub.
- **Daily Challenge shipped:** seeded deterministic board (mulberry32 PRNG + pre-rolled food queue keyed to the UTC day), so everyone gets the same board each day.
  - gameLogic: `mulberry32`, `getDailySeed`, `getDailyId`, `buildFoodQueue`, seeded `generateFood`, daily branch in `createInitialState`/`moveSnake`; `walls` is now the only non-wrapping mode.
  - Backend: added `DAILY` GameMode, `Score.challenge_id` column + alembic migration `a1b2c3d4e5f6`, `challenge_id` filter/param on leaderboard GET/POST. Verified end-to-end via curl.
  - UI: "Daily Challenge" entry in MenuModal, `DAILY` HUD badge, daily score submission tagged with the day, "Today's Daily" filter in Leaderboard.
- Tests: added 6 daily-determinism tests → **50/50 pass**; `tsc` clean; build OK; servers green.
- NOTE: backend was restarted **with `--reload`** (the first run lacked it, so it served stale enums).

### 2026-06-05 — Phase 0 + Phase 1A (sound/juice)
- **Phase 0 complete** (see roadmap): removed debug logs; guest personal-best + "Save my score" nudge; honest "Demo Arena / AI Demo" relabel; confirmed game-persistence backend is a stub.
- **Phase 1A (partial):** added Web Audio sound system + mute toggle; snake-head eyes; death screen-shake; BEST readout in HUD.
- New files: `frontend/src/lib/sound.ts`. Touched: `useSnakeGame.ts`, `GameBoard.tsx`, `GameOverlay.tsx`, `Index.tsx`, `SpectatorView.tsx`, `index.css`.
- Verified: `tsc --noEmit` clean, 44/44 vitest pass, `npm run build` succeeds, both dev servers green.

### 2026-06-05 — Setup + planning
- Cloned repo, installed deps (backend `uv sync`, frontend `npm install`), DB already migrated.
- Got both servers running locally (frontend :8080, backend :8000); verified signup + leaderboard end-to-end.
- Discovered the game is single-player, not multiplayer; spectator mode is a local AI bot.
- Researched the .io snake niche (slither.io/snake.io/wormax) and agreed on direction above.
- Created this progress log.

---

## Pick up here next
**Sequence: Phase 0 ✅ → Phase 1A juice/sound ✅ → Phase 1C Daily Challenge ✅ →
⮕ NEXT: shareable score cards → deploy + analytics.**

Immediate next actions, in order:
1. **Shareable score card:** render a canvas/OG image ("I scored N 🐍 — beat me") + copy-link
   button on the game-over screen. Free organic growth; pairs perfectly with the Daily board.
2. **Deploy + analytics:** stable public URL (Render blueprint exists; or split Vercel+Render) +
   Plausible/PostHog + OG/share meta tags. This is what turns it into a real, reachable product.
3. **Leaderboard "around-me"/friends** + maybe a "you ranked #N today" callout after a daily run.
4. Still-open quick juice: combo multiplier + floating "+score" popups (deferred twice now).

Open question for owner before deploy: hosting choice (Render blueprint vs Vercel+Render split)
and whether to push these branches to `main` / open a PR.

How to run locally:
```bash
# from repo root
npm run dev            # runs frontend (:8080) + backend (:8000)
# or separately:
cd backend && make dev
cd frontend && npm install && npm run dev
```
