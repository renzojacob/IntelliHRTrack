from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.middleware.auth import get_current_admin
from app.models.user import User
from app.models.leave import LeaveRequest, LeaveTypePolicy, BlackoutPeriod
from app.schemas.leave import (
    LeaveRequestWithEmployee, LeaveStatsResponse, ProcessLeaveRequest,
    LeaveTypePolicyResponse, BlackoutPeriodResponse
)
from app.services.leave_service import LeaveService

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

@router.get("/leaves", response_model=dict)
def get_admin_leave_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    stats = LeaveService.get_leave_stats(db)
    
    # Get all leave requests with employee information
    leave_requests = db.query(LeaveRequest).join(User).all()
    
    leave_requests_with_employee = []
    for req in leave_requests:
        req_dict = LeaveRequestWithEmployee(
            id=req.id,
            user_id=req.user_id,
            leave_type=req.leave_type,
            start_date=req.start_date,
            end_date=req.end_date,
            duration=req.duration,
            status=req.status,
            reason=req.reason,
            submitted_at=req.submitted_at,
            approved_at=req.approved_at,
            approved_by=req.approved_by,
            remarks=req.remarks,
            employee_name=f"{req.employee.first_name} {req.employee.last_name}",
            employee_department=req.employee.department,
            employee_id=req.employee.employee_id
        )
        leave_requests_with_employee.append(req_dict)
    
    # Get leave types and blackout periods
    leave_types = db.query(LeaveTypePolicy).filter(LeaveTypePolicy.is_active == True).all()
    blackout_periods = db.query(BlackoutPeriod).filter(BlackoutPeriod.is_active == True).all()
    
    return {
        "pending_approvals": stats.pending_approvals,
        "on_leave_today": stats.on_leave_today,
        "policy_violations": stats.policy_violations,
        "upcoming_expirations": stats.upcoming_expirations,
        "requests": leave_requests_with_employee,
        "leaveTypes": [LeaveTypePolicyResponse.from_orm(lt) for lt in leave_types],
        "blackoutPeriods": [BlackoutPeriodResponse.from_orm(bp) for bp in blackout_periods]
    }

@router.post("/leaves/{request_id}/approve", response_model=LeaveRequestWithEmployee)
def approve_leave_request(
    request_id: int,
    process_data: ProcessLeaveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    try:
        leave_request = LeaveService.approve_leave_request(
            db, request_id, current_user.id, process_data.remarks
        )
        
        # Convert to response with employee info
        response = LeaveRequestWithEmployee(
            id=leave_request.id,
            user_id=leave_request.user_id,
            leave_type=leave_request.leave_type,
            start_date=leave_request.start_date,
            end_date=leave_request.end_date,
            duration=leave_request.duration,
            status=leave_request.status,
            reason=leave_request.reason,
            submitted_at=leave_request.submitted_at,
            approved_at=leave_request.approved_at,
            approved_by=leave_request.approved_by,
            remarks=leave_request.remarks,
            employee_name=f"{leave_request.employee.first_name} {leave_request.employee.last_name}",
            employee_department=leave_request.employee.department,
            employee_id=leave_request.employee.employee_id
        )
        
        return response
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/leaves/{request_id}/deny", response_model=LeaveRequestWithEmployee)
def deny_leave_request(
    request_id: int,
    process_data: ProcessLeaveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    try:
        leave_request = LeaveService.decline_leave_request(
            db, request_id, current_user.id, process_data.remarks
        )
        
        # Convert to response with employee info
        response = LeaveRequestWithEmployee(
            id=leave_request.id,
            user_id=leave_request.user_id,
            leave_type=leave_request.leave_type,
            start_date=leave_request.start_date,
            end_date=leave_request.end_date,
            duration=leave_request.duration,
            status=leave_request.status,
            reason=leave_request.reason,
            submitted_at=leave_request.submitted_at,
            approved_at=leave_request.approved_at,
            approved_by=leave_request.approved_by,
            remarks=leave_request.remarks,
            employee_name=f"{leave_request.employee.first_name} {leave_request.employee.last_name}",
            employee_department=leave_request.employee.department,
            employee_id=leave_request.employee.employee_id
        )
        
        return response
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))