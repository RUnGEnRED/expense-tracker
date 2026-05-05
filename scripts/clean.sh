#!/bin/bash

# Cleanup script for Expense Tracker (Linux/macOS/Git Bash)

read -p "[WARN] This will delete the database and build artifacts. Are you sure? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "[X] Cleanup cancelled."
    exit 1
fi

echo "[CLEAN] Cleaning up..."

# 1. Remove database
if [ -f dev.db ]; then
    echo "[RM] Removing dev.db..."
    rm dev.db
fi

if [ -f dev.db-journal ]; then
    rm dev.db-journal
fi

# 2. Remove build artifacts
if [ -d .next ]; then
    echo "[RM] Removing .next directory..."
    rm -rf .next
fi

echo "[DONE] Cleanup complete!"
