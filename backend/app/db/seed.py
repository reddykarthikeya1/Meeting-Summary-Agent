"""
Database seeder.
Creates initial admin user and default data on first startup.
"""
import uuid
import logging
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import async_session_factory
from app.models.user import User
from app.core.security import hash_password

logger = logging.getLogger(__name__)

# Master admin credentials
ADMIN_EMAIL = "admin@meetai.com"
ADMIN_PASSWORD = "Meetai@2026"
ADMIN_NAME = "Admin"


async def seed_database():
    """Seed the database with initial data if empty."""
    async with async_session_factory() as session:
        # Check if admin user already exists
        result = await session.execute(
            select(User).where(User.email == ADMIN_EMAIL)
        )
        existing = result.scalar_one_or_none()

        if existing:
            logger.info("Admin user already exists, skipping seed.")
            return

        # Create admin user
        admin = User(
            id=uuid.uuid4(),
            email=ADMIN_EMAIL,
            name=ADMIN_NAME,
            password_hash=hash_password(ADMIN_PASSWORD),
            role="admin",
            avatar_url=None,
            preferences={},
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        session.add(admin)
        await session.commit()

        logger.info(f"Seeded admin user: {ADMIN_EMAIL}")
        logger.info("Admin credentials -> Email: admin@meetai.com | Password: Meetai@2026")
