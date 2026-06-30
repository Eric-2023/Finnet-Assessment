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

# Design decision: wide-open CORS is fine for an assessment app talking
# to a known frontend; a production deployment would restrict
# allow_origins to the actual frontend domain(s).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
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
