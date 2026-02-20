import sys
import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Try to import BERT detector — requires torch/transformers
# Falls back gracefully if not installed
try:
    SAMA_AI_PATH = Path(__file__).parent.parent.parent
    sys.path.insert(0, str(SAMA_AI_PATH))
    from app.services.bert_emotion_detector import BERTEmotionDetector
    _BERT_AVAILABLE = True
except Exception as _bert_import_err:
    logger.warning(f"BERT emotion detector not available (torch/transformers missing): {_bert_import_err}")
    BERTEmotionDetector = None  # type: ignore
    _BERT_AVAILABLE = False



class EmotionAnalysisService:
    """Service for analyzing emotions using BERT model"""
    
    def __init__(self, model_path=None):
        """Initialize BERT emotion detector"""
        self.detector = None

        if not _BERT_AVAILABLE:
            logger.warning("BERT not available — using keyword-based fallback emotion detection")
            return

        if model_path is None:
            model_path = str(Path(__file__).parent.parent.parent / "models" / "bert_emotion_final")

        try:
            self.detector = BERTEmotionDetector(model_path=model_path)
            logger.info(f"✓ BERT emotion detector loaded from {model_path}")
        except Exception as e:
            logger.error(f"Failed to load BERT model: {e}")
            self.detector = None
    
    def analyze_emotion(self, text: str) -> dict:
        """
        Analyze emotion from text using BERT
        
        Args:
            text: User's message text
            
        Returns:
            {
                'primary_emotion': str,
                'emotion_confidence': float,
                'dosha': str,  # Vata, Pitta, Kapha, or Balanced
                'dosha_scores': dict,
                'all_emotions': list
            }
        """
        if not self.detector:
            logger.warning("BERT detector not available, using fallback")
            return self._fallback_detection(text)
        
        try:
            result = self.detector.predict_with_dosha(text)
            logger.info(f"Detected emotion: {result['primary_emotion']} ({result.get('emotion_confidence', 0):.2%}), Dosha: {result['dosha']}")
            return result
        except Exception as e:
            logger.error(f"Error in emotion detection: {e}")
            return self._fallback_detection(text)
    
    def _fallback_detection(self, text: str) -> dict:
        """Simple keyword-based fallback if BERT fails"""
        text_lower = text.lower()
        
        # Simple keyword matching
        if any(word in text_lower for word in ['anxious', 'worried', 'nervous', 'fear', 'panic']):
            return {
                'primary_emotion': 'fear',
                'emotion_confidence': 0.5,
                'dosha': 'Vata',
                'dosha_scores': {'Vata': 1.0, 'Pitta': 0.0, 'Kapha': 0.0, 'Balanced': 0.0}
            }
        elif any(word in text_lower for word in ['angry', 'frustrated', 'annoyed', 'irritated']):
            return {
                'primary_emotion': 'anger',
                'emotion_confidence': 0.5,
                'dosha': 'Pitta',
                'dosha_scores': {'Vata': 0.0, 'Pitta': 1.0, 'Kapha': 0.0, 'Balanced': 0.0}
            }
        elif any(word in text_lower for word in ['sad', 'depressed', 'unmotivated', 'tired', 'lethargic']):
            return {
                'primary_emotion': 'sadness',
                'emotion_confidence': 0.5,
                'dosha': 'Kapha',
                'dosha_scores': {'Vata': 0.0, 'Pitta': 0.0, 'Kapha': 1.0, 'Balanced': 0.0}
            }
        else:
            return {
                'primary_emotion': 'neutral',
                'emotion_confidence': 0.5,
                'dosha': 'Balanced',
                'dosha_scores': {'Vata': 0.0, 'Pitta': 0.0, 'Kapha': 0.0, 'Balanced': 1.0}
            }


# Global instance
_emotion_service = None

def get_emotion_service() -> EmotionAnalysisService:
    """Get or create emotion analysis service singleton"""
    global _emotion_service
    if _emotion_service is None:
        _emotion_service = EmotionAnalysisService()
    return _emotion_service
