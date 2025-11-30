from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    department: str
    position: Optional[str] = None
    employee_id: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class LeaveBalanceBase(BaseModel):
    leave_type: str
    total_days: int
    used_days: int
    remaining_days: int
    year: int

class LeaveBalanceResponse(LeaveBalanceBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True