from sqlalchemy.orm import Session
from app.models.attendance import Attendance


def create_attendance(db: Session, *, attendance_in: dict) -> Attendance:
    att = Attendance(
        employee_id=attendance_in.get('employee_id'),
        method=attendance_in.get('method'),
        confidence_score=attendance_in.get('confidence_score'),
        location=attendance_in.get('location'),
        shift=attendance_in.get('shift')
    )
    db.add(att)
    db.commit()
    db.refresh(att)
    return att


def get_attendance_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Attendance).order_by(Attendance.created_at.desc()).offset(skip).limit(limit).all()
