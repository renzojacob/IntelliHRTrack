from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AttendanceCreate(BaseModel):
    employee_id: str
    method: str
    confidence_score: Optional[float] = None
    location: Optional[str] = None
    shift: Optional[str] = None


class AttendanceResponse(BaseModel):
    id: int
    employee_id: str
    method: str
    confidence_score: Optional[float]
    location: Optional[str]
    shift: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True
