import sqlite3
import json
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[1] / 'attendance.db'

def rows_to_dicts(cursor):
    cols = [c[0] for c in cursor.description]
    return [dict(zip(cols, row)) for row in cursor.fetchall()]

def main():
    if not DB_PATH.exists():
        print(json.dumps({"error": f"DB not found at {DB_PATH}"}))
        return

    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()

    cur.execute('SELECT id, user_id, employee_id, first_name, last_name, department FROM employees')
    employees = rows_to_dicts(cur)

    cur.execute('SELECT id, employee_id, leave_type, start_date, end_date, status, duration, approved_by, approved_at, remarks FROM leave_requests')
    leaves = rows_to_dicts(cur)

    out = {
        'employees': employees,
        'leave_requests': leaves,
    }

    print(json.dumps(out, default=str, indent=2))

if __name__ == '__main__':
    main()
import sqlite3
from pprint import pprint

DB = '../attendance.db'

con = sqlite3.connect(DB)
con.row_factory = sqlite3.Row
cur = con.cursor()

print('Employees:')
for row in cur.execute('SELECT id, user_id, employee_id, first_name, last_name, department, email FROM employees'):
    pprint(dict(row))

print('\nLeave Requests:')
for row in cur.execute('SELECT id, employee_id, leave_type, start_date, end_date, status, duration, remarks FROM leave_requests'):
    pprint(dict(row))

con.close()
