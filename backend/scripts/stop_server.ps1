param(
    [int]$Port = 8001
)

$scriptParent = Split-Path -Parent $PSScriptRoot
$backendDir = $scriptParent
$pidFile = Join-Path $backendDir 'uvicorn.pid'

if (Test-Path $pidFile) {
    try {
        $pid = Get-Content $pidFile | Select-Object -First 1
        Stop-Process -Id ([int]$pid) -Force -ErrorAction Stop
        Remove-Item $pidFile -ErrorAction SilentlyContinue
        Write-Host "Stopped uvicorn process PID $pid"
        exit 0
    } catch {
        Write-Host "Failed to stop process by PID from pidfile: $_" -ForegroundColor Yellow
    }
}

# Fallback: stop uvicorn processes bound to the port (best-effort)
$net = netstat -ano | Select-String ":$Port"
if ($net) {
    $pids = $net -replace '^.*\s+(\d+)$','$1' | Select-Object -Unique
    foreach ($pidItem in $pids) {
        try { Stop-Process -Id [int]$pidItem -Force; Write-Host "Stopped process PID $pidItem" } catch { }
    }
    Write-Host "Stopped processes bound to port $Port"
} else {
    Write-Host "No processes found bound to port $Port"
}
