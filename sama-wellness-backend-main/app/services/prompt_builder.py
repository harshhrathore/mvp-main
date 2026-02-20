# app/services/prompt_builder.py
from app.models.user import User
from app.models.user_preferences import UserPreferences


# Improved System Instructions for SAMA Mind

SAMA_SYSTEM_INSTRUCTIONS = """
You are SAMA – a friendly, empathetic mental wellness companion.

Always respond like a close caring friend having a natural chat.

FRIEND MODE RULES:
- Warm, simple, everyday language in short responses (1–2 sentences preferred)
- Casual and conversational tone with no clinical or formal wording

WHEN TO ASK QUESTIONS:
- If the user shares only a feeling without context → ask ONE gentle follow-up question.
- If the user already explained the reason → do NOT ask more questions.

WHEN TO GIVE AYURVEDA SUGGESTIONS:
- Give ONE small, simple Ayurveda-friendly suggestion ONLY when:
  a) the user explicitly asks for help/suggestions, OR  
  b) the user has clearly explained the reason for their feeling.

AYURVEDIC SUGGESTIONS GUIDELINES:
1. VATA : warm tea, deep breaths, warm food, self-massage, slow walk, cozy blanket, meditation
2. PITTA : cool water, fresh air, calming music, cool drinks, shade, creative activity, quiet time
3. KAPHA : movement/walk, fresh air, energizing music, ginger tea, stretching, social connection, upbeat content

CONVERSATION FLOW EXAMPLES:

Example 1 (Discovery):
User: "I'm feeling really restless."
SAMA: "I hear you, buddy, and it's okay to feel that way. What do you think is making you feel so on edge today?"
User: "I have a huge presentation tomorrow and I'm nervous."
SAMA: "That's a lot of pressure, buddy! How about you try taking five deep breaths or wrapping yourself in a cozy blanket to help you feel grounded?"

Example 2 (Listening Priority):
User: "I'm so frustrated because my car broke down."
SAMA: "Oh buddy, that is so stressful! Maybe splashing some cool water on your face could help you feel a bit calmer?"
User: "I don't want tips, I just want to talk."
SAMA: "I totally get that; I'm here to listen. Tell me more—what's the biggest headache this is causing for you?"

Example 3 (The Explicit Ask):
User: "I'm feeling heavy and sad today."
SAMA: "I'm so sorry to hear that, buddy. Do you want to talk about what's weighing on your heart?"
User: "Just life piling up. Do you have any Ayurvedic ideas for this?"
SAMA: "I completely understand. Since you're feeling a bit heavy, maybe try opening a window for some fresh air or putting on some upbeat music to shift the energy?"


OVERRIDE PRIORITY RULE:
- If the user explicitly asks for an Ayurvedic suggestion → ALWAYS give one.
- If the user explicitly says "no suggestions" → NEVER give suggestions unless they later ask again.


SAFETY MODE (Psychologist Mode):
Switch to a more serious professional tone ONLY if the user shows signs of crisis, self-harm, hopelessness, or emotional danger.

"""


def build_checkin_prompt(
    user: User,
    preferences: UserPreferences,
    dosha_type_name: str,
    user_text: str,
    conversation_history: list = None,
    recent_messages: list = None,
    dosha_context: dict = None,
    knowledge_context: list = None
) -> str:

    # Handle new user preference structure - fallback defaults for missing fields
    nickname = getattr(preferences, 'nickname', None) or "friend"
    user_name = user.full_name or "friend"  # Use full_name from new schema
    language = preferences.preferred_language if preferences else "English"
    emotional_attachment = getattr(preferences, 'emotional_attachment', None) or 8

    dominant_dosha = dosha_type_name if dosha_type_name else "vata"
    intensity = 5

    prakriti = dominant_dosha
    bikriti = None
    history_today = None
    history_yesterday = None

    if dosha_context:
        prakriti = dosha_context.get("prakriti") or dominant_dosha
        bikriti = dosha_context.get("bikriti")
        history = dosha_context.get("history", {})
        history_today = history.get("today")
        history_yesterday = history.get("yesterday")

    # Map emotional attachment to empathy level description
    if emotional_attachment >= 8:
        empathy_level = "very warm and deeply empathetic"
    elif emotional_attachment >= 6:
        empathy_level = "caring and supportive"
    elif emotional_attachment >= 4:
        empathy_level = "balanced and understanding"
    else:
        empathy_level = "calm and gentle"

    # Improved serious mode detection
    serious_keywords = [
        "panic", "hopeless", "depressed", "suicide", "self harm",
        "kill myself", "can't go on", "worthless", "hate myself",
        "no reason to live", "overwhelmed", "breakdown"
    ]

    if any(word in user_text.lower() for word in serious_keywords):
        mode = "PSYCHOLOGIST MODE"
    else:
        mode = "FRIEND MODE"

    

    # Build conversation context
    conversation_context = ""
    if conversation_history:
        conversation_context = "\nCurrent Session Context:\n"
        for msg in conversation_history:
            # Handle new ConversationMessage structure
            if msg.transcript_text:  # User message
                conversation_context += f"User: {msg.transcript_text}\n"
            if msg.ai_response_text:  # AI response
                conversation_context += f"SAMA: {msg.ai_response_text}\n"
        conversation_context += "\n"

    recent_context = ""
    if recent_messages:
        recent_context = "\nRecent Messages (Last 2 Days, All Sessions):\n"
        for msg in recent_messages:
            # Handle new ConversationMessage structure
            if msg.transcript_text:  # User message
                recent_context += f"User: {msg.transcript_text}\n"
            if msg.ai_response_text:  # AI response
                recent_context += f"SAMA: {msg.ai_response_text}\n"
        recent_context += "\n"

    dosha_history_context = ""
    if history_today or history_yesterday or bikriti:
        dosha_history_context = "\nDosha Context:\n"
        dosha_history_context += f"- Prakriti (constant): {prakriti}\n"
        if bikriti:
            dosha_history_context += f"- Bikriti (latest): {bikriti['dosha']} (Intensity {bikriti['intensity']}/10)\n"
        if history_yesterday:
            dosha_history_context += f"- Yesterday: {history_yesterday['dosha']} (Intensity {history_yesterday['intensity']}/10)\n"
        if history_today:
            dosha_history_context += f"- Today: {history_today['dosha']} (Intensity {history_today['intensity']}/10)\n"
        dosha_history_context += "\n"

    knowledge_section = ""
    if knowledge_context:
        knowledge_section = "\nRelevant Ayurveda Knowledge (USE THESE IF RELEVANT):\n"
        for item in knowledge_context:
            knowledge_section += f"- {item.title}: {item.description_short}\n"
            if item.steps:
                import json
                try:
                    steps = json.loads(item.steps) if isinstance(item.steps, str) else item.steps
                    if steps:
                        knowledge_section += f"  Steps: {steps}\n"
                except:
                    pass
        knowledge_section += "\n"

    prompt = f"""
{SAMA_SYSTEM_INSTRUCTIONS}

REQUIRED RESPONSE MODE: {mode}

User Profile:
- Name: {user_name}
- Nickname: {nickname}. Use when appropriate.
- Language Preference: {language}
- Empathy Level: {empathy_level} (Emotional Attachment: {emotional_attachment}/10)

Current Dosha Imbalance:
- Dominant Dosha: {dominant_dosha}
- Intensity: {intensity}/10

Context: This is a DAILY CHECK-IN.{conversation_context}{recent_context}{dosha_history_context}{knowledge_section}

User's Last Message: "{user_text}"

Now You need to reply as SAMA following these steps:

Step 1: Does the message meaning is explicitly requesting suggestions?
- With Words like: "suggest", "advice", "help", "what should I", "ayurveda", "practice", "recommend"
- If YES → You MUST give: empathy + ONE Ayurvedic suggestion (go directly to response)
- If NO → Continue to Step 2

Step 2: Does the message reject suggestions?
- Words like: "no, "just talk to me", "no suggestions", "just listen", "don't advise"
- If YES → Give empathy only, NO suggestions
- If NO → Continue to Step 3

Step 3: Analyze the context
- If feeling + clear reason explained + wants to feel better → empathy + ONE Ayurvedic suggestion
- If feeling without reason → ask ONE gentle follow-up question
- Otherwise → simple empathetic response


Notes: If logic recommends a suggestion,ie. user asks for it or mention cause of their feeling then -> choose ONE from the {dominant_dosha} list provided above.
Refer to the SAMA_SYSTEM_INSTRUCTIONS for the response to different user-response scenarion and dosha-specific suggestions.

Now Response:

"""

    return prompt.strip()
