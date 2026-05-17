# Восстановить дампы. Запуск: .\demo\restore.ps1
$ErrorActionPreference = "Stop"

$pgBin = "C:\Program Files\PostgreSQL\18\bin"
if (-not (Test-Path "$pgBin\pg_restore.exe")) {
    $found = Get-ChildItem "C:\Program Files\PostgreSQL" -Directory -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending |
        Select-Object -First 1
    if ($found) { $pgBin = Join-Path $found.FullName "bin" }
    else { throw "Не найден pg_restore." }
}

$env:PGPASSWORD = if ($env:PGPASSWORD) { $env:PGPASSWORD } else { "postgres" }
$host_ = if ($env:PGHOST) { $env:PGHOST } else { "127.0.0.1" }
$user = if ($env:PGUSER) { $env:PGUSER } else { "postgres" }
$demoDir = $PSScriptRoot

function Restore-Db($dbName, $dumpFile) {
    if (-not (Test-Path $dumpFile)) {
        Write-Host "Нет файла $dumpFile — пропуск."
        return
    }
    & "$pgBin\psql.exe" -U $user -h $host_ -c "DROP DATABASE IF EXISTS $dbName;"
    & "$pgBin\psql.exe" -U $user -h $host_ -c "CREATE DATABASE $dbName;"
    & "$pgBin\pg_restore.exe" -U $user -h $host_ -d $dbName --no-owner --role=$user $dumpFile
    Write-Host "OK: восстановлено $dbName"
}

Restore-Db "lms_db" "$demoDir\lms_db.dump"
Restore-Db "lms_messages_db" "$demoDir\lms_messages_db.dump"
