# Project Progress Log

> Purpose: a durable record of what's been done, why, and where to pick up next — so
> anyone (the owner, or an AI assistant resuming later) can get oriented in 2 minutes.
> **If you're resuming work, read the "Pick up here next" section at the bottom first.**

Last updated: **2026-06-05** (Phase 0 + 1A + 1C Daily + share cards + deploy-ready)

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
- ✅ Shareable score cards — canvas-rendered neon "I scored N" PNG (`src/lib/shareCard.ts`) with Web Share API + download fallback + copy-link, on the game-over screen (`ShareScore.tsx`). Daily runs get daily framing.
- 🚧 Real leaderboards: global + daily + mode filter ✅; "around-me" / friends ⬜
- ⬜ PWA / installable + offline
- 🚧 Frictionless guest play: device personal-best + sign-up nudge done (Phase 0); full "play first" polish ⬜

**1D. Product hygiene**
- ✅ Analytics: **Cloudflare Web Analytics** LIVE (`src/lib/analytics.ts`) — free/unlimited/no-cookies, prod-only, skips localhost. Beacon token wired into `CF_BEACON_TOKEN` and verified present in the deployed bundle. (CF beacon token is a public identifier, not a secret — safe in source, like a GA id.) Switched off Plausible (paid after trial).
- ✅ Deploy: **LIVE at https://multiplayer-snake-game-199k.onrender.com** (Render Blueprint, free plan). Verified: health, SPA, /og-image.png, favicon, deep links, and DB-connected leaderboard all 200; both migrations ran on prod Postgres. Service `srv-d8hb5g6rnols73cd5evg`, DB `dpg-d8hb4rurnols73cd4u30-a`. OG image (`scripts/generate_og_image.py` → `frontend/public/og-image.png`) + real OG/Twitter tags; fixed prod static-file serving in `main.py` (og-image/favicon/robots were returning index.html); `postgres://`→`postgresql://` normalization; Dockerfile start retries migration while DB wakes + honors `$PORT`; render.yaml service renamed `multiplayer-snake-game`. **Verified by building the exact prod Docker image + running it against Postgres locally** (migrations incl. challenge_id ran, SPA + /og-image.png + API + daily flow all 200). Custom domain ⬜.
- ⬜ Server-side score validation / anti-cheat (scores are still client-submitted — forgeable)

### Phase 2 — Real-time multiplayer (.io arena) — not started
WebSocket authoritative server, rooms/matchmaking, real spectating. **Open decision:** keep
grid co-op/versus vs. full slither.io continuous arena.

### Phase 3 — Growth & monetization — not started
Cosmetic skins, light ads, seasons/events.

---

## Open decisions (waiting on owner)
1. Multiplayer flavor for Phase 2: grid rooms vs. slither.io continuous arena.
2. ~~Hosting~~ → **DECIDED (2026-06-05): deploy via the repo's existing Render blueprint (`render.yaml`).**
3. Monetization a real goal, or is "lots of players" the win? (Affects anti-cheat/skins timing.)

---

## Session log (newest first)

### 2026-06-05 — Analytics live + secret-scan guardrail
- Cloudflare Web Analytics token wired + verified in the live bundle (it's a public id, not a secret — flagged as such with `pragma: allowlist secret`).
- Added a zero-dependency **pre-commit secret scanner** (`.githooks/pre-commit`, `core.hooksPath=.githooks`) per user rule [[never-commit-secrets]]: blocks PEM keys / cloud tokens / `secret=...` / creds-in-URLs in staged diffs; skips itself + lockfiles; honors `pragma: allowlist secret` and `--no-verify`. Tested blocking + pass-through. Hardened `backend/.gitignore` for `.env*`.

### 2026-06-05 — 🎉 LIVE
- After deleting the expired `recsys-db` (freed the one-free-Postgres slot) and resuming `snake-db`, redeployed (commit c82a971) → **live at https://multiplayer-snake-game-199k.onrender.com**. All endpoints verified incl. DB-connected leaderboard. No test data written (clean public board for launch).
- Remaining: paste Cloudflare Web Analytics token into `CF_BEACON_TOKEN`; anti-cheat before sharing widely. Free-tier caveats: web sleeps after ~15 min idle (~50s cold start); free Postgres expires ~2026-07-05.

### 2026-06-05 — Go-live (Render) + honest branding fix
- Deployed via Render Blueprint (CLI installed + authed; blueprint validated). Service `multiplayer-snake-game` got URL `https://multiplayer-snake-game-199k.onrender.com` (name suffixed). Fixed OG/Twitter URLs to that real host.
- **Blocked on DB:** Render free tier = one free Postgres per workspace; an expired `recsys-db` held the slot so `snake-db` came up suspended → app can't resolve the DB host. Owner deleting `recsys-db` + resuming `snake-db` to unblock (or switch to Neon for a durable free DB).
- **Branding honesty fix (owner-requested):** dropped the misleading "Multiplayer" claim from the *visible* branding (title + OG image now "Snake — Neon Arcade", leading with Daily Challenge/Leaderboards/Score Cards). Repo name + Render URL slug keep "multiplayer" for now — revisit when Phase 2 real multiplayer ships and it becomes true.

### 2026-06-05 — Deploy prep (Render) + Plausible analytics
- **Plausible analytics** added (prod-only, auto-domain).
- **OG/social:** generated branded 1200×630 `og-image.png` (Pillow script in `scripts/`), rewrote `frontend/index.html` with real OG/Twitter tags + favicon + theme-color (removed leftover Lovable branding).
- **Fixed a prod bug:** `main.py` served `index.html` for ALL non-`/assets` paths, so `/og-image.png`, `/favicon.ico`, `/robots.txt` were broken — now serves real root static files (with path-traversal guard) and falls back to index.html.
- **Deploy robustness:** `postgres://`→`postgresql://` normalization in `database.py`; Dockerfile start command retries the migration while the managed DB wakes and honors `$PORT`; `render.yaml` service renamed to `multiplayer-snake-game` (→ URL `multiplayer-snake-game.onrender.com`, matching the OG tags).
- **Verified for real:** built the exact prod Docker image (`backend/Dockerfile`) and ran it against a Postgres container — both migrations ran on Postgres (incl. `challenge_id`), and `/`, `/og-image.png` (real PNG), `/favicon.ico`, deep-link SPA fallback, `/api/*`, and the full daily signup→submit→board flow all returned 200. Tore the stack down after.
- **Owner action remaining:** connect the repo in the Render dashboard → Blueprint → deploy; then add the resulting hostname as a site at plausible.io.

### 2026-06-05 — Shareable score cards + hosting decision
- **Shareable score cards shipped:** `src/lib/shareCard.ts` renders a 1200×630 neon PNG on a canvas (score, mode/daily framing, "Can you beat me?" + URL). `ShareScore.tsx` adds Share / Copy-link buttons to the game-over screen; uses Web Share API with a PNG-download fallback, sonner toasts for feedback. Shown for any score > 0.
- **Hosting decided:** deploy via the repo's existing **Render blueprint** (`render.yaml`).
- Verified: `tsc` clean, 50/50 tests, build OK, clean HMR, servers green.

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
**Sequence: Phase 0 ✅ → 1A ✅ → 1C Daily ✅ → share cards ✅ → deploy ✅ LIVE →
⮕ NEXT: Cloudflare token + anti-cheat, then Phase 2 (real multiplayer).**

LIVE: https://multiplayer-snake-game-199k.onrender.com

Owner one-time bits remaining:
- Cloudflare → Web Analytics → add `multiplayer-snake-game-199k.onrender.com` → paste token into `CF_BEACON_TOKEN` (`frontend/src/lib/analytics.ts`).
- Free Postgres expires ~2026-07-05 — recreate or move to Neon before then for durability.

Then, next dev work in priority order:
1. **Anti-cheat:** scores are client-submitted and forgeable — validate/sign runs server-side
   before the leaderboard means anything. Do this before promoting the game widely.
2. **Leaderboard "around-me"/friends** + "you ranked #N today" callout after a daily run.
3. **PWA / installable** (manifest + service worker) for repeat mobile visits.
4. **Phase 2 — real multiplayer** (the big retention unlock). Open decision: grid rooms vs.
   slither.io continuous arena.
5. Still-open quick juice: combo multiplier + floating "+score" popups.

Branch `polish/phase0-and-juice` is pushed; owner to decide PR-to-`main` vs. continue stacking.

How to run locally:
```bash
# from repo root
npm run dev            # runs frontend (:8080) + backend (:8000)
# or separately:
cd backend && make dev
cd frontend && npm install && npm run dev
```
