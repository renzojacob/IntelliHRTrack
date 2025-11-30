from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

class LeaveStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DECLINED = "declined"
    CANCELLED = "cancelled"

class LeaveType(str, Enum):
    VACATION = "vacation"
    SICK = "sick"
    PERSONAL = "personal"
    EMERGENCY = "emergency"
    OFFICIAL_BUSINESS = "official_business"

class LeaveRequestBase(BaseModel):
    leave_type: str
    start_date: date
    end_date: date
    reason: str

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveRequestUpdate(BaseModel):
    status: LeaveStatus
    remarks: Optional[str] = None

class LeaveRequestResponse(LeaveRequestBase):
    id: int
    employee_id: int
    status: str
    duration: int
    submitted_at: datetime
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    remarks: Optional[str] = None
    employee: Optional[dict] = None

    class Config:
        from_attributes = True

class LeaveBalanceResponse(BaseModel):
    vacation_days: int
    sick_days: int
    personal_days: int
    emergency_days: int
    used_vacation: int = 0
    used_sick: int = 0
    used_personal: int = 0
    used_emergency: int = 0

    class Config:
        from_attributes = True

class BlackoutPeriodBase(BaseModel):
    name: str
    start_date: date
    end_date: date
    reason: str
    restriction_level: str

class BlackoutPeriodResponse(BlackoutPeriodBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True