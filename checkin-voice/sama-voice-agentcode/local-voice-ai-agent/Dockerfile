# ══════════════════════════════════════════════════════════════
# SAMA WELLNESS - CHECKIN VOICE SERVICE DOCKERFILE
# ══════════════════════════════════════════════════════════════
# Python service for real-time voice AI interactions with local STT/TTS
# ══════════════════════════════════════════════════════════════

FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    postgresql-client \
    curl \
    ffmpeg \
    libavcodec-dev \
    libavformat-dev \
    libavutil-dev \
    libswscale-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv for faster dependency management
RUN pip install --no-cache-dir uv

# Copy pyproject.toml and uv.lock
COPY pyproject.toml uv.lock* ./

# Install Python dependencies using uv
RUN uv pip install --system -r pyproject.toml

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd -m -u 1001 appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health').read()"

# Start the application
CMD ["uvicorn", "api_server:app", "--host", "0.0.0.0", "--port", "8001"]
