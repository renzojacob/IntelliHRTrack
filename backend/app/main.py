from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, users, leaves, admin
from app.database import engine
from app.models import base, user, leave

# Create tables
base.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Biometrics Attendance System", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React/Vite URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(leaves.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Biometrics Attendance System API"}

# Initialize demo data
@app.on_event("startup")
def startup_event():
    from app.database import SessionLocal
    from app.services.auth_service import AuthService
    from app.services.user_service import UserService
    from app.utils.security import get_password_hash
    from app.models.user import User, LeaveBalance
    from app.models.leave import LeaveTypePolicy, BlackoutPeriod
    from datetime import datetime, timedelta
    
    db = SessionLocal()
    
    try:
        # Create demo admin user if not exists
        admin_user = db.query(User).filter(User.email == "admin@thinkweb.com").first()
        if not admin_user:
            admin_user = User(
                email="admin@thinkweb.com",
                first_name="Admin",
                last_name="User",
                department="Administration",
                position="System Administrator",
                employee_id="EMP-0001",
                hashed_password=get_password_hash("admin123"),
                is_admin=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            
            # Initialize leave balances for admin
            UserService.initialize_leave_balances(db, admin_user.id)
        
        # Create demo employee user if not exists
        employee_user = db.query(User).filter(User.email == "employee@thinkweb.com").first()
        if not employee_user:
            employee_user = User(
                email="employee@thinkweb.com",
                first_name="John",
                last_name="Doe",
                department="Sales",
                position="Sales Representative",
                employee_id="EMP-0002",
                hashed_password=get_password_hash("employee123"),
                is_admin=False
            )
            db.add(employee_user)
            db.commit()
            db.refresh(employee_user)
            
            # Initialize leave balances for employee
            UserService.initialize_leave_balances(db, employee_user.id)
        
        # Create default leave type policies if not exists
        leave_types_data = [
            {"name": "Vacation Leave", "code": "VL", "max_days": 15, "description": "Annual vacation leave"},
            {"name": "Sick Leave", "code": "SL", "max_days": 10, "description": "Medical and health related"},
            {"name": "Personal Days", "code": "PD", "max_days": 5, "description": "Personal emergency leave"},
        ]
        
        for lt_data in leave_types_data:
            existing = db.query(LeaveTypePolicy).filter(LeaveTypePolicy.code == lt_data["code"]).first()
            if not existing:
                leave_policy = LeaveTypePolicy(**lt_data)
                db.add(leave_policy)
        
        # Create sample blackout periods if not exists
        blackout_periods_data = [
            {
                "name": "Year-End Closing",
                "start_date": datetime(2024, 12, 25),
                "end_date": datetime(2025, 1, 2),
                "reason": "Company-wide shutdown",
                "restriction_level": "no-leave"
            },
            {
                "name": "Audit Period",
                "start_date": datetime(2024, 1, 15),
                "end_date": datetime(2024, 1, 30),
                "reason": "Financial audit",
                "restriction_level": "restricted"
            }
        ]
        
        for bp_data in blackout_periods_data:
            existing = db.query(BlackoutPeriod).filter(BlackoutPeriod.name == bp_data["name"]).first()
            if not existing:
                blackout_period = BlackoutPeriod(**bp_data)
                db.add(blackout_period)
        
        db.commit()
        
    except Exception as e:
        print(f"Error initializing demo data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)