import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import get_settings
from app.services import PredictionService


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s :: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    service = PredictionService.from_settings(settings)
    try:
        service.warmup()
    except FileNotFoundError as exc:
        logger.error("Model artifact missing: %s", exc)
    except Exception:
        logger.exception("Failed to load model during startup")

    app.state.prediction_service = service
    yield


settings = get_settings()
app = FastAPI(
    title=settings.project_name,
    version=settings.version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/", include_in_schema=False)
def root() -> dict[str, str]:
    return {
        "name": settings.project_name,
        "version": settings.version,
        "docs": "/docs",
        "api": settings.api_prefix,
    }
