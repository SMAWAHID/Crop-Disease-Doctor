#!/usr/bin/env bash

set -e

echo "Starting Crop Disease Doctor..."

if [ ! -f "venv/bin/python" ]; then
    echo "ERROR: Virtual environment not found"
    exit 1
fi

source venv/bin/activate

exec python -m uvicorn src.app:app --host 0.0.0.0 --port 8000
