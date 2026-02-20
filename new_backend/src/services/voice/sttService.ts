import { SpeechClient } from "@google-cloud/speech";
import { env } from "../../config/env";

const client = new SpeechClient();

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
}

/**
 * Transcribe audio using Google Cloud Speech-to-Text API
 * Supports both English (Indian accent) and Hindi
 */
export const transcribeAudio = async (
  audioBuffer: Buffer,
  languageCode: string = "en-IN"
): Promise<TranscriptionResult> => {
  try {
    const audio = {
      content: audioBuffer.toString("base64"),
    };

    const config = {
      encoding: "LINEAR16" as const,
      sampleRateHertz: 16000,
      languageCode,              // en-IN (Indian English) or hi-IN (Hindi)
      alternativeLanguageCodes: ["hi-IN", "en-IN"], // fallback languages
      model: "phone_call",       // optimized for phone/mobile audio
      useEnhanced: true,
      enableAutomaticPunctuation: true,
    };

    const request = {
      audio,
      config,
    };

    const [response] = await client.recognize(request);
    const transcription = response.results
      ?.map((result: any) => result.alternatives?.[0]?.transcript)
      .join("\n") || "";

    const confidence = response.results?.[0]?.alternatives?.[0]?.confidence || 0;

    if (!transcription) {
      throw new Error("No transcription returned from Google Speech API");
    }

    return {
      transcript: transcription.trim(),
      confidence: parseFloat(confidence.toFixed(2)),
    };
  } catch (err) {
    console.error("[STT] Google Speech error —", (err as Error).message);
    throw new Error("Speech-to-text failed. Please try again.");
  }
};


export const transcriptionFallback = (): TranscriptionResult => {
  return {
    transcript: "[Audio could not be processed. Please type your message instead.]",
    confidence: 0,
  };
};