# Start the Crop Disease Doctor Application

Write-Host "Starting Crop Disease Doctor..." -ForegroundColor Green
Write-Host ""

# Check if virtual environment exists
if (-Not (Test-Path ".venv\Scripts\python.exe")) {
    Write-Host "Error: Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please create it first with: python -m venv .venv" -ForegroundColor Yellow
    exit 1
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& .venv\Scripts\Activate.ps1

# Start the server
Write-Host ""
Write-Host "Starting Crop Disease Doctor (Production Mode)..." -ForegroundColor Cyan
Write-Host "Frontend (React + Vite) will be available at: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "API documentation at: http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Note: If you change frontend code, run 'npm run build' in 'frontend' folder to update." -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Run the app
python src/app.py
