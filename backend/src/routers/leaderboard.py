from typing import Optional, List
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..db.models import Score, User as DBUser
from ..models import ApiResponse, LeaderboardEntry, GameMode
from ..deps import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

# Anti-cheat bounds. The 20x20 grid has 400 cells; starting length 3 → at most
# 397 food (×10 raw), and the 'walls' mode multiplies the final score by 1.5,
# so the theoretical ceiling is floor(3970 * 1.5) = 5955. Scores also always
# move in steps that are multiples of 5 (10 normally, 15 in walls mode).
MAX_PLAUSIBLE_SCORE = 6000
MAX_SUBMISSIONS_PER_MINUTE = 20


def _is_plausible_score(score: int) -> bool:
    return isinstance(score, int) and 0 <= score <= MAX_PLAUSIBLE_SCORE and score % 5 == 0

@router.get("/", response_model=ApiResponse)
async def get_leaderboard(
    mode: Optional[GameMode] = None,
    challenge_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Score).join(DBUser)

    if mode:
        query = query.filter(Score.mode == mode.value)

    # Daily challenge: scope to a specific day's board (e.g. "2026-06-05")
    if challenge_id:
        query = query.filter(Score.challenge_id == challenge_id)

    # Get top 50 scores
    scores = query.order_by(Score.score.desc()).limit(50).all()
    
    entries_with_rank = []
    for i, s in enumerate(scores):
        entries_with_rank.append(LeaderboardEntry(
            id=s.id,
            rank=i + 1,
            username=s.user.username,
            score=s.score,
            mode=GameMode(s.mode) if s.mode else GameMode.PASS_THROUGH,
            playedAt=s.played_at
        ))
        
    return ApiResponse(success=True, data=entries_with_rank)

@router.post("/", response_model=ApiResponse)
async def submit_score(
    score: int = Body(...),
    mode: GameMode = Body(...),
    challenge_id: Optional[str] = Body(None),
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # The score belongs to the authenticated user — never a client-supplied name.
    if not _is_plausible_score(score):
        raise HTTPException(status_code=400, detail="Invalid score")

    # Rate limit per user (DB-based, so it survives restarts).
    one_minute_ago = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(minutes=1)
    recent = (
        db.query(Score)
        .filter(Score.user_id == current_user.id, Score.played_at >= one_minute_ago)
        .count()
    )
    if recent >= MAX_SUBMISSIONS_PER_MINUTE:
        raise HTTPException(status_code=429, detail="Too many submissions, slow down")

    new_score = Score(
        user_id=current_user.id,
        score=score,
        mode=mode.value,
        challenge_id=challenge_id,
    )

    db.add(new_score)
    db.commit()
    db.refresh(new_score)

    entry = LeaderboardEntry(
        id=new_score.id,
        rank=0,  # Placeholder rank
        username=current_user.username,
        score=new_score.score,
        mode=mode,
        playedAt=new_score.played_at
    )

    return ApiResponse(success=True, data=entry)
