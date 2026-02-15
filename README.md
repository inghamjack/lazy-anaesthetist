# Lazy Anaesthetist

## 1) Setup

```bash
python -m venv .venv
. .venv/Scripts/activate
python -m pip install -r backend/requirements.txt
python -m pip install -r ui/requirements.txt
```

## 2) Run Backend API

```bash
uvicorn backend.main:app --reload
```

API docs: `http://127.0.0.1:8000/docs`

## 3) Run Python UI

```bash
streamlit run ui/app.py
```

UI: `http://localhost:8501`

## Quick Start (Windows PowerShell)

From the project root, run:

```powershell
.\start-app.ps1
```

This starts backend + UI in separate PowerShell windows and opens both URLs.

## 4) Run Tests

```bash
python -m pytest -q backend/tests
```
