"""
Logging configuration for checkin-voice service.
Provides standardized logging format consistent with other microservices.
"""

from loguru import logger
import sys
import os


def configure_logging(log_level: str = None):
    """
    Configure loguru with standardized format for checkin-voice service.
    
    Format: [timestamp] [log_level] [service_name] [module] message
    Example: [2026-02-15T17:02:36] [INFO] [checkin-voice] [api_server] Starting server...
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
                  If None, reads from LOG_LEVEL environment variable (default: INFO)
    """
    # Get log level from parameter or environment variable
    if log_level is None:
        log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    
    # Remove default handler
    logger.remove()
    
    # Add custom handler with standardized format
    logger.add(
        sys.stderr,
        format="[{time:YYYY-MM-DDTHH:mm:ss}] [{level}] [checkin-voice] [{name}] {message}",
        level=log_level,
        colorize=True,
        backtrace=True,
        diagnose=True
    )
    
    logger.info(f"Logging configured with level: {log_level}")


# Configure logging when module is imported
configure_logging()
