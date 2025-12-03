from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Attendance(Base):
    __tablename__ = 'attendance'

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, index=True, nullable=False)
    method = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=True)
    location = Column(String, nullable=True)
    shift = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
