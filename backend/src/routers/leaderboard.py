from typing import Optional, List
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..db.models import Score, User as DBUser
from ..models import ApiResponse, LeaderboardEntry, GameMode

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

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
    username: str = Body(...),
    challenge_id: Optional[str] = Body(None),
    db: Session = Depends(get_db)
):
    user = db.query(DBUser).filter(DBUser.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_score = Score(
        user_id=user.id,
        score=score,
        mode=mode.value,
        challenge_id=challenge_id,
    )
    
    db.add(new_score)
    db.commit()
    db.refresh(new_score)
    
    # We need to calculate rank to return the full entry
    # For simplicity in this response, we'll just return the entry details
    # Ideally we'd query for the rank
    
    entry = LeaderboardEntry(
        id=new_score.id,
        rank=0, # Placeholder rank
        username=user.username,
        score=new_score.score,
        mode=mode,
        playedAt=new_score.played_at
    )
    
    return ApiResponse(success=True, data=entry)
