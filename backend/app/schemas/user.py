from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: str  # Changed from EmailStr to str to avoid validation issues
    role: Optional[str] = "employee"

class UserCreate(UserBase):
    password: str
    first_name: str  # Made required
    last_name: str   # Made required
    department: str  # Made required

class UserLogin(BaseModel):
    username: str
    password: str

class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    first_name: str
    last_name: str
    email: str
    department: str
    position: str

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    employee: Optional[EmployeeResponse] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse