"""
Test script to verify standardized logging format for checkin-voice service.

Expected format: [timestamp] [log_level] [service_name] [module] message
Example: [2026-02-15T17:02:36] [INFO] [checkin-voice] [test_logging] This is a test message
"""

# Configure logging first
import logging_config
from loguru import logger


def test_logging_format():
    """Test that logging produces the expected standardized format"""
    
    print("\n=== Testing Checkin-Voice Logging Format ===\n")
    
    # Test different log levels
    logger.debug("This is a debug message from test_logging")
    logger.info("This is an info message from test_logging")
    logger.warning("This is a warning message from test_logging")
    logger.error("This is an error message from test_logging")
    
    # Test with formatted strings
    user_id = "test_user_123"
    session_id = "session_456"
    logger.info(f"Starting voice session for user {user_id}, session {session_id}")
    logger.debug(f"Generated session ID: {session_id}")
    logger.warning(f"DATABASE_URL not configured for user {user_id}")
    logger.error(f"Database health check failed: Connection timeout")
    
    print("\n=== Logging Format Test Complete ===\n")
    print("Expected format: [timestamp] [log_level] [checkin-voice] [module] message")
    print("Verify that all log messages above follow this format.\n")


if __name__ == "__main__":
    test_logging_format()
