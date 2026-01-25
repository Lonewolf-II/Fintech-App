
# Create backups directory if it doesn't exist
$backupDir = "$PSScriptRoot\..\backups"
if (!(Test-Path -Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "Created backups directory at $backupDir"
}

# Get current timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Backup Central Database
$centralBackupFile = "$backupDir\fintech_central_$timestamp.sql"
Write-Host "Backing up Central DB to $centralBackupFile..."
try {
    docker exec fintech-postgres pg_dump -U fintech_user fintech_central > $centralBackupFile
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Central DB backup successful." -ForegroundColor Green
    }
    else {
        Write-Host "❌ Central DB backup failed." -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Error backing up Central DB: $_" -ForegroundColor Red
}

# Backup Main Database (fintech_db)
$mainBackupFile = "$backupDir\fintech_db_$timestamp.sql"
Write-Host "Backing up Main DB to $mainBackupFile..."
try {
    docker exec fintech-postgres pg_dump -U fintech_user fintech_db > $mainBackupFile
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Main DB backup successful." -ForegroundColor Green
    }
    else {
        Write-Host "❌ Main DB backup failed." -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Error backing up Tenant DB: $_" -ForegroundColor Red
}

