from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.leave import LeaveRequest
from app.schemas.leave import LeaveRequestCreate, LeaveRequestResponse
from app.services.leave_service import LeaveService

router = APIRouter(prefix="/api/v1/leaves", tags=["leaves"])

@router.post("/requests", response_model=LeaveRequestResponse)
def create_leave_request(
    leave_data: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        leave_request = LeaveService.create_leave_request(db, leave_data, current_user.id)
        return leave_request
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/requests", response_model=List[LeaveRequestResponse])
def get_my_leave_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return LeaveService.get_user_leave_requests(db, current_user.id)

@router.delete("/requests/{request_id}")
def cancel_leave_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        leave_request = LeaveService.cancel_leave_request(db, request_id, current_user.id)
        return {"message": "Leave request cancelled successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))