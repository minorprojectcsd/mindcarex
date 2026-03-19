const BASE = import.meta.env.VITE_VOICE_API_URL || 'https://mindcarex-audio-api.onrender.com';

async function unwrap<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (body.success === false) {
    throw new Error(body.error || body.detail || 'Request failed');
  }
  return (body.data ?? body) as T;
}

export interface VoiceChunkResult {
  stress_score: number;
  mental_state: string;
  color: string;
  top_emotions: { emotion: string; score: number }[];
  transcript: string;
  acoustic_features?: {
    pitch_mean_hz: number;
    pitch_std_hz: number;
    spectral_entropy: number;
    speaking_rate: number;
    silence_ratio: number;
    mode: string;
  };
}

export interface VoiceSessionSummary {
  avg_stress: number;
  peak_stress: number;
  trend: string;
  risk_level: string;
  state_distribution: Record<string, number>;
  top_emotions: { emotion: string; score: number }[];
  pitch_contour: number[];
  entropy_trend: number[];
  pitch_summary?: { contour: number[] };
  duration_seconds?: number;
}

export interface VoiceSession {
  session_id: string;
  status: string;
  chunks: VoiceChunkResult[];
  summary: VoiceSessionSummary | null;
}

export interface VoiceTimelinePoint {
  chunk_index: number;
  stress_score: number;
  pitch_hz: number;
  entropy: number;
}

export interface VoiceTranscript {
  full_transcript: string;
  chunks: { index: number; transcript: string; timestamp: string }[];
}

export interface VoiceHistoryEntry {
  session_id: string;
  status: string;
  chunk_count: number;
  summary: VoiceSessionSummary | null;
  created_at: string;
  label?: string;
}

export const voiceAnalysisService = {
  async startSession(patientId: string, label?: string): Promise<{ session_id: string }> {
    const res = await fetch(`${BASE}/api/voice/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: patientId, label: label || 'Consultation' }),
    });
    return unwrap(res);
  },

  async stopSession(sessionId?: string): Promise<VoiceSessionSummary> {
    const res = await fetch(`${BASE}/api/voice/session/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionId ? { session_id: sessionId } : {}),
    });
    return unwrap(res);
  },

  async uploadChunk(sessionId: string, audioBlob: Blob): Promise<VoiceChunkResult> {
    const form = new FormData();
    form.append('file', audioBlob, 'chunk.webm');
    const res = await fetch(`${BASE}/api/voice/${sessionId}/chunk`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.error || `Chunk upload failed (${res.status})`);
    }
    return unwrap<VoiceChunkResult>(res);
  },

  getLiveWebSocketUrl(sessionId: string): string {
    const wsBase = BASE.replace('https://', 'wss://').replace('http://', 'ws://');
    return `${wsBase}/api/voice/${sessionId}/live`;
  },

  async getSession(sessionId: string): Promise<VoiceSession> {
    const res = await fetch(`${BASE}/api/voice/${sessionId}`);
    return unwrap<VoiceSession>(res);
  },

  async getTimeline(sessionId: string): Promise<VoiceTimelinePoint[]> {
    const res = await fetch(`${BASE}/api/voice/${sessionId}/timeline`);
    return unwrap<VoiceTimelinePoint[]>(res);
  },

  async getSummary(sessionId: string): Promise<VoiceSessionSummary> {
    const res = await fetch(`${BASE}/api/voice/${sessionId}/summary`);
    return unwrap<VoiceSessionSummary>(res);
  },

  async getTranscript(sessionId: string): Promise<VoiceTranscript> {
    const res = await fetch(`${BASE}/api/voice/${sessionId}/transcript`);
    return unwrap<VoiceTranscript>(res);
  },

  async getPatientHistory(patientId: string): Promise<VoiceHistoryEntry[]> {
    const res = await fetch(`${BASE}/api/voice/patient/${patientId}/history`);
    return unwrap<VoiceHistoryEntry[]>(res);
  },

  async getStatus(): Promise<{ status: string; groq_stt: boolean; hf_emotion: boolean }> {
    const res = await fetch(`${BASE}/api/voice/status`);
    return unwrap(res);
  },
};
