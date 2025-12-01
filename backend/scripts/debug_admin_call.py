import sys, json, traceback
sys.path.insert(0, r'C:\Users\Guest 01\Downloads\INTELLITRACK\backend')
from app.core.database import SessionLocal
from app.crud.leave import get_all_leave_requests_enriched

db = SessionLocal()
try:
    res = get_all_leave_requests_enriched(db)
    print(json.dumps(res, default=str, indent=2))
except Exception as e:
    print('ERROR', str(e))
    print(traceback.format_exc())
finally:
    db.close()
