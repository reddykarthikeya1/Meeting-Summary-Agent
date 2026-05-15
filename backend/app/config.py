from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/meetai"
    REDIS_URL: str = "redis://localhost:6379"
    JWT_SECRET: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    MISTRAL_API_KEY: str = ""
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    UPLOAD_DIR: str = "./uploads"
    TEAMS_TENANT_ID: str = ""
    TEAMS_CLIENT_ID: str = ""
    TEAMS_CLIENT_SECRET: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
