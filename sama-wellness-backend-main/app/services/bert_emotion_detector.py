"""
BERT Emotion Detector - Main model class for emotion detection
"""

import torch
import torch.nn.functional as F
from transformers import BertTokenizer, BertForSequenceClassification
from typing import Dict, List, Tuple
import numpy as np
from pathlib import Path
from app.services import config


class BERTEmotionDetector:
    """
    BERT-based emotion detection model for SAMA Wellness chatbot
    """
    
    def __init__(self, model_path: str = None):
        """
        Initialize the BERT emotion detector
        
        Args:
            model_path: Path to fine-tuned model. If None, loads base model.
        """
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {self.device}")
        
        # Load tokenizer
        self.tokenizer = BertTokenizer.from_pretrained(config.MODEL_NAME)
        
        # Load model
        if model_path and Path(model_path).exists():
            print(f"Loading fine-tuned model from {model_path}")
            self.model = BertForSequenceClassification.from_pretrained(model_path)
        else:
            print(f"Loading base model: {config.MODEL_NAME}")
            self.model = BertForSequenceClassification.from_pretrained(
                config.MODEL_NAME,
                num_labels=len(config.EMOTION_LABELS)
            )
        
        self.model.to(self.device)
        self.model.eval()
        
        self.emotion_labels = config.EMOTION_LABELS
    
    def preprocess_text(self, text: str) -> Dict[str, torch.Tensor]:
        """
        Preprocess text for BERT input
        
        Args:
            text: Input text string
            
        Returns:
            Dictionary with input_ids, attention_mask, token_type_ids
        """
        encoding = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=config.MAX_LENGTH,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )
        
        return {
            'input_ids': encoding['input_ids'].to(self.device),
            'attention_mask': encoding['attention_mask'].to(self.device)
        }
    
    def predict_emotions(
        self, 
        text: str, 
        top_k: int = config.TOP_K_EMOTIONS,
        threshold: float = config.CONFIDENCE_THRESHOLD
    ) -> List[Tuple[str, float]]:
        """
        Predict emotions from text
        
        Args:
            text: Input text
            top_k: Return top K emotions
            threshold: Minimum confidence threshold
            
        Returns:
            List of (emotion, confidence) tuples
        """
        # Preprocess
        inputs = self.preprocess_text(text)
        
        # Predict
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = F.softmax(logits, dim=1).cpu().numpy()[0]
        
        # Get emotion-confidence pairs
        emotion_scores = [
            (self.emotion_labels[i], float(probabilities[i]))
            for i in range(len(self.emotion_labels))
            if probabilities[i] >= threshold
        ]
        
        # Sort by confidence and return top K
        emotion_scores.sort(key=lambda x: x[1], reverse=True)
        return emotion_scores[:top_k]
    
    def predict_with_dosha(self, text: str) -> Dict:
        """
        Predict emotions and map to Ayurvedic doshas
        
        Args:
            text: Input text
            
        Returns:
            Dictionary with emotions, doshas, and recommendations
        """
        # Get emotion predictions
        emotions = self.predict_emotions(text)
        
        if not emotions:
            return {
                'text': text,
                'emotions': [],
                'primary_emotion': 'neutral',
                'confidence': 0.0,
                'dosha': 'Balanced',
                'dosha_scores': {'Vata': 0, 'Pitta': 0, 'Kapha': 0, 'Balanced': 1}
            }
        
        # Calculate dosha scores
        dosha_scores = {'Vata': 0, 'Pitta': 0, 'Kapha': 0, 'Balanced': 0}
        
        for emotion, confidence in emotions:
            dosha = config.EMOTION_TO_DOSHA.get(emotion, 'Balanced')
            dosha_scores[dosha] += confidence
        
        # Normalize dosha scores
        total = sum(dosha_scores.values())
        if total > 0:
            dosha_scores = {k: v/total for k, v in dosha_scores.items()}
        
        # Get primary dosha
        primary_dosha = max(dosha_scores.items(), key=lambda x: x[1])[0]
        
        return {
            'text': text,
            'emotions': [
                {'emotion': e, 'confidence': round(c, 3)} 
                for e, c in emotions
            ],
            'primary_emotion': emotions[0][0],
            'emotion_confidence': round(emotions[0][1], 3),
            'dosha': primary_dosha,
            'dosha_scores': {k: round(v, 3) for k, v in dosha_scores.items()}
        }
    
    def batch_predict(self, texts: List[str]) -> List[Dict]:
        """
        Predict emotions for multiple texts
        
        Args:
            texts: List of input texts
            
        Returns:
            List of prediction dictionaries
        """
        return [self.predict_with_dosha(text) for text in texts]
    
    def save_model(self, save_path: str):
        """
        Save fine-tuned model
        
        Args:
            save_path: Path to save model
        """
        save_path = Path(save_path)
        save_path.mkdir(parents=True, exist_ok=True)
        
        self.model.save_pretrained(save_path)
        self.tokenizer.save_pretrained(save_path)
        
        print(f"Model saved to {save_path}")


# Example usage
if __name__ == "__main__":
    # Initialize detector
    detector = BERTEmotionDetector()
    
    # Test examples
    test_texts = [
        "I'm so stressed about work deadlines, can't focus on anything",
        "My boss yelled at me today and I feel terrible",
        "I haven't left my room in days, everything feels pointless",
        "I'm so excited about this new opportunity!",
        "Can't sleep, my mind keeps racing with anxious thoughts"
    ]
    
    print("\n" + "="*80)
    print("BERT EMOTION DETECTOR - TEST RESULTS")
    print("="*80 + "\n")
    
    for text in test_texts:
        result = detector.predict_with_dosha(text)
        
        print(f"Text: {text}")
        print(f"Primary Emotion: {result['primary_emotion']} ({result['emotion_confidence']:.2%})")
        print(f"Dosha: {result['dosha']}")
        print(f"Dosha Scores: {result['dosha_scores']}")
        print(f"All Emotions: {result['emotions']}")
        print("-" * 80 + "\n")
