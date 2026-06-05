---
target: Snake game UI
total_score: 33
p0_count: 0
p1_count: 0
timestamp: 2026-06-05T18-04-48Z
slug: frontend-src-pages-index-tsx
---
# Critique — Snake game UI (frontend/src/pages/Index.tsx)

Design Health: 33/40 (Good). Detector: clean (exit 0). Anti-patterns: PASS.

Heuristics: status 3, match 4, control 4, consistency 4, error-prevention 3,
recognition 3, flexibility 3, aesthetic 4, error-recovery 2, help 3.

Priority issues:
- [P2] Game keeps running when switching tabs (loop in hook, not view). Fix: pause when activeTab != play.
- [P2] Silent data failures: leaderboard shows "No entries yet" when backend is down; score-submit failure silent. Fix: error state + retry + toast.
- [P2] Desktop never shows controls (mobile has swipe hint). Fix: keyboard hint on READY overlay.
- [P2] Mobile nav icon-only (Play/Leaderboard/Watch/Customize). Fix: labels or labeled bottom tab bar.
- [P3] No keyboard start/restart (Space/Enter).

Persona red flags: Casey - tab-switch kills run; Jordan - icon-only nav + no desktop control hint; Sam - mostly good, board inherently visual.

Strengths: peak-end emotional arc (game-over offers NEW BEST/share/play again); customization panel (live preview, progressive disclosure); consistent committed neon aesthetic.
