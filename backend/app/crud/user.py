from sqlalchemy.orm import Session
from app.models.user import User, Employee
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    # Check if username already exists
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise ValueError("Username already registered")
    
    # Check if email already exists  
    db_user_email = get_user_by_email(db, email=user.email)
    if db_user_email:
        raise ValueError("Email already registered")
    
    hashed_password = get_password_hash(user.password)
    
    # Create user
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()  # Changed from flush to commit
    db.refresh(db_user)
    
    # Generate employee_id
    employee_id = f"EMP-{db_user.id:04d}"
    
    # Create employee record
    db_employee = Employee(
        user_id=db_user.id,
        employee_id=employee_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        department=user.department,
        position="Employee" if user.role == "employee" else "Manager"
    )
    db.add(db_employee)
    db.commit()
    
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user