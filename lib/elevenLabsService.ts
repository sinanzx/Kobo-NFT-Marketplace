/**
 * ElevenLabs Audio Generation Service
 * Provides text-to-speech functionality for NFT audio generation
 */

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category?: string;
}

export interface AudioGenerationOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface AudioGenerationResult {
  url: string;
  blob: Blob;
  duration?: number;
}

// Default voices from ElevenLabs
export const ELEVENLABS_VOICES: ElevenLabsVoice[] = [
  { voice_id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', category: 'Female' },
  { voice_id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', category: 'Male' },
  { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', category: 'Female' },
  { voice_id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', category: 'Female' },
  { voice_id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', category: 'Male' },
  { voice_id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', category: 'Male' },
  { voice_id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', category: 'Male' },
  { voice_id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', category: 'Neutral' },
  { voice_id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', category: 'Male' },
  { voice_id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', category: 'Female' },
  { voice_id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', category: 'Female' },
  { voice_id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', category: 'Female' },
  { voice_id: 'bIHbv24MWmeRgasZH58o', name: 'Will', category: 'Male' },
  { voice_id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', category: 'Female' },
  { voice_id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', category: 'Male' },
  { voice_id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', category: 'Male' },
  { voice_id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', category: 'Male' },
  { voice_id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', category: 'Male' },
  { voice_id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', category: 'Female' },
  { voice_id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill', category: 'Male' },
];

// Available models
export const ELEVENLABS_MODELS = {
  MULTILINGUAL_V2: 'eleven_multilingual_v2',
  TURBO_V2_5: 'eleven_turbo_v2_5',
  TURBO_V2: 'eleven_turbo_v2',
  MULTILINGUAL_V1: 'eleven_multilingual_v1',
  ENGLISH_V1: 'eleven_monolingual_v1',
} as const;

/**
 * Generate audio using ElevenLabs Text-to-Speech API
 */
export async function generateAudio(
  options: AudioGenerationOptions
): Promise<AudioGenerationResult> {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error(
      'ElevenLabs API key not configured. Please add VITE_ELEVENLABS_API_KEY to your .env file.'
    );
  }

  const {
    text,
    voiceId = ELEVENLABS_VOICES[0].voice_id, // Default to Aria
    modelId = ELEVENLABS_MODELS.TURBO_V2_5,
    stability = 0.5,
    similarityBoost = 0.75,
    style = 0,
    useSpeakerBoost = true,
  } = options;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: useSpeakerBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `ElevenLabs API error: ${response.status} - ${errorData.detail?.message || response.statusText}`
      );
    }

    const audioBlob = await response.blob();
    const url = URL.createObjectURL(audioBlob);

    // Get audio duration
    const duration = await getAudioDuration(audioBlob);

    return {
      url,
      blob: audioBlob,
      duration,
    };
  } catch (error) {
    console.error('Audio generation error:', error);
    throw error;
  }
}

/**
 * Get audio duration from blob
 */
async function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = URL.createObjectURL(blob);
    
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
      URL.revokeObjectURL(audio.src);
    });

    audio.addEventListener('error', () => {
      resolve(0);
      URL.revokeObjectURL(audio.src);
    });
  });
}

/**
 * Fetch available voices from ElevenLabs API
 */
export async function fetchElevenLabsVoices(): Promise<ElevenLabsVoice[]> {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

  if (!apiKey) {
    // Return default voices if no API key
    return ELEVENLABS_VOICES;
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      console.warn('Failed to fetch voices, using defaults');
      return ELEVENLABS_VOICES;
    }

    const data = await response.json();
    return data.voices.map((voice: any) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      category: voice.category,
    }));
  } catch (error) {
    console.error('Error fetching voices:', error);
    return ELEVENLABS_VOICES;
  }
}

/**
 * Generate placeholder audio for demo/testing
 */
export async function generatePlaceholderAudio(
  text: string
): Promise<AudioGenerationResult> {
  // Create a simple beep sound as placeholder
  const audioContext = new AudioContext();
  const duration = Math.min(text.length * 0.1, 10); // Max 10 seconds
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate a simple tone
  for (let i = 0; i < buffer.length; i++) {
    data[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.3;
  }

  // Convert to WAV blob
  const wav = audioBufferToWav(buffer);
  const blob = new Blob([wav], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);

  return {
    url,
    blob,
    duration,
  };
}

/**
 * Convert AudioBuffer to WAV format
 */
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;

  // Write WAV header
  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  // RIFF identifier
  setUint32(0x46464952);
  // File length
  setUint32(length - 8);
  // RIFF type
  setUint32(0x45564157);
  // Format chunk identifier
  setUint32(0x20746d66);
  // Format chunk length
  setUint32(16);
  // Sample format (raw)
  setUint16(1);
  // Channel count
  setUint16(buffer.numberOfChannels);
  // Sample rate
  setUint32(buffer.sampleRate);
  // Byte rate
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
  // Block align
  setUint16(buffer.numberOfChannels * 2);
  // Bits per sample
  setUint16(16);
  // Data chunk identifier
  setUint32(0x61746164);
  // Data chunk length
  setUint32(length - pos - 4);

  // Write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return arrayBuffer;
}
