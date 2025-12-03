from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.attendance import AttendanceCreate, AttendanceResponse
from app.crud.attendance import create_attendance, get_attendance_logs

router = APIRouter()


@router.post('/api/v1/attendance/check-in', response_model=AttendanceResponse)
def check_in(att_in: AttendanceCreate, db: Session = Depends(get_db)):
    try:
        att = create_attendance(db, attendance_in=att_in.dict())
        return att
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/api/v1/attendance/logs', response_model=List[AttendanceResponse])
def attendance_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_attendance_logs(db, skip=skip, limit=limit)
