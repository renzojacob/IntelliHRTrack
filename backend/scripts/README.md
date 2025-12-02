Purpose
-------
This README explains how to run the backend server, run the smoke test, and capture server logs and HTTP responses for debugging. All examples assume you're on Windows PowerShell and working from the `backend` directory of the repository.

Prerequisites
-------------
- A Python virtual environment for the project (the repo includes `env/`).
- Activate the venv before running the commands below:

PowerShell
```
& "..\env\Scripts\Activate.ps1"
```

Start the FastAPI app (foreground, capture stdout/stderr)
-----------------------------------------------
Run uvicorn in the foreground and tee output to a log so you can watch live and preserve a copy:

PowerShell
```
& '..\env\Scripts\python.exe' -m uvicorn main:app --host 127.0.0.1 --port 8001 2>&1 | Tee-Object -FilePath .\uvicorn_foreground.log
```

Start the FastAPI app (background)
----------------------------------
If you prefer to start uvicorn in the background and detach the console, redirect output to a file:

PowerShell
```
& '..\env\Scripts\python.exe' -m uvicorn main:app --host 127.0.0.1 --port 8001 > .\uvicorn_capture.log 2>&1
```

Run the smoke test (end-to-end apply -> approve)
------------------------------------------------
The repo contains `scripts/smoke_test.py` which performs a quick register -> apply -> approve flow.

PowerShell
```
& '..\env\Scripts\python.exe' .\scripts\smoke_test.py
```

Capture HTTP responses for a specific endpoint (admin examples)
-----------------------------------------------------------------
Use the following snippet to call an endpoint and save the raw response body to a file. Replace `$token` with a valid JWT `access_token` obtained from `/api/v1/auth/login`.

PowerShell
```
$headers = @{ Authorization = "Bearer $token" }
try {
  Invoke-RestMethod -Uri 'http://127.0.0.1:8001/api/v1/leaves/admin/all' -Method Get -Headers $headers -ErrorAction Stop
} catch {
  if ($_.Exception.Response) {
    $sr = $_.Exception.Response.GetResponseStream(); $r = New-Object System.IO.StreamReader($sr); $r.ReadToEnd() | Out-File .\scripts\capture_http_admin_all.json -Encoding utf8
  } else { $_.Exception.Message }
}
```

If the call succeeds you can also capture the normal output like this:

PowerShell
```
Invoke-RestMethod -Uri 'http://127.0.0.1:8001/api/v1/leaves/admin/all' -Method Get -Headers $headers | ConvertTo-Json -Depth 5 | Out-File .\scripts\capture_http_admin_all.json -Encoding UTF8
```

Inspect the SQLite database
---------------------------
You can inspect the `attendance.db` file using the included helper or sqlite3 if installed.

Run the included Python helper (prints some DB info):

PowerShell
```
& '..\env\Scripts\python.exe' .\scripts\db_inspect.py
```

Or use the sqlite3 CLI:

PowerShell
```
sqlite3 .\attendance.db
-- Then use SQL queries like: SELECT * FROM users LIMIT 5;
```

What to capture when reporting a server error (500)
--------------------------------------------------
- The `uvicorn_foreground.log` file (or `uvicorn_capture.log`).
- The captured HTTP response body file (e.g. `scripts\capture_http_admin_all.json`).
- The `smoke_*` JSON files under `scripts/` if you ran the smoke test.
- Exact steps and commands you ran (copy/paste the PowerShell commands above).

Notes
-----
- All example commands assume the current working directory is `backend`.
- The backend expects Authorization headers for protected endpoints: add `Authorization: Bearer <access_token>`.
- If you see intermittent 500s, prefer the foreground uvicorn run so tracebacks are printed to the log and can be pasted into an issue.

Next steps (suggested)
----------------------
- Convert `scripts/smoke_test.py` into a CI job (GitHub Actions) so it runs on pushes.
- If you want, I can add a short GitHub Actions workflow that runs the smoke test on `main`.

If you need a different OS example (bash/macOS) tell me and I will add it.
