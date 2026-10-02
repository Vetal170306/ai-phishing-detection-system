"""
Main FastAPI Application Entrypoint
AI-Based Phishing Website Detection System
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.v1 import api_v1_router
from backend.app.core.config import settings
from backend.app.core.database import Base, engine
from backend.app.ml.predictor import PhishingPredictor


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist and pre-load ML model into memory
    Base.metadata.create_all(bind=engine)
    PhishingPredictor.get_instance()
    yield
    # Shutdown logic if needed


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="High-performance, SSRF-safe AI phishing website detection API.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"An internal server error occurred: {str(exc)}"}
    )

# Mount API routers
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/")
def root_redirect():
    return {
        "project": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
