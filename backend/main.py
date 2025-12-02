from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, Base
from app.core.config import settings
from app.routers import auth, leaves, users

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Biometric Attendance System",
    description="Employee Management System with Face Recognition and Fingerprint",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],  # React / Vite dev server URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(leaves.router, prefix="/api/v1/leaves", tags=["leaves"])

@app.get("/")
def read_root():
    return {"message": "Biometric Attendance System API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}