from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime, timedelta
from typing import List, Optional
from app.models.leave import LeaveRequest, LeaveStatus, LeaveType, BlackoutPeriod, LeaveTypePolicy
from app.models.user import User, LeaveBalance
from app.schemas.leave import LeaveRequestCreate, LeaveStatsResponse

class LeaveService:
    
    @staticmethod
    def create_leave_request(
        db: Session, 
        leave_data: LeaveRequestCreate, 
        user_id: int
    ) -> LeaveRequest:
        # Calculate duration
        duration = (leave_data.end_date - leave_data.start_date).days + 1
        
        # Check for blackout periods
        blackout_conflicts = db.query(BlackoutPeriod).filter(
            and_(
                BlackoutPeriod.is_active == True,
                or_(
                    and_(
                        leave_data.start_date >= BlackoutPeriod.start_date,
                        leave_data.start_date <= BlackoutPeriod.end_date
                    ),
                    and_(
                        leave_data.end_date >= BlackoutPeriod.start_date,
                        leave_data.end_date <= BlackoutPeriod.end_date
                    ),
                    and_(
                        leave_data.start_date <= BlackoutPeriod.start_date,
                        leave_data.end_date >= BlackoutPeriod.end_date
                    )
                )
            )
        ).all()
        
        if blackout_conflicts:
            conflict_names = [period.name for period in blackout_conflicts]
            raise ValueError(f"Selected dates conflict with blackout periods: {', '.join(conflict_names)}")
        
        # Check leave balance
        current_year = datetime.now().year
        leave_balance = db.query(LeaveBalance).filter(
            and_(
                LeaveBalance.user_id == user_id,
                LeaveBalance.leave_type == leave_data.leave_type.value,
                LeaveBalance.year == current_year
            )
        ).first()
        
        if leave_balance and leave_balance.remaining_days < duration:
            raise ValueError(f"Insufficient {leave_data.leave_type.value} leave balance. Requested: {duration}, Available: {leave_balance.remaining_days}")
        
        # Create leave request
        db_leave_request = LeaveRequest(
            user_id=user_id,
            leave_type=leave_data.leave_type,
            start_date=leave_data.start_date,
            end_date=leave_data.end_date,
            duration=duration,
            reason=leave_data.reason,
            status=LeaveStatus.PENDING
        )
        
        db.add(db_leave_request)
        db.commit()
        db.refresh(db_leave_request)
        return db_leave_request
    
    @staticmethod
    def get_user_leave_requests(db: Session, user_id: int) -> List[LeaveRequest]:
        return db.query(LeaveRequest).filter(
            LeaveRequest.user_id == user_id
        ).order_by(LeaveRequest.submitted_at.desc()).all()
    
    @staticmethod
    def get_all_leave_requests(db: Session, skip: int = 0, limit: int = 100) -> List[LeaveRequest]:
        return db.query(LeaveRequest).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_pending_leave_requests(db: Session) -> List[LeaveRequest]:
        return db.query(LeaveRequest).filter(
            LeaveRequest.status == LeaveStatus.PENDING
        ).all()
    
    @staticmethod
    def approve_leave_request(
        db: Session, 
        request_id: int, 
        approver_id: int,
        remarks: Optional[str] = None
    ) -> LeaveRequest:
        leave_request = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
        if not leave_request:
            raise ValueError("Leave request not found")
        
        # Update leave balance
        current_year = datetime.now().year
        leave_balance = db.query(LeaveBalance).filter(
            and_(
                LeaveBalance.user_id == leave_request.user_id,
                LeaveBalance.leave_type == leave_request.leave_type.value,
                LeaveBalance.year == current_year
            )
        ).first()
        
        if leave_balance:
            leave_balance.used_days += leave_request.duration
            leave_balance.remaining_days -= leave_request.duration
        
        leave_request.status = LeaveStatus.APPROVED
        leave_request.approved_by = approver_id
        leave_request.approved_at = datetime.now()
        leave_request.remarks = remarks
        
        db.commit()
        db.refresh(leave_request)
        return leave_request
    
    @staticmethod
    def decline_leave_request(
        db: Session, 
        request_id: int, 
        approver_id: int,
        remarks: Optional[str] = None
    ) -> LeaveRequest:
        leave_request = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
        if not leave_request:
            raise ValueError("Leave request not found")
        
        leave_request.status = LeaveStatus.DECLINED
        leave_request.approved_by = approver_id
        leave_request.approved_at = datetime.now()
        leave_request.remarks = remarks
        
        db.commit()
        db.refresh(leave_request)
        return leave_request
    
    @staticmethod
    def cancel_leave_request(db: Session, request_id: int, user_id: int) -> LeaveRequest:
        leave_request = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
        if not leave_request:
            raise ValueError("Leave request not found")
        
        if leave_request.user_id != user_id:
            raise ValueError("Not authorized to cancel this request")
        
        if leave_request.status != LeaveStatus.PENDING:
            raise ValueError("Only pending requests can be cancelled")
        
        leave_request.status = LeaveStatus.CANCELLED
        db.commit()
        db.refresh(leave_request)
        return leave_request
    
    @staticmethod
    def get_leave_stats(db: Session) -> LeaveStatsResponse:
        pending_approvals = db.query(LeaveRequest).filter(
            LeaveRequest.status == LeaveStatus.PENDING
        ).count()
        
        today = datetime.now().date()
        on_leave_today = db.query(LeaveRequest).filter(
            and_(
                LeaveRequest.status == LeaveStatus.APPROVED,
                LeaveRequest.start_date <= today,
                LeaveRequest.end_date >= today
            )
        ).count()
        
        # Policy violations (simplified - in real app would check actual policies)
        policy_violations = 0
        
        # Upcoming expirations (leaves ending in next 30 days)
        upcoming_expirations = db.query(LeaveRequest).filter(
            and_(
                LeaveRequest.status == LeaveStatus.APPROVED,
                LeaveRequest.end_date >= today,
                LeaveRequest.end_date <= today + timedelta(days=30)
            )
        ).count()
        
        return LeaveStatsResponse(
            pending_approvals=pending_approvals,
            on_leave_today=on_leave_today,
            policy_violations=policy_violations,
            upcoming_expirations=upcoming_expirations
        )