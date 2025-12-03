import requests
import numpy as np
import cv2
import os
import json

BASE = 'http://127.0.0.1:8001'
result = {'register': None, 'enroll': None, 'error': None}

# Register a test user
import time

payload = {
    'username': f'test_bio_user_{int(time.time())}',
    'email': f'test_bio_user_{int(time.time())}@example.com',
    'password': 'Password123!',
    'first_name': 'Test',
    'last_name': 'Bio',
    'department': 'Engineering'
}
try:
    r = requests.post(BASE + '/api/v1/auth/register', json=payload, timeout=30)
    result['register'] = {'status': r.status_code}
    try:
        result['register']['body'] = r.json()
    except Exception:
        result['register']['body_text'] = r.text
    emp_code = None
    if isinstance(result['register'].get('body'), dict):
        emp = result['register']['body'].get('employee')
        if isinstance(emp, dict):
            emp_code = emp.get('employee_id')
except Exception as e:
    result['error'] = f'register failed: {type(e).__name__}: {e}'
    emp_code = None

if not emp_code:
    result['error'] = result.get('error') or 'no employee created'
    with open('register_and_post_result.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2)
    print('No employee; aborting. Wrote result file.')
    exit(0)

# Create a dummy white square image
img = np.ones((200,200,3), dtype=np.uint8) * 255
img_path = 'temp_face.jpg'
cv2.imwrite(img_path, img)

# Post to enroll endpoint
files = [('files', (os.path.basename(img_path), open(img_path, 'rb'), 'image/jpeg'))]
data = {'employee_id': emp_code}
try:
    r2 = requests.post(BASE + '/api/v1/biometrics/face/enroll', files=files, data=data, timeout=120)
    result['enroll'] = {'status': r2.status_code}
    try:
        result['enroll']['body'] = r2.json()
    except Exception:
        result['enroll']['body_text'] = r2.text
except Exception as e:
    result['enroll'] = {'error': f'{type(e).__name__}: {e}'}

# cleanup
try:
    os.remove(img_path)
except Exception:
    pass

with open('register_and_post_result.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2)

print('Done. Wrote register_and_post_result.json')
