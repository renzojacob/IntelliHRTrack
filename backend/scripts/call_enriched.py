from app.crud.leave import get_all_leave_requests_enriched
from app.core.database import SessionLocal

db = SessionLocal()
res = get_all_leave_requests_enriched(db)
import json
print(json.dumps(res, default=str, indent=2))
