"""
Simple test script to verify the health endpoint implementation.
This tests the health check logic without requiring a running server.
"""

import os
import sys
from unittest.mock import patch, MagicMock
from datetime import datetime


def test_health_endpoint_structure():
    """Test that the health endpoint returns the correct structure"""
    # Import the app
    from api_server import app
    from fastapi.testclient import TestClient
    
    client = TestClient(app)
    
    # Mock the database connection to avoid actual DB calls
    with patch('sqlalchemy.create_engine') as mock_engine:
        # Mock successful database connection
        mock_connection = MagicMock()
        mock_engine.return_value.connect.return_value.__enter__.return_value = mock_connection
        
        # Set DATABASE_URL for the test
        os.environ['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test'
        
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        assert "status" in data
        assert "timestamp" in data
        assert "service" in data
        assert "version" in data
        assert "checks" in data
        
        # Verify field values
        assert data["service"] == "checkin-voice"
        assert data["version"] == "1.0.0"
        assert "database" in data["checks"]
        
        # Verify status is one of the allowed values
        assert data["status"] in ["healthy", "degraded", "unhealthy"]
        
        # Verify timestamp is ISO 8601 format
        assert data["timestamp"].endswith("Z")
        datetime.fromisoformat(data["timestamp"].replace("Z", "+00:00"))
        
        print("✓ Health endpoint structure test passed")
        print(f"Response: {data}")


def test_health_endpoint_database_connected():
    """Test health endpoint when database is connected"""
    from api_server import app
    from fastapi.testclient import TestClient
    
    client = TestClient(app)
    
    with patch('sqlalchemy.create_engine') as mock_engine:
        # Mock successful database connection
        mock_connection = MagicMock()
        mock_engine.return_value.connect.return_value.__enter__.return_value = mock_connection
        
        os.environ['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test'
        
        response = client.get("/health")
        data = response.json()
        
        assert data["status"] == "healthy"
        assert data["checks"]["database"] == "connected"
        
        print("✓ Database connected test passed")


def test_health_endpoint_database_disconnected():
    """Test health endpoint when database connection fails"""
    from api_server import app
    from fastapi.testclient import TestClient
    from sqlalchemy.exc import OperationalError
    
    client = TestClient(app)
    
    with patch('sqlalchemy.create_engine') as mock_engine:
        # Mock database connection failure
        mock_engine.return_value.connect.side_effect = OperationalError("Connection failed", None, None)
        
        os.environ['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test'
        
        response = client.get("/health")
        data = response.json()
        
        assert data["status"] == "unhealthy"
        assert data["checks"]["database"] == "disconnected"
        
        print("✓ Database disconnected test passed")


def test_health_endpoint_no_database_url():
    """Test health endpoint when DATABASE_URL is not configured"""
    from api_server import app
    from fastapi.testclient import TestClient
    
    client = TestClient(app)
    
    # Remove DATABASE_URL
    if 'DATABASE_URL' in os.environ:
        del os.environ['DATABASE_URL']
    
    response = client.get("/health")
    data = response.json()
    
    assert data["status"] == "degraded"
    assert data["checks"]["database"] == "disconnected"
    
    print("✓ No DATABASE_URL test passed")


if __name__ == "__main__":
    print("Running health endpoint tests...\n")
    
    try:
        test_health_endpoint_structure()
        test_health_endpoint_database_connected()
        test_health_endpoint_database_disconnected()
        test_health_endpoint_no_database_url()
        
        print("\n✅ All tests passed!")
        sys.exit(0)
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
