from typing import Optional

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from .db.database import get_db
from .db.models import User as DBUser
from .security import verify_session_token


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> DBUser:
    """Resolve the authenticated user from a Bearer session token, or 401."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization[7:].strip()
    payload = verify_session_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    user = db.query(DBUser).filter(DBUser.id == payload.get("uid")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists")

    return user
