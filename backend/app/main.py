from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .models import ComputeRequest, ComputeResponse, ErrorResponse, ScoreDescriptor
from .services import compute_scores, list_scores

app = FastAPI(
    title="Lazy Anaesthetist Backend",
    version="0.2.0",
    description="Perioperative risk scoring API.",
)


@app.exception_handler(RequestValidationError)
def request_validation_exception_handler(_: object, exc: RequestValidationError) -> JSONResponse:
    issues = []
    for err in exc.errors():
        location = ".".join(str(loc) for loc in err.get("loc", []))
        issues.append({"field": location, "message": err.get("msg", "Invalid value")})
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(detail="Request validation failed", errors=issues).model_dump(),
    )


@app.get("/scores", response_model=list[ScoreDescriptor], tags=["scores"])
def get_scores() -> list[ScoreDescriptor]:
    return list_scores()


@app.post(
    "/compute",
    response_model=ComputeResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid score inputs"},
        422: {"model": ErrorResponse, "description": "Malformed request payload"},
    },
    tags=["scores"],
)
def compute(request: ComputeRequest) -> ComputeResponse:
    try:
        return compute_scores(request)
    except ValueError as exc:
        payload = exc.args[0] if exc.args else "Invalid request"
        if isinstance(payload, dict):
            detail = payload.get("detail", "Invalid request")
            errors = payload.get("errors", [])
            return JSONResponse(status_code=400, content=ErrorResponse(detail=detail, errors=errors).model_dump())
        return JSONResponse(status_code=400, content=ErrorResponse(detail=str(payload), errors=[]).model_dump())
