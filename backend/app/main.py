import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.api.v1.router import api_router
from app.core.exceptions import register_exception_handlers

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup: create tables and seed database
    try:
        from app.db.session import engine
        from app.db.base import Base
        import app.models  # noqa: F401 — ensure all models are registered

        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created/verified.")

        from app.db.seed import seed_database
        await seed_database()
    except Exception as e:
        logger.warning(f"Database setup skipped: {e}")
    yield
    # shutdown


app = FastAPI(title="MeetAI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "healthy"}
