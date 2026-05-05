#!/bin/bash

# Setup script for Expense Tracker (Linux/macOS/Git Bash)

echo "[INFO] Starting setup for Expense Tracker..."

# 1. Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "[SETUP] Creating .env file from .env.example..."
    cp .env.example .env
else
    echo "[OK] .env file already exists."
fi

# 2. Install dependencies
echo "[DEP] Installing dependencies..."
npm install

# 3. Generate Prisma Client
echo "[GEN] Generating Prisma Client..."
npx prisma generate

# 4. Initialize database
echo "[DB] Initializing database schema..."
npx prisma db push

# 5. Seed database (Optional)
read -p "[SEED] Do you want to seed the database with initial sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "[SEED] Seeding database..."
    npx prisma db seed
else
    echo "[SEED] Skipping database seeding."
fi

echo "[DONE] Setup complete! You can now run 'npm run dev'."
