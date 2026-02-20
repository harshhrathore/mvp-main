#!/bin/bash

# Session Pooler Connection (IPv4 compatible)
export DATABASE_URL="postgresql+asyncpg://postgres.jwaxeeypxucbhktzreow:Samawellness.ai@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

export GOOGLE_API_KEY="AIzaSyBcymEf90bHQXcoXwGTW2Z4Q9A-uhdSfJI"
export LLM_API_URL="https://generativelanguage.googleapis.com"
export ASSEMBLYAI_API_KEY="b0def8adbc1642caae3b3274058a54d3"
export ELEVENLABS_API_KEY="sk_4c1d2df429933489dab5ee28cb53d3366fb7b4443f62be36"
export SECRET_KEY="49eab09a9d8322c39238fb76132f85a06638f644b9e4fc0c61092aa5a5c9d8eb"
export LLM_MODEL_NAME="gemini-1.5-flash"

uvicorn app.main:app --reload --port 8000 --timeout-keep-alive 120
