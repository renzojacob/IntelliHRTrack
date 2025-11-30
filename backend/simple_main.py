from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Biometric Attendance System",
    description="Employee Management System",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "API is working!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/v1/auth/register")
def register_user():
    return {"message": "Registration endpoint - add logic later"}

@app.post("/api/v1/auth/login")
def login_user():
    return {"message": "Login endpoint - add logic later"}