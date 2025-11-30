from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.leave import LeaveStatus, LeaveType, RestrictionLevel

class LeaveRequestBase(BaseModel):
    leave_type: LeaveType
    start_date: datetime
    end_date: datetime
    reason: str

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveRequestResponse(LeaveRequestBase):
    id: int
    user_id: int
    duration: float
    status: LeaveStatus
    submitted_at: datetime
    approved_at: Optional[datetime] = None
    approved_by: Optional[int] = None
    remarks: Optional[str] = None
    
    class Config:
        from_attributes = True

class LeaveRequestWithEmployee(LeaveRequestResponse):
    employee_name: str
    employee_department: str
    employee_id: str

class LeaveTypePolicyBase(BaseModel):
    name: str
    code: str
    max_days: int
    description: Optional[str] = None
    requires_documentation: bool = False
    allow_half_day: bool = True
    auto_approve_for_managers: bool = False
    min_notice_days: int = 0
    carryover_limit: int = 0

class LeaveTypePolicyResponse(LeaveTypePolicyBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

class BlackoutPeriodBase(BaseModel):
    name: str
    start_date: datetime
    end_date: datetime
    reason: str
    restriction_level: RestrictionLevel

class BlackoutPeriodResponse(BlackoutPeriodBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

class LeaveStatsResponse(BaseModel):
    pending_approvals: int
    on_leave_today: int
    policy_violations: int
    upcoming_expirations: int

class ProcessLeaveRequest(BaseModel):
    remarks: Optional[str] = None