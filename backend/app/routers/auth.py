from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token
from app.crud.user import authenticate_user, create_user, get_user_by_username
from app.schemas.user import UserCreate, UserResponse, Token

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        print("Received registration data:", user_data.dict())
        # Validate password length for bcrypt (max 72 bytes)
        pwd_bytes = (user_data.password or '').encode('utf-8')
        if len(pwd_bytes) > 72:
            raise HTTPException(status_code=400, detail="Password too long. Maximum 72 bytes allowed; please use a shorter password.")

        # Create user
        user = create_user(db=db, user=user_data)
        return user
    except HTTPException:
        # re-raise HTTPExceptions (validation errors)
        raise
    except ValueError as e:
        print("Registration error:", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("Unexpected error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    # Build user response
    user_response = UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )