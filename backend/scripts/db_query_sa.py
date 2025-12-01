from app.core.database import SessionLocal
from app.models.leave import LeaveRequest
from app.models.user import Employee, User

db = SessionLocal()
leaves = db.query(LeaveRequest).order_by(LeaveRequest.submitted_at.desc()).all()
for leave in leaves:
    emp = db.query(Employee).filter(Employee.id == leave.employee_id).first()
    print('Leave', leave.id, 'employee_id', leave.employee_id, 'emp', bool(emp))
    if emp:
        user = db.query(User).filter(User.id == emp.user_id).first()
        print('  emp.id', emp.id, 'emp.employee_id', emp.employee_id, 'user', user.username if user else None)

db.close()
