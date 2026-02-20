"""
LLM Service using Google Gemini via the google-genai package.
Falls back to google.generativeai if google-genai is not installed.
"""
import logging
from app.config import settings

logger = logging.getLogger(__name__)

# Try new google-genai package first, fall back to deprecated google.generativeai
try:
    from google import genai as google_genai
    _USE_NEW_SDK = True
    logger.info("Using google-genai (new SDK)")
except ImportError:
    try:
        import google.generativeai as genai_legacy
        _USE_NEW_SDK = False
        logger.info("Using google.generativeai (legacy SDK)")
    except ImportError:
        genai_legacy = None
        _USE_NEW_SDK = False
        logger.warning("No Google Gemini SDK found — LLM will be unavailable")


GEMINI_MODEL = "gemini-2.5-flash"  # Stable v1 model (replacement for deprecated 1.5 Flash)


class LLMService:
    """LLM service using Google Gemini"""

    def __init__(self):
        self.client = None
        self.model = None

        if not settings.GOOGLE_API_KEY:
            logger.warning("GOOGLE_API_KEY not set — LLM service disabled")
            return

        try:
            if _USE_NEW_SDK:
                self.client = google_genai.Client(api_key=settings.GOOGLE_API_KEY)
                logger.info(f"LLM Service initialized (google-genai) with model: {GEMINI_MODEL}")
            else:
                if genai_legacy:
                    genai_legacy.configure(api_key=settings.GOOGLE_API_KEY)
                    self.model = genai_legacy.GenerativeModel(GEMINI_MODEL)
                    logger.info(f"LLM Service initialized (google.generativeai) with model: {GEMINI_MODEL}")
        except Exception as e:
            logger.error(f"Failed to initialize LLM service: {e}")
            self.client = None
            self.model = None

    async def generate_response(self, messages: list, system_prompt: str = None) -> str:
        """Generate response from Gemini"""
        if not self.client and not self.model:
            return "I'm having trouble connecting to my AI brain right now. Please try again in a moment."

        # Build the full prompt from messages
        prompt = ""
        for msg in messages:
            content = msg.get("content", "")
            if content:
                prompt += content + "\n\n"

        if system_prompt:
            prompt = f"System Instruction: {system_prompt}\n\n{prompt}"

        try:
            import asyncio
            from functools import partial

            loop = asyncio.get_event_loop()

            if _USE_NEW_SDK and self.client:
                response = await loop.run_in_executor(
                    None,
                    partial(
                        self.client.models.generate_content,
                        model=GEMINI_MODEL,
                        contents=prompt,
                    )
                )
                return response.text

            elif self.model:
                response = await loop.run_in_executor(
                    None,
                    partial(self.model.generate_content, prompt)
                )
                return response.text

        except Exception as e:
            import traceback
            logger.error(f"Error generating LLM response: {e}\n{traceback.format_exc()}")
            return f"I'm having a moment of difficulty. Please try again shortly. (Error: {str(e)}) [Model: {GEMINI_MODEL}]"

        return "I'm unable to respond right now. Please try again."


# Singleton instance
llm = LLMService()


async def get_llm_response(messages: list, system_prompt: str = None) -> str:
    """Convenience function for getting LLM responses"""
    return await llm.generate_response(messages, system_prompt)