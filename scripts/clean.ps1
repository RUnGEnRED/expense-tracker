# Cleanup script for Expense Tracker (Windows PowerShell)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$confirm = Read-Host "[WARN] This will delete the database and build artifacts. Are you sure? (y/n)"
if ($confirm -ne "y") {
    Write-Host "[X] Cleanup cancelled." -ForegroundColor Red
    exit
}

Write-Host "[CLEAN] Cleaning up..." -ForegroundColor Cyan

# 1. Remove database
if (Test-Path "dev.db") {
    Write-Host "[RM] Removing dev.db..." -ForegroundColor Yellow
    Remove-Item "dev.db" -Force
}

if (Test-Path "dev.db-journal") {
    Remove-Item "dev.db-journal" -Force
}

# 2. Remove build artifacts
if (Test-Path ".next") {
    Write-Host "[RM] Removing .next directory..." -ForegroundColor Yellow
    Remove-Item ".next" -Recurse -Force
}

Write-Host "[DONE] Cleanup complete!" -ForegroundColor Green
