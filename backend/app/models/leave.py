from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

# Define LeaveStatus as a regular class (not enum) since we're using strings in the database
class LeaveStatus:
    PENDING = "pending"
    APPROVED = "approved"
    DECLINED = "declined"
    CANCELLED = "cancelled"

class LeaveType:
    VACATION = "vacation"
    SICK = "sick"
    PERSONAL = "personal"
    EMERGENCY = "emergency"
    OFFICIAL_BUSINESS = "official_business"

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    leave_type = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, default=LeaveStatus.PENDING)  # Use the class constant
    duration = Column(Integer)  # in days
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    remarks = Column(Text, nullable=True)
    
    # Relationships
    employee = relationship("Employee", back_populates="leave_requests")
    approver = relationship("User", foreign_keys=[approved_by])

class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), unique=True)
    vacation_days = Column(Integer, default=15)
    sick_days = Column(Integer, default=10)
    personal_days = Column(Integer, default=5)
    emergency_days = Column(Integer, default=5)
    
    employee = relationship("Employee")

class BlackoutPeriod(Base):
    __tablename__ = "blackout_periods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=False)
    restriction_level = Column(String, default="restricted")  # no-leave, restricted
    created_at = Column(DateTime(timezone=True), server_default=func.now())