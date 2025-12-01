<#
Usage examples:
.
# 1) Login and approve leave id 2 (pass credentials as arguments):
.
.
# 2) Use defaults for BaseUrl and status (approved):
.
.
# Notes: supply `-Username` and `-Password` or the script will prompt.
#>
param(
    [string]$Username,
    [string]$Password,
    [int]$LeaveId = 2,
    [ValidateSet('approved','declined','cancelled','pending')][string]$Status = 'approved',
    [string]$Remarks = "Approved by admin via script",
    [string]$BaseUrl = 'http://127.0.0.1:8001'
)

if (-not $Username) { $Username = Read-Host -Prompt "Username" }
if (-not $Password) { $Password = Read-Host -Prompt "Password" -AsSecureString; $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)) }

try {
    $loginBody = @{ username = $Username; password = $Password }
    Write-Host "Logging in as $Username..."
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/x-www-form-urlencoded" -ErrorAction Stop
    $token = $res.access_token
    if (-not $token) { Write-Host "Login did not return a token" -ForegroundColor Red; exit 1 }
    Write-Host "Login succeeded, token acquired."

    $update = @{ status = $Status; remarks = $Remarks } | ConvertTo-Json
    $headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
    Write-Host "Calling approve endpoint for leave id $LeaveId with status '$Status'..."
    $resp = Invoke-RestMethod -Uri "$BaseUrl/api/v1/leaves/admin/$LeaveId/status" -Method Put -Headers $headers -Body $update -ErrorAction Stop
    Write-Host "Response:"; $resp | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception -and ($_.Exception.Response -ne $null)) {
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            if ($stream) {
                $reader = New-Object System.IO.StreamReader($stream)
                $body = $reader.ReadToEnd()
                if ($body) { Write-Host "Response body:`n$body" }
            }
        } catch {
            # ignore reading errors
        }
    }
    exit 1
}
