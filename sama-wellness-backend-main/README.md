---
title: SAMA Wellness Backend
emoji: 🧘
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
license: mit
app_port: 7860
---

# SAMA Wellness Backend API

AI-powered wellness chatbot and voice assistant backend service.

## Features

- Daily wellness check-ins
- AI-powered conversation analysis
- Emotion detection
- Voice input/output support
- Ayurvedic dosha-based recommendations

## API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health status
- `POST /api/daily_checkin/chat` - Text-based check-in
- `POST /api/daily_checkin/voice` - Voice-based check-in
- `POST /api/onboarding` - User onboarding

## Environment Variables

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_API_KEY` - Google API key for LLM
- `ASSEMBLYAI_API_KEY` - AssemblyAI API key for STT
- `ELEVENLABS_API_KEY` - ElevenLabs API key for TTS
- `SECRET_KEY` - Application secret key

## Usage

The API is automatically deployed and running. Access the interactive API documentation at `/docs`.
