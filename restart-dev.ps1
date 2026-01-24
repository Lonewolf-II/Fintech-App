# restart-dev.ps1
$ports = @(5173, 5174, 5175, 5176, 5000, 5001, 3000, 3001, 4000, 4001)

Sort-Object -InputObject $ports -Unique

Write-Host "Aggressively cleaning up all dev ports..." -ForegroundColor Yellow

# 1. Nuclear option first: Kill all node processes
# This is usually what we want when "restarting" dev environment
Write-Host "Killing ALL node.exe processes to ensure a clean slate..." -ForegroundColor Red
taskkill /F /IM node.exe /T 2>$null

# 2. Wait and verify
Start-Sleep -Seconds 3

# 3. Check specific ports just in case non-node processes are holding them
function Stop-PortProcess {
    param([int]$port)
    $tcp = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($tcp) {
        $id = $tcp.OwningProcess
        Write-Host "Port $port is still in use by PID $id. Killing..." -ForegroundColor Red
        Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
    }
}

foreach ($port in $ports) {
    if (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue) {
        Stop-PortProcess -port $port
    }
}

Start-Sleep -Seconds 2

# Final Verification
$stillInUse = $false
foreach ($port in $ports) {
    if (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue) {
        Write-Host "CRITICAL: Port $port is VALIDLY still in use. Cannot start." -ForegroundColor Magenta
        $stillInUse = $true
    }
}

if ($stillInUse) {
    Write-Host "Failed to clear ports. Please manually check processes." -ForegroundColor Red
    exit 1
}

Write-Host "Ports are clear." -ForegroundColor Green
Write-Host "Starting development server..." -ForegroundColor Cyan

# Start npm run dev:full
npm run dev:full
