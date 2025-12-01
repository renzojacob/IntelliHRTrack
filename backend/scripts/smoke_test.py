import sys
import uuid
import httpx
from datetime import date, timedelta

BASE = "http://127.0.0.1:8001"


def fail(msg, resp=None):
    print("ERROR:", msg)
    if resp is not None:
        try:
            print("Response status:", resp.status_code)
            print(resp.text)
        except Exception:
            pass
    sys.exit(1)


def main():
    client = httpx.Client(base_url=BASE, timeout=10.0)

    # 1) Register a unique employee
    uniq = uuid.uuid4().hex[:6]
    username = f"smoke_{uniq}"
    email = f"{username}@example.com"
    password = "Password123!"
    register_body = {
        "username": username,
        "email": email,
        "password": password,
        "first_name": "Smoke",
        "last_name": "Tester",
        "department": "QA",
    }

    r = client.post("/api/v1/auth/register", json=register_body)
    if r.status_code != 200:
        fail("register failed", r)
    print("register OK ->", r.json().get("username") if r.text else "(no body)")

    # 2) Login as employee (form-encoded)
    r = client.post("/api/v1/auth/login", data={"username": username, "password": password})
    if r.status_code != 200:
        fail("employee login failed", r)
    emp_token = r.json().get("access_token")
    if not emp_token:
        fail("employee token missing", r)
    print("employee login OK")

    # 3) Apply for leave
    start = (date.today() + timedelta(days=7)).isoformat()
    end = (date.today() + timedelta(days=9)).isoformat()
    leave_body = {"leave_type": "vacation", "start_date": start, "end_date": end, "reason": "smoke test"}
    headers = {"Authorization": f"Bearer {emp_token}"}
    r = client.post("/api/v1/leaves/employee/apply", json=leave_body, headers=headers)
    if r.status_code not in (200, 201):
        fail("apply leave failed", r)
    leave = r.json()
    leave_id = leave.get("id")
    print("applied leave id", leave_id)

    # 4) Login as admin
    admin_user = "renzo"
    admin_pw = "admin1234"
    r = client.post("/api/v1/auth/login", data={"username": admin_user, "password": admin_pw})
    if r.status_code != 200:
        fail("admin login failed", r)
    admin_token = r.json().get("access_token")
    if not admin_token:
        fail("admin token missing", r)
    print("admin login OK")

    # 5) Approve the leave
    headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
    update = {"status": "approved", "remarks": "Approved by smoke_test"}
    r = client.put(f"/api/v1/leaves/admin/{leave_id}/status", json=update, headers=headers)
    if r.status_code != 200:
        fail("approve failed", r)
    approved = r.json()
    if approved.get("status") != "approved":
        fail("leave status not approved after approval", r)
    if not approved.get("employee"):
        fail("employee enrichment missing in approve response", r)

    print("smoke test succeeded: leave approved and enriched")
    sys.exit(0)


if __name__ == "__main__":
    main()
