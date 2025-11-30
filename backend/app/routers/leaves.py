from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.dependencies.auth import get_current_user, get_current_employee
from app.models.user import User, Employee  # Changed import here
from app.crud.leave import (
    create_leave_request, get_leave_requests_by_employee, get_all_leave_requests,
    get_pending_leave_requests, update_leave_request_status, get_leave_balance,
    get_blackout_periods, get_leave_request_by_id
)
from app.schemas.leave import (
    LeaveRequestCreate, LeaveRequestResponse, LeaveRequestUpdate,
    LeaveBalanceResponse, BlackoutPeriodResponse
)

router = APIRouter()

# Employee endpoints
@router.post("/employee/apply", response_model=LeaveRequestResponse)
def apply_for_leave(
    leave_request: LeaveRequestCreate,
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    return create_leave_request(db=db, leave_request=leave_request, employee_id=current_employee.id)

@router.get("/employee/my-leaves", response_model=List[LeaveRequestResponse])
def get_my_leaves(
    skip: int = 0,
    limit: int = 100,
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    leaves = get_leave_requests_by_employee(db, current_employee.id, skip=skip, limit=limit)
    return leaves

@router.get("/employee/balance", response_model=LeaveBalanceResponse)
def get_my_leave_balance(
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    return get_leave_balance(db, current_employee.id)

# Admin endpoints
@router.get("/admin/all", response_model=List[LeaveRequestResponse])
def get_all_leaves(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return get_all_leave_requests(db, skip=skip, limit=limit)

@router.get("/admin/pending", response_model=List[LeaveRequestResponse])
def get_pending_leaves(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return get_pending_leave_requests(db, skip=skip, limit=limit)

@router.put("/admin/{leave_id}/status", response_model=LeaveRequestResponse)
def update_leave_status(
    leave_id: int,
    leave_update: LeaveRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    leave_request = get_leave_request_by_id(db, leave_id)
    if not leave_request:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    return update_leave_request_status(db, leave_id, leave_update, current_user.id)

@router.get("/admin/blackout-periods", response_model=List[BlackoutPeriodResponse])
def get_blackout_periods(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return get_blackout_periods(db)