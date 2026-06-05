from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..db.models import User as DBUser
from ..models import LoginCredentials, SignupCredentials, User, ApiResponse
from ..security import verify_password, get_password_hash, create_session_token

router = APIRouter(prefix="/auth", tags=["Auth"])

def to_pydantic_user(db_user: DBUser) -> User:
    return User(
        id=str(db_user.id),
        username=db_user.username,
        email=db_user.email,
        avatarUrl=db_user.avatar_url,
        createdAt=db_user.created_at
    )

def auth_payload(db_user: DBUser) -> dict:
    """User + a signed session token, returned on login/signup."""
    return {
        "user": to_pydantic_user(db_user).model_dump(mode="json"),
        "token": create_session_token(str(db_user.id), db_user.username),
    }

@router.post("/login", response_model=ApiResponse)
async def login(credentials: LoginCredentials, db: Session = Depends(get_db)):
    user_in_db = db.query(DBUser).filter(DBUser.email == credentials.email).first()
    
    if not user_in_db:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_in_db.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return ApiResponse(success=True, data=auth_payload(user_in_db))

@router.post("/signup", response_model=ApiResponse)
async def signup(credentials: SignupCredentials, db: Session = Depends(get_db)):
    if db.query(DBUser).filter(DBUser.email == credentials.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    if db.query(DBUser).filter(DBUser.username == credentials.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    hashed_password = get_password_hash(credentials.password)
    
    new_user = DBUser(
        username=credentials.username,
        email=credentials.email,
        password_hash=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return ApiResponse(success=True, data=auth_payload(new_user))

@router.post("/logout", response_model=ApiResponse)
async def logout():
    return ApiResponse(success=True)

@router.get("/session", response_model=ApiResponse)
async def get_session():
    return ApiResponse(success=True, data=None)
