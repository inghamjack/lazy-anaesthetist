# Backend

FastAPI backend scaffold with score listing and score computation endpoints.

## Run

```bash
python -m venv .venv
. .venv/Scripts/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

## Test

```bash
python -m pytest -q backend/tests
```
