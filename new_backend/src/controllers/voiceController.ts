import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { transcribeAudio, transcriptionFallback } from "../services/voice/sttService";
import { synthesizeVoice, voiceSynthesisFallback } from "../services/voice/ttsService";
import { uploadAudio, uploadFallback } from "../services/voice/cloudinaryService";
import { processChatMessage } from "../services/chatPipelineService";


export const uploadVoiceMessage = async (req: AuthRequest, res: Response) => {
  const { audio } = req.body; // base64 string

  if (!audio) {
    return res.status(400).json({ success: false, message: "audio field is required" });
  }

  try {
    // Decode base64
    const audioBuffer = Buffer.from(audio, "base64");

    if (audioBuffer.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid audio data" });
    }

    // Upload to Cloudinary
    const upload = await uploadAudio(audioBuffer, "samaa/voice-input");

    return res.json({
      success: true,
      data: {
        audio_url: upload.url,
        duration: upload.duration,
      },
    });
  } catch (err) {
    console.error("[voice] upload —", err);
    return res.status(500).json({ success: false, message: "Audio upload failed" });
  }
};


export const voiceChat = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { audio } = req.body; // base64 string

  // Validate audio field presence
  if (!audio) {
    return res.status(400).json({ success: false, message: "audio field is required" });
  }

  // Validate audio is a string
  if (typeof audio !== 'string') {
    return res.status(400).json({ success: false, message: "audio must be a base64 string" });
  }

  try {
    // ─ 1. Transcribe audio ────────────────────────────
    const audioBuffer = Buffer.from(audio, "base64");
    
    // Validate audio buffer is not empty
    if (audioBuffer.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid audio data: empty buffer" });
    }

    // Validate audio size (max 10MB)
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (audioBuffer.length > maxSizeBytes) {
      return res.status(400).json({ 
        success: false, 
        message: `Audio file too large. Maximum size is 10MB, received ${(audioBuffer.length / 1024 / 1024).toFixed(2)}MB` 
      });
    }

    let transcript: string;
    let confidence: number;

    try {
      const sttResult = await transcribeAudio(audioBuffer, "en-IN");
      transcript = sttResult.transcript;
      confidence = sttResult.confidence;
    } catch (sttErr) {
      console.error("[voice] STT failed, using fallback");
      const fallback = transcriptionFallback();
      transcript = fallback.transcript;
      confidence = fallback.confidence;
    }

    // ─ 2. Upload user audio to Cloudinary ─────────────
    let userAudioUrl: string;
    try {
      const upload = await uploadAudio(audioBuffer, "samaa/voice-input");
      userAudioUrl = upload.url;
    } catch (uploadErr) {
      console.error("[voice] User audio upload failed");
      const fallback = uploadFallback();
      userAudioUrl = fallback.url;
    }

    // ─ 3. Process chat pipeline ───────────────────────
    const chatResult = await processChatMessage({
      userId,
      message: transcript,
      inputType: "voice",
      audioUrl: userAudioUrl,
    });

    // ─ 4. Synthesize AI response to voice ─────────────
    let aiAudioUrl: string | null = null;

    try {
      const ttsResult = await synthesizeVoice(
        chatResult.ai_response_text,
        chatResult.emotion.primary
      );

      // ttsResult already contains the uploaded URL from Cloudinary
      aiAudioUrl = ttsResult.audioUrl;
    } catch (ttsErr) {
      console.error("[voice] TTS failed — returning text-only response");
      aiAudioUrl = null;
    }

    // ─ 5. Return complete voice response ──────────────
    return res.json({
      success: true,
      data: {
        transcript,
        transcript_confidence: confidence,
        reply_text: chatResult.ai_response_text,
        reply_audio_url: aiAudioUrl, // null if TTS failed
        emotion: chatResult.emotion,
        recommendations: chatResult.recommendations,
        is_crisis: chatResult.is_crisis,
        meta: {
          session_id: chatResult.session_id,
          message_id: chatResult.message_id,
        },
      },
    });
  } catch (err) {
    console.error("[voice] voiceChat —", err);
    return res.status(500).json({ success: false, message: "Voice chat failed. Please try again." });
  }
};