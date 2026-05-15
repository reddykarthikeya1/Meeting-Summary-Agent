"""Authentication service."""
import uuid
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.core.security import hash_password, verify_password, create_access_token, decode_token
from app.core.exceptions import NotFoundError, UnauthorizedError, ValidationError


class AuthService:
    """Service for user authentication and registration."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: UserCreate) -> tuple[User, str]:
        """Register a new user.

        Args:
            data: User registration data.

        Returns:
            Tuple of (User, access_token).

        Raises:
            ValidationError: If email already exists.
        """
        # Check if email already exists
        existing = await self.db.execute(select(User).where(User.email == data.email))
        if existing.scalar_one_or_none():
            raise ValidationError("An account with this email already exists.")

        user = User(
            id=uuid.uuid4(),
            email=data.email,
            name=data.name,
            password_hash=hash_password(data.password),
            role="user",
            preferences={},
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)

        token = create_access_token(data={"sub": str(user.id)})
        return user, token

    async def login(self, data: UserLogin) -> tuple[User, str]:
        """Authenticate a user with email and password.

        Args:
            data: Login credentials.

        Returns:
            Tuple of (User, access_token).

        Raises:
            UnauthorizedError: If credentials are invalid.
        """
        result = await self.db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(data.password, user.password_hash):
            raise UnauthorizedError("Invalid email or password.")

        token = create_access_token(data={"sub": str(user.id)})
        return user, token

    async def get_user_by_id(self, user_id: uuid.UUID) -> User:
        """Fetch a user by ID.

        Raises:
            NotFoundError: If user not found.
        """
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundError("User", str(user_id))
        return user
