"""
Duolingo Clone – FastAPI Application Entry Point.

Run with:
    uvicorn app.main:app --reload
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.seed import seed_database
from app.routers import users, courses, lessons, leaderboard, achievements, social


# ---------------------------------------------------------------------------
# Lifespan – initialise the DB on startup
# ---------------------------------------------------------------------------

# Call DB initialization directly so serverless functions initialize /tmp/app.db
try:
    init_db()
    seed_database()
except Exception as e:
    print(f"Startup DB Error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    init_db()
    seed_database()
    yield


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Duolingo Clone API",
    description="A full-featured language-learning platform API built with FastAPI & SQLite.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS – allow the frontend (and Swagger UI) to talk to the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Register routers – all under /api
# ---------------------------------------------------------------------------
API = "/api"

app.include_router(users.router,        prefix=API)
app.include_router(courses.router,      prefix=API)
app.include_router(lessons.router,      prefix=API)
app.include_router(leaderboard.router,  prefix=API)
app.include_router(achievements.router, prefix=API)
app.include_router(social.router,       prefix=API)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
def root() -> dict:
    return {"status": "ok", "app": "Duolingo Clone API", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
def health_check() -> dict:
    return {"status": "healthy"}
