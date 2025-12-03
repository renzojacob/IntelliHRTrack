import os
import sqlite3
import json

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'attendance.db')
DB_PATH = os.path.abspath(DB_PATH)
print('DB path:', DB_PATH)
if not os.path.exists(DB_PATH):
    print('DB file not found')
    raise SystemExit(1)

con = sqlite3.connect(DB_PATH)
cur = con.cursor()

# Check tables
try:
    cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [r[0] for r in cur.fetchall()]
    print('Tables:', tables)
except Exception as e:
    print('Error listing tables:', e)

# Check face_embeddings
try:
    cur.execute('SELECT COUNT(*) FROM face_embeddings')
    total = cur.fetchone()[0]
    print('Total face_embeddings rows:', total)

    cur.execute('SELECT id, employee_id, embedding, created_at FROM face_embeddings ORDER BY id DESC LIMIT 10')
    rows = cur.fetchall()
    for r in rows:
        id_, emp_id, emb_text, created = r
        try:
            emb = json.loads(emb_text)
            emb_len = len(emb)
        except Exception:
            emb_len = 'invalid'
        print(f'id={id_} employee_id={emp_id} embedding_len={emb_len} created_at={created}')
except Exception as e:
    print('Error querying face_embeddings:', e)

con.close()