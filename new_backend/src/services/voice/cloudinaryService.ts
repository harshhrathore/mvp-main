import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env";

// Configure Cloudinary once on module load
cloudinary.config({
  cloud_name: env.cloudinaryCloud(),
  api_key: env.cloudinaryKey(),
  api_secret: env.cloudinarySecret(),
});

export interface UploadResult {
  url: string;
  public_id: string;
  duration: number | null; 
}

/**
 * Upload audio buffer to Cloudinary
 * Returns public HTTPS URL for playback
 */
export const uploadAudio = async (
  audioBuffer: Buffer,
  folder: string = "samaa/audio"
): Promise<UploadResult> => {
  try {
    // Convert buffer to base64 data URI
    const base64Audio = `data:audio/mp3;base64,${audioBuffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64Audio, {
      resource_type: "video", // Cloudinary treats audio as "video"
      folder,
      format: "mp3",
      transformation: [
        { audio_codec: "mp3", audio_frequency: 44100 }, // normalize to MP3 @ 44.1kHz
      ],
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      duration: result.duration || null,
    };
  } catch (err) {
    console.error("[Cloudinary] Upload error —", (err as Error).message);
    throw new Error("Audio upload failed. Please try again.");
  }
};

/**
 * Delete audio from Cloudinary (cleanup old files)
 */
export const deleteAudio = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
  } catch (err) {
    console.error("[Cloudinary] Delete error —", (err as Error).message);
    
  }
};


export const uploadFallback = (): UploadResult => {
  console.warn("[Cloudinary] Not configured — using placeholder URL");
  return {
    url: "https://placeholder.audio/not-configured.mp3",
    public_id: "placeholder",
    duration: null,
  };
};