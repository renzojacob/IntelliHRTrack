from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base
import enum

class LeaveStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DECLINED = "declined"
    CANCELLED = "cancelled"

class LeaveType(str, enum.Enum):
    VACATION = "vacation"
    SICK = "sick"
    PERSONAL = "personal"
    EMERGENCY = "emergency"
    OFFICIAL_BUSINESS = "official_business"

class RestrictionLevel(str, enum.Enum):
    NO_LEAVE = "no-leave"
    RESTRICTED = "restricted"

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    leave_type = Column(SQLEnum(LeaveType), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    duration = Column(Float, nullable=False)
    status = Column(SQLEnum(LeaveStatus), default=LeaveStatus.PENDING)
    reason = Column(Text, nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    approved_at = Column(DateTime(timezone=True))
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    remarks = Column(Text)
    
    # Relationships
    employee = relationship("User", back_populates="leave_requests", foreign_keys=[user_id])
    approver_user = relationship("User", foreign_keys=[approved_by])

class LeaveTypePolicy(Base):
    __tablename__ = "leave_type_policies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    max_days = Column(Integer, nullable=False)
    description = Column(Text)
    requires_documentation = Column(Boolean, default=False)
    allow_half_day = Column(Boolean, default=True)
    auto_approve_for_managers = Column(Boolean, default=False)
    min_notice_days = Column(Integer, default=0)
    carryover_limit = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

class BlackoutPeriod(Base):
    __tablename__ = "blackout_periods"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    reason = Column(Text, nullable=False)
    restriction_level = Column(SQLEnum(RestrictionLevel), nullable=False)
    is_active = Column(Boolean, default=True)