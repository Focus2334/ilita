# Создать дампы для демо. Запуск из корня репозитория: .\demo\dump.ps1
$ErrorActionPreference = "Stop"

$pgBin = "C:\Program Files\PostgreSQL\18\bin"
if (-not (Test-Path "$pgBin\pg_dump.exe")) {
    $found = Get-ChildItem "C:\Program Files\PostgreSQL" -Directory -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending |
        Select-Object -First 1
    if ($found) { $pgBin = Join-Path $found.FullName "bin" }
    else { throw "Не найден pg_dump. Установите PostgreSQL или укажите путь в `$pgBin." }
}

$env:PGPASSWORD = if ($env:PGPASSWORD) { $env:PGPASSWORD } else { "postgres" }
$host_ = if ($env:PGHOST) { $env:PGHOST } else { "127.0.0.1" }
$user = if ($env:PGUSER) { $env:PGUSER } else { "postgres" }

$demoDir = $PSScriptRoot
New-Item -ItemType Directory -Force -Path $demoDir | Out-Null

& "$pgBin\pg_dump.exe" -U $user -h $host_ -Fc -f "$demoDir\lms_db.dump" lms_db
Write-Host "OK: $demoDir\lms_db.dump"

if (& "$pgBin\psql.exe" -U $user -h $host_ -lqt 2>$null | Select-String -Pattern "lms_messages_db") {
    & "$pgBin\pg_dump.exe" -U $user -h $host_ -Fc -f "$demoDir\lms_messages_db.dump" lms_messages_db
    Write-Host "OK: $demoDir\lms_messages_db.dump"
} else {
    Write-Host "Пропуск: БД lms_messages_db не найдена (создайте по README, если нужен чат)."
}
