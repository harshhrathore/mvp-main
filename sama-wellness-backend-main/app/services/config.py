"""
Configuration file for BERT Emotion Detection - BERT-Base Version
Optimized for smaller model training
"""

import os
from pathlib import Path

# Project paths
BASE_DIR = Path(__file__).parent
MODEL_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"
LOGS_DIR = BASE_DIR / "logs"

# Create directories if they don't exist
MODEL_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)

# Model configuration - BERT-Base (Small Model)
MODEL_NAME = "bert-base-uncased"  # 110M parameters
MAX_LENGTH = 128  # Maximum sequence length for input text
BATCH_SIZE = 16  # Larger batch for smaller model
LEARNING_RATE = 2e-5  # Standard learning rate
NUM_EPOCHS = 3  # Quick training (45-60 minutes)
WARMUP_STEPS = 500

# Emotion labels (from GoEmotions dataset)
EMOTION_LABELS = [
    'admiration', 'amusement', 'anger', 'annoyance', 'approval', 
    'caring', 'confusion', 'curiosity', 'desire', 'disappointment',
    'disapproval', 'disgust', 'embarrassment', 'excitement', 'fear',
    'gratitude', 'grief', 'joy', 'love', 'nervousness',
    'optimism', 'pride', 'realization', 'relief', 'remorse',
    'sadness', 'surprise', 'neutral'
]

# Emotion to Dosha mapping
EMOTION_TO_DOSHA = {
    # Vata (Air + Space) - Associated with anxiety, fear, nervousness, movement
    'fear': 'Vata',
    'nervousness': 'Vata',
    'confusion': 'Vata',
    'surprise': 'Vata',
    'excitement': 'Vata',
    'curiosity': 'Vata',
    
    # Pitta (Fire + Water) - Associated with anger, intensity, passion
    'anger': 'Pitta',
    'annoyance': 'Pitta',
    'disapproval': 'Pitta',
    'disgust': 'Pitta',
    'pride': 'Pitta',
    
    # Kapha (Earth + Water) - Associated with sadness, lethargy, attachment
    'sadness': 'Kapha',
    'grief': 'Kapha',
    'disappointment': 'Kapha',
    'remorse': 'Kapha',
    'caring': 'Kapha',
    'love': 'Kapha',
    'gratitude': 'Kapha',
    
    # Balanced/Multiple doshas
    'joy': 'Balanced',
    'amusement': 'Balanced',
    'admiration': 'Balanced',
    'approval': 'Balanced',
    'optimism': 'Balanced',
    'relief': 'Balanced',
    'realization': 'Balanced',
    'desire': 'Balanced',
    'embarrassment': 'Balanced',
    'neutral': 'Balanced'
}

# API configuration
API_HOST = "0.0.0.0"
API_PORT = 5000
API_DEBUG = False

# Training configuration
TRAIN_TEST_SPLIT = 0.2
RANDOM_SEED = 42
SAVE_STRATEGY = "epoch"
EVALUATION_STRATEGY = "epoch"

# Inference configuration
CONFIDENCE_THRESHOLD = 0.3  # Minimum confidence to consider an emotion
TOP_K_EMOTIONS = 3  # Return top K emotions