from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.security import verify_password, get_password_hash

class AuthService:
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str):
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def create_user(db: Session, user_data: dict):
        hashed_password = get_password_hash(user_data["password"])
        db_user = User(
            email=user_data["email"],
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            department=user_data["department"],
            employee_id=user_data["employee_id"],
            hashed_password=hashed_password,
            is_admin=user_data.get("is_admin", False)
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user