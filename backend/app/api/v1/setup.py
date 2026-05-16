"""
Setup wizard endpoints.
Allows first-time configuration of database, AI providers, and admin account.
"""
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(tags=["Setup"])

CONFIG_FILE = Path(__file__).parent.parent.parent.parent / "config.json"


class DatabaseConfig(BaseModel):
    host: str = "localhost"
    port: int = 5432
    user: str = "postgres"
    password: str = "postgres"
    database: str = "meetai"


class AIProviderSetup(BaseModel):
    provider: str
    api_key: str = ""
    base_url: str = ""
    model: str = ""


class SetupRequest(BaseModel):
    database: DatabaseConfig | None = None
    ai_providers: list[AIProviderSetup] = []
    admin_email: str = "admin@meetai.com"
    admin_password: str = "Meetai@2026"
    admin_name: str = "Admin"


def load_config() -> dict:
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text())
    return {}


def save_config(config: dict):
    CONFIG_FILE.write_text(json.dumps(config, indent=2))


@router.get("/status")
async def setup_status():
    """Check if the app has been configured."""
    config = load_config()
    return {
        "is_configured": config.get("is_configured", False),
        "has_database": bool(config.get("database")),
        "has_ai_provider": bool(config.get("ai_providers")),
    }


@router.post("/configure")
async def configure_app(setup: SetupRequest):
    """Save initial configuration."""
    config = load_config()

    if setup.database:
        config["database"] = {
            "host": setup.database.host,
            "port": setup.database.port,
            "user": setup.database.user,
            "password": setup.database.password,
            "database": setup.database.database,
            "url": f"postgresql+asyncpg://{setup.database.user}:{setup.database.password}@{setup.database.host}:{setup.database.port}/{setup.database.database}",
        }

    if setup.ai_providers:
        config.setdefault("ai_providers", {})
        for prov in setup.ai_providers:
            config["ai_providers"][prov.provider] = {
                "api_key": prov.api_key,
                "base_url": prov.base_url,
                "model": prov.model,
            }

    config["admin"] = {
        "email": setup.admin_email,
        "password": setup.admin_password,
        "name": setup.admin_name,
    }
    config["is_configured"] = True

    save_config(config)

    return {
        "status": "configured",
        "message": "Application configured successfully. Restart the backend for database changes to take effect.",
    }


@router.post("/test-database")
async def test_database(config: DatabaseConfig):
    """Test a database connection."""
    import sqlalchemy
    url = f"postgresql+asyncpg://{config.user}:{config.password}@{config.host}:{config.port}/{config.database}"
    try:
        engine = sqlalchemy.create_engine(url.replace("+asyncpg", "+psycopg2"))
        with engine.connect() as conn:
            conn.execute(sqlalchemy.text("SELECT 1"))
        engine.dispose()
        return {"success": True, "message": f"Connected to {config.database} on {config.host}:{config.port}"}
    except Exception as e:
        return {"success": False, "message": f"Connection failed: {str(e)}"}


@router.get("/config")
async def get_config():
    """Get current configuration (without sensitive values)."""
    config = load_config()
    safe = {
        "is_configured": config.get("is_configured", False),
        "database": {
            "host": config.get("database", {}).get("host", ""),
            "port": config.get("database", {}).get("port", 5432),
            "database": config.get("database", {}).get("database", ""),
        } if config.get("database") else None,
        "ai_providers": {
            name: {"has_key": bool(v.get("api_key")), "base_url": v.get("base_url", ""), "model": v.get("model", "")}
            for name, v in config.get("ai_providers", {}).items()
        },
    }
    return safe
