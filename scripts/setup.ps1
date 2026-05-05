# Setup script for Expense Tracker (Windows PowerShell)

# Set output encoding to UTF8 to avoid character issues
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "[INFO] Starting setup for Expense Tracker..." -ForegroundColor Cyan

# 1. Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "[SETUP] Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
} else {
    Write-Host "[OK] .env file already exists." -ForegroundColor Green
}

# 2. Install dependencies
Write-Host "[DEP] Installing dependencies..." -ForegroundColor Yellow
npm install

# 3. Generate Prisma Client
Write-Host "[GEN] Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# 4. Initialize database
Write-Host "[DB] Initializing database schema..." -ForegroundColor Yellow
npx prisma db push

# 5. Seed database (Optional)
$seedConfirm = Read-Host "[SEED] Do you want to seed the database with initial sample data? (y/n)"
if ($seedConfirm -eq "y") {
    Write-Host "[SEED] Seeding database..." -ForegroundColor Yellow
    npx prisma db seed
} else {
    Write-Host "[SEED] Skipping database seeding." -ForegroundColor Gray
}

Write-Host "[DONE] Setup complete! You can now run 'npm run dev'." -ForegroundColor Green
