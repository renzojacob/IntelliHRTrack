from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import date
from typing import List, Optional
from app.models.leave import LeaveRequest, LeaveBalance, BlackoutPeriod, LeaveStatus
from app.schemas.leave import LeaveRequestCreate, LeaveRequestUpdate

def create_leave_request(db: Session, leave_request: LeaveRequestCreate, employee_id: int):
    # Calculate duration
    duration = (leave_request.end_date - leave_request.start_date).days + 1
    
    db_leave = LeaveRequest(
        employee_id=employee_id,
        leave_type=leave_request.leave_type,
        start_date=leave_request.start_date,
        end_date=leave_request.end_date,
        reason=leave_request.reason,
        duration=duration
    )
    
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    
    # Return a dictionary instead of the SQLAlchemy object
    return {
        "id": db_leave.id,
        "employee_id": db_leave.employee_id,
        "leave_type": db_leave.leave_type,
        "start_date": db_leave.start_date,
        "end_date": db_leave.end_date,
        "reason": db_leave.reason,
        "status": db_leave.status,
        "duration": db_leave.duration,
        "submitted_at": db_leave.submitted_at,
        "approved_by": db_leave.approved_by,
        "approved_at": db_leave.approved_at,
        "remarks": db_leave.remarks,
        "employee": None  # We'll handle this separately if needed
    }

def get_leave_requests_by_employee(db: Session, employee_id: int, skip: int = 0, limit: int = 100):
    leaves = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == employee_id
    ).order_by(LeaveRequest.submitted_at.desc()).offset(skip).limit(limit).all()
    
    # Convert to list of dictionaries
    return [
        {
            "id": leave.id,
            "employee_id": leave.employee_id,
            "leave_type": leave.leave_type,
            "start_date": leave.start_date,
            "end_date": leave.end_date,
            "reason": leave.reason,
            "status": leave.status,
            "duration": leave.duration,
            "submitted_at": leave.submitted_at,
            "approved_by": leave.approved_by,
            "approved_at": leave.approved_at,
            "remarks": leave.remarks,
            "employee": None
        }
        for leave in leaves
    ]

def get_all_leave_requests(db: Session, skip: int = 0, limit: int = 100):
    leaves = db.query(LeaveRequest).order_by(LeaveRequest.submitted_at.desc()).offset(skip).limit(limit).all()
    
    # Convert to list of dictionaries
    return [
        {
            "id": leave.id,
            "employee_id": leave.employee_id,
            "leave_type": leave.leave_type,
            "start_date": leave.start_date,
            "end_date": leave.end_date,
            "reason": leave.reason,
            "status": leave.status,
            "duration": leave.duration,
            "submitted_at": leave.submitted_at,
            "approved_by": leave.approved_by,
            "approved_at": leave.approved_at,
            "remarks": leave.remarks,
            "employee": None
        }
        for leave in leaves
    ]

def get_pending_leave_requests(db: Session, skip: int = 0, limit: int = 100):
    leaves = db.query(LeaveRequest).filter(
        LeaveRequest.status == LeaveStatus.PENDING
    ).order_by(LeaveRequest.submitted_at.desc()).offset(skip).limit(limit).all()
    
    # Convert to list of dictionaries
    return [
        {
            "id": leave.id,
            "employee_id": leave.employee_id,
            "leave_type": leave.leave_type,
            "start_date": leave.start_date,
            "end_date": leave.end_date,
            "reason": leave.reason,
            "status": leave.status,
            "duration": leave.duration,
            "submitted_at": leave.submitted_at,
            "approved_by": leave.approved_by,
            "approved_at": leave.approved_at,
            "remarks": leave.remarks,
            "employee": None
        }
        for leave in leaves
    ]

def get_leave_request_by_id(db: Session, leave_id: int):
    return db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()

def update_leave_request_status(db: Session, leave_id: int, leave_update: LeaveRequestUpdate, approved_by: int):
    db_leave = get_leave_request_by_id(db, leave_id)
    if db_leave:
        db_leave.status = leave_update.status.value
        db_leave.remarks = leave_update.remarks
        if leave_update.status.value == LeaveStatus.APPROVED:
            db_leave.approved_by = approved_by
            db_leave.approved_at = date.today()
        
        db.commit()
        db.refresh(db_leave)
        
        # Return dictionary
        return {
            "id": db_leave.id,
            "employee_id": db_leave.employee_id,
            "leave_type": db_leave.leave_type,
            "start_date": db_leave.start_date,
            "end_date": db_leave.end_date,
            "reason": db_leave.reason,
            "status": db_leave.status,
            "duration": db_leave.duration,
            "submitted_at": db_leave.submitted_at,
            "approved_by": db_leave.approved_by,
            "approved_at": db_leave.approved_at,
            "remarks": db_leave.remarks,
            "employee": None
        }
    return None

# Keep the other functions (get_leave_balance, get_blackout_periods) the same as before
def get_leave_balance(db: Session, employee_id: int):
    balance = db.query(LeaveBalance).filter(LeaveBalance.employee_id == employee_id).first()
    
    if not balance:
        # Create default balance if not exists
        balance = LeaveBalance(
            employee_id=employee_id,
            vacation_days=15,
            sick_days=10,
            personal_days=5,
            emergency_days=5
        )
        db.add(balance)
        db.commit()
        db.refresh(balance)
    
    # Calculate used leaves
    used_leaves = db.query(LeaveRequest).filter(
        and_(
            LeaveRequest.employee_id == employee_id,
            LeaveRequest.status == LeaveStatus.APPROVED
        )
    ).all()
    
    used_vacation = sum(l.duration for l in used_leaves if l.leave_type == "vacation")
    used_sick = sum(l.duration for l in used_leaves if l.leave_type == "sick")
    used_personal = sum(l.duration for l in used_leaves if l.leave_type == "personal")
    used_emergency = sum(l.duration for l in used_leaves if l.leave_type == "emergency")
    
    return {
        "vacation_days": balance.vacation_days,
        "sick_days": balance.sick_days,
        "personal_days": balance.personal_days,
        "emergency_days": balance.emergency_days,
        "used_vacation": used_vacation,
        "used_sick": used_sick,
        "used_personal": used_personal,
        "used_emergency": used_emergency
    }

def get_blackout_periods(db: Session):
    periods = db.query(BlackoutPeriod).order_by(BlackoutPeriod.start_date).all()
    
    # Convert to list of dictionaries
    return [
        {
            "id": period.id,
            "name": period.name,
            "start_date": period.start_date,
            "end_date": period.end_date,
            "reason": period.reason,
            "restriction_level": period.restriction_level,
            "created_at": period.created_at
        }
        for period in periods
    ]