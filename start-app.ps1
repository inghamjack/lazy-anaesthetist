$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$venvPython = Join-Path $projectRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "Creating virtual environment..."
    python -m venv (Join-Path $projectRoot ".venv")
}

if (-not (Test-Path $venvPython)) {
    throw "Virtual environment python not found at $venvPython"
}

$backendRequirements = Join-Path $projectRoot "backend\requirements.txt"
$uiRequirements = Join-Path $projectRoot "ui\requirements.txt"

Write-Host "Installing/updating dependencies..."
& $venvPython -m pip install -r $backendRequirements
& $venvPython -m pip install -r $uiRequirements

$escapedRoot = $projectRoot.Replace("'", "''")
$escapedVenvPython = $venvPython.Replace("'", "''")

$backendCommand = "Set-Location '$escapedRoot'; & '$escapedVenvPython' -m uvicorn backend.main:app --reload"
$uiCommand = "Set-Location '$escapedRoot'; & '$escapedVenvPython' -m streamlit run ui/app.py"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand | Out-Null
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", $uiCommand | Out-Null
Start-Sleep -Seconds 2

Start-Process "http://127.0.0.1:8000/docs" | Out-Null
Start-Process "http://localhost:8501" | Out-Null

Write-Host ""
Write-Host "Started:"
Write-Host " - Backend API: http://127.0.0.1:8000/docs"
Write-Host " - UI:          http://localhost:8501"
Write-Host ""
Write-Host "Close the two spawned PowerShell windows to stop the app."
