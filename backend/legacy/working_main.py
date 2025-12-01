from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import func
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import hashlib
from typing import Optional
from pydantic import BaseModel, EmailStr

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./attendance.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="employee")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    employee_id = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String)
    department = Column(String, default="General")
    position = Column(String, default="Employee")

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    leave_type = Column(String)
    start_date = Column(String)  # Using String for simplicity
    end_date = Column(String)
    reason = Column(String)
    status = Column(String, default="pending")
    duration = Column(Integer)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

# NOTE: creating tables at import time can cause issues with the uvicorn autoreloader
# (it imports the module in a subprocess). Create tables on startup instead.

# FastAPI app
app = FastAPI(title="Biometric Attendance System")

# Create tables when the app starts (avoids import-time side-effects)
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# CORS
app.add_middleware(
    CORSMiddleware,
    # Allow both common Vite dev ports so frontend can call API during development
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Security
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
SECRET_KEY = "your-secret-key-change-this"
ALGORITHM = "HS256"

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "employee"
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = "General"

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class LeaveRequestCreate(BaseModel):
    leave_type: str
    start_date: str
    end_date: str
    reason: str

# Routes
@app.get("/")
def read_root():
    return {"message": "Biometric Attendance System API"}

@app.post("/api/v1/auth/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if username exists
        existing_user = db.query(User).filter(User.username == user_data.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already registered")

        # Check if email exists
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Validate password length for bcrypt (max 72 bytes)
        pwd_bytes = (user_data.password or '').encode('utf-8')
        if len(pwd_bytes) > 72:
            raise HTTPException(status_code=400, detail="Password too long. Maximum 72 bytes allowed; please use a shorter password.")

        # Create user
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password,
            role=user_data.role
        )
        db.add(db_user)
        # flush so we have an id for related employee
        db.flush()

        # Create employee record
        employee_id = f"EMP-{db_user.id:04d}"
        db_employee = Employee(
            user_id=db_user.id,
            employee_id=employee_id,
            first_name=user_data.first_name or user_data.username,
            last_name=user_data.last_name or "",
            email=user_data.email,
            department=user_data.department
        )
        db.add(db_employee)
        db.commit()
        db.refresh(db_user)

        return {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
            "role": db_user.role,
            "is_active": db_user.is_active
        }
    except HTTPException:
        # Re-raise HTTPExceptions we intentionally raised
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Return a generic 500 with the error message for easier debugging in dev
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/auth/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Authenticate user
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    user_response = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
    }

    return {"access_token": access_token, "token_type": "bearer", "user": user_response}

@app.post("/api/v1/leaves/employee/apply")
def apply_for_leave(leave_data: LeaveRequestCreate, db: Session = Depends(get_db)):
    # For testing, use employee_id = 1
    duration = 5  # Simple calculation
    
    db_leave = LeaveRequest(
        employee_id=1,  # Hardcoded for testing
        leave_type=leave_data.leave_type,
        start_date=leave_data.start_date,
        end_date=leave_data.end_date,
        reason=leave_data.reason,
        duration=duration
    )
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    
    return {
        "id": db_leave.id,
        "employee_id": db_leave.employee_id,
        "leave_type": db_leave.leave_type,
        "start_date": db_leave.start_date,
        "end_date": db_leave.end_date,
        "reason": db_leave.reason,
        "status": db_leave.status,
        "duration": db_leave.duration,
        "submitted_at": db_leave.submitted_at
    }

# Note: admin listing routes moved to routers and enriched via app.crud.leave.get_all_leave_requests_enriched
# The original inline route has been removed to avoid duplicate/legacy endpoints during development.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
