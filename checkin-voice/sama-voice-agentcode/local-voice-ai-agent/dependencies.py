"""
Authentication dependencies for checkin-voice service.
Extracts user context from headers injected by the API Gateway.
"""

from fastapi import Header, HTTPException
from typing import Optional

# Import configured logger
from loguru import logger


class UserContext:
    """User context extracted from API Gateway headers"""
    
    def __init__(self, user_id: str, email: Optional[str] = None, roles: Optional[str] = None):
        self.user_id = user_id
        self.email = email
        self.roles = roles.split(',') if roles else []
    
    def __repr__(self):
        return f"UserContext(user_id={self.user_id}, email={self.email}, roles={self.roles})"


async def get_current_user(
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
    x_user_email: Optional[str] = Header(None, alias="x-user-email"),
    x_user_roles: Optional[str] = Header(None, alias="x-user-roles")
) -> UserContext:
    """
    Extract user context from headers injected by API Gateway.
    
    The API Gateway validates JWT tokens and injects user context as headers:
    - X-User-Id: User's unique identifier
    - X-User-Email: User's email address
    - X-User-Roles: Comma-separated list of user roles
    
    This function accepts the user context without re-validating tokens,
    as authentication is handled by the API Gateway.
    
    Args:
        x_user_id: User ID from X-User-Id header
        x_user_email: User email from X-User-Email header
        x_user_roles: User roles from X-User-Roles header
    
    Returns:
        UserContext: Object containing user information
    
    Raises:
        HTTPException: 401 if user context is missing (unauthorized)
    """
    if not x_user_id:
        logger.warning("Request received without X-User-Id header")
        raise HTTPException(
            status_code=401,
            detail="Unauthorized: User context not provided by API Gateway"
        )
    
    logger.debug(f"Extracted user context: user_id={x_user_id}, email={x_user_email}")
    
    return UserContext(
        user_id=x_user_id,
        email=x_user_email,
        roles=x_user_roles
    )


async def get_optional_user(
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
    x_user_email: Optional[str] = Header(None, alias="x-user-email"),
    x_user_roles: Optional[str] = Header(None, alias="x-user-roles")
) -> Optional[UserContext]:
    """
    Extract user context from headers, but return None if not present.
    
    This is useful for endpoints that can work with or without authentication.
    
    Args:
        x_user_id: User ID from X-User-Id header
        x_user_email: User email from X-User-Email header
        x_user_roles: User roles from X-User-Roles header
    
    Returns:
        Optional[UserContext]: User context if headers present, None otherwise
    """
    if not x_user_id:
        return None
    
    logger.debug(f"Extracted optional user context: user_id={x_user_id}")
    
    return UserContext(
        user_id=x_user_id,
        email=x_user_email,
        roles=x_user_roles
    )
