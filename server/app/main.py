import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.database import Base, engine
from app.routers import users, posts
from app.seed import seed

app = FastAPI(
    title="FinnetTrust User Dashboard API",
    description="Backend API for the User Dashboard & Post Manager assessment.",
    version="1.0.0",
)

# Design decision: CORS origins come from an env var so the same image
# can run wide-open in local dev (no ALLOWED_ORIGINS set → "*") and
# locked down to the real Vercel domain in production, without a code
# change. allow_credentials is False because this API doesn't use
# cookies/session auth — browsers reject the "*" + credentials=True
# combination outright, so leaving it off keeps the wildcard valid.
_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
ALLOWED_ORIGINS = ["*"] if _origins_env == "*" else [o.strip() for o in _origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Reshape Pydantic's default error payload into a flatter, friendlier
    # structure the frontend can render directly without digging through
    # nested "loc" arrays.
    errors = [
        {"field": ".".join(str(p) for p in e["loc"] if p != "body"), "message": e["msg"]}
        for e in exc.errors()
    ]
    return JSONResponse(status_code=422, content={"detail": "Validation failed", "errors": errors})


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed()


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(users.router)
app.include_router(posts.router)
