import sys, json, traceback
sys.path.insert(0, r'C:\Users\Guest 01\Downloads\INTELLITRACK\backend')
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
try:
    login = client.post('/api/v1/auth/login', data={'username':'renzo','password':'admin1234'})
    print('Login status', login.status_code)
    print(login.text)
    token = login.json().get('access_token')
    headers = {'Authorization': f'Bearer {token}'}
    r = client.get('/api/v1/leaves/admin/all', headers=headers)
    print('Admin all status', r.status_code)
    print(r.text)
except Exception as e:
    print('EXCEPTION', str(e))
    print(traceback.format_exc())
