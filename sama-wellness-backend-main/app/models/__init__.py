"""
Database models - SQLite Schema Compatible (based on schema.sql)
"""

from app.models.user import User
from app.models.user_authentication import UserAuthentication
from app.models.user_onboarding import UserOnboarding
from app.models.user_preferences import UserPreferences
from app.models.dosha_types import DoshaType
from app.models.dosha_assessment import DoshaAssessment
from app.models.dosha_tracking import DoshaTracking
from app.models.conversation_session import ConversationSession
from app.models.chat_message import ConversationMessage
from app.models.emotion_analysis import EmotionAnalysis
from app.models.user_progress_daily import UserProgressDaily
from app.models.ayurveda_knowledge import AyurvedaKnowledge
from app.models.knowledge_tags import KnowledgeTag
from app.models.safety_monitoring import SafetyMonitoring
from app.models.helpline_referrals import HelplineReferral
from app.models.recommendation_history import RecommendationHistory
from app.models.user_insights_weekly import UserInsightsWeekly
from app.models.user_streaks import UserStreak
from app.models.app_configuration import AppConfiguration
from app.models.error_logs import ErrorLog
from app.models.api_usage_metrics import ApiUsageMetric
from app.models.push_subscriptions import PushSubscription

__all__ = [
    "User",
    "UserAuthentication", 
    "UserOnboarding",
    "UserPreferences",
    "DoshaType",
    "DoshaAssessment",
    "DoshaTracking",
    "ConversationSession",
    "ConversationMessage",
    "EmotionAnalysis",
    "UserProgressDaily",
    "AyurvedaKnowledge",
    "KnowledgeTag",
    "SafetyMonitoring",
    "HelplineReferral",
    "RecommendationHistory",
    "UserInsightsWeekly",
    "UserStreak",
    "AppConfiguration",
    "ErrorLog",
    "ApiUsageMetric",
    "PushSubscription",
]
