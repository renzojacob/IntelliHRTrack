import os
import sqlite3

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'attendance.db'))
print('DB:', DB_PATH)
if not os.path.exists(DB_PATH):
    print('DB not found')
    raise SystemExit(1)

con = sqlite3.connect(DB_PATH)
cur = con.cursor()
try:
    cur.execute('SELECT id, employee_id, first_name, last_name, email FROM employees ORDER BY id')
    rows = cur.fetchall()
    if not rows:
        print('No employees found')
    for r in rows:
        print('id={:>3} code={} name={} {} email={}'.format(r[0], r[1], r[2], r[3], r[4]))
finally:
    con.close()