import axios from "axios";
import { uploadAudio } from "./cloudinaryService";

export interface TTSResult {
  audioUrl: string;
  durationMs: number;
}

/**
 * Synthesize text to speech using ElevenLabs
 */
export const synthesizeVoice = async (
  text: string,
  emotion: string = "neutral"
): Promise<TTSResult> => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

  if (!apiKey) {
    throw new Error("ElevenLabs API key not configured");
  }

  try {
    const { stability, similarity_boost } = getVoiceParamsForEmotion(emotion);

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability,
          similarity_boost,
        },
      },
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
        timeout: 10000,
      }
    );

    const audioBuffer = Buffer.from(response.data as ArrayBuffer);
    
    // Upload to Cloudinary using uploadAudio (not uploadAudioBuffer)
    const uploadResult = await uploadAudio(audioBuffer, "samaa/voice-output");

    return { 
      audioUrl: uploadResult.url, 
      durationMs: (uploadResult.duration || 0) * 1000 
    };
  } catch (error) {
    console.error("[TTS] Synthesis failed:", error);
    throw error;
  }
};

function getVoiceParamsForEmotion(emotion: string): {
  stability: number;
  similarity_boost: number;
} {
  const params: Record<string, { stability: number; similarity_boost: number }> = {
    anxiety: { stability: 0.4, similarity_boost: 0.7 },
    fear: { stability: 0.4, similarity_boost: 0.7 },
    anger: { stability: 0.3, similarity_boost: 0.8 },
    joy: { stability: 0.6, similarity_boost: 0.8 },
    sadness: { stability: 0.7, similarity_boost: 0.6 },
    calm: { stability: 0.8, similarity_boost: 0.7 },
    neutral: { stability: 0.7, similarity_boost: 0.75 },
  };

  return params[emotion.toLowerCase()] || params.neutral;
}

export const voiceSynthesisFallback = (): null => {
  console.warn("[TTS] Voice synthesis unavailable");
  return null;
};