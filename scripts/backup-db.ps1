$env:POSTGRES_USER = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "openmaic" }
$env:POSTGRES_PASSWORD = if ($env:POSTGRES_PASSWORD) { $env:POSTGRES_PASSWORD } else { "openmaic_password" }
$env:POSTGRES_DB = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "openmaic" }
$env:POSTGRES_HOST = if ($env:POSTGRES_HOST) { $env:POSTGRES_HOST } else { "localhost" }
$env:POSTGRES_PORT = if ($env:POSTGRES_PORT) { $env:POSTGRES_PORT } else { "5432" }

$env:BACKUP_DIR = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { "./backups" }
$env:BACKUP_PREFIX = if ($env:BACKUP_PREFIX) { $env:BACKUP_PREFIX } else { "openmaic_backup" }
$env:RETENTION_DAYS = if ($env:RETENTION_DAYS) { [int]$env:RETENTION_DAYS } else { 7 }

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "$($env:BACKUP_DIR)\$($env:BACKUP_PREFIX)_$timestamp.sql"

New-Item -ItemType Directory -Force -Path $env:BACKUP_DIR | Out-Null

Write-Host "Starting backup at $timestamp..."

try {
    $pgDumpPath = "pg_dump"
    if (Get-Command "docker" -ErrorAction SilentlyContinue) {
        docker exec openmaic-postgres-1 pg_dump `
            -h localhost `
            -p $env:POSTGRES_PORT `
            -U $env:POSTGRES_USER `
            -d $env:POSTGRES_DB `
            -F c `
            -b `
            -v `
            --file=$backupFile
    } else {
        & $pgDumpPath `
            -h $env:POSTGRES_HOST `
            -p $env:POSTGRES_PORT `
            -U $env:POSTGRES_USER `
            -d $env:POSTGRES_DB `
            -F c `
            -b `
            -v `
            --file=$backupFile
    }

    Write-Host "Backup completed successfully: $backupFile"

    Write-Host "Cleaning up backups older than $($env:RETENTION_DAYS) days..."
    Get-ChildItem -Path $env:BACKUP_DIR -Filter "$($env:BACKUP_PREFIX)_*.sql" | `
        Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$env:RETENTION_DAYS) } | `
        Remove-Item -Force

    Write-Host "Backup cleanup completed."
} catch {
    Write-Host "Backup failed: $_"
    exit 1
}