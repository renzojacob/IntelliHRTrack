param(
    [int]$Port = 8001
)

$scriptParent = Split-Path -Parent $PSScriptRoot
$pythonGuess = Join-Path $scriptParent "..\env\Scripts\python.exe"
if (Test-Path $pythonGuess) { $pythonExe = (Resolve-Path $pythonGuess).Path } else { $pythonExe = "python" }

# Kill any process already listening on the port (best-effort)
$net = netstat -ano | Select-String ":$Port"
if ($net) {
    $pids = $net -replace '^.*\s+(\d+)$','$1' | Select-Object -Unique
    foreach ($pidItem in $pids) {
        try { Stop-Process -Id [int]$pidItem -Force -ErrorAction Stop; Write-Host "Stopped process PID $pidItem" } catch { }
    }
}

# Start uvicorn using the backend folder as working dir
$backendDir = $scriptParent
$argList = @('-m','uvicorn','main:app','--host','127.0.0.1','--port',$Port)
$p = Start-Process -FilePath $pythonExe -ArgumentList $argList -WorkingDirectory $backendDir -PassThru
Start-Sleep -Milliseconds 800
if ($p -and !$p.HasExited) {
    $pidFile = Join-Path $backendDir 'uvicorn.pid'
    $p.Id | Out-File -FilePath $pidFile -Encoding ascii
    Write-Host "Started uvicorn (PID $($p.Id)) on http://127.0.0.1:$Port"
} else {
    Write-Host "Failed to start uvicorn. Check the console output for errors." -ForegroundColor Red
}
