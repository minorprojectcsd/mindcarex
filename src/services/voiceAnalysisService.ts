/**
 * Voice Stress Analysis service — Flask backend.
 * Sends audio chunks (multipart) and retrieves stress timelines.
 */
import analysisApi, { unwrap } from '@/lib/analysisApi';
import type {
  VoiceChunkResult,
  VoiceStressTimeline,
  VoiceStressDistribution,
} from '@/types/analysis';

const BASE = '/api/analysis/voice';

export const voiceAnalysisService = {
  /** Start a voice analysis stream */
  async startStream(patientId?: string): Promise<{ session_id: string; stream_active: boolean }> {
    return unwrap(analysisApi.post(`${BASE}/stream/start`, { patient_id: patientId }));
  },

  /** Send an audio chunk (5–30s clip) as multipart */
  async sendAudioChunk(sessionId: string, audioFile: File | Blob): Promise<VoiceChunkResult> {
    const form = new FormData();
    form.append('audio', audioFile);
    return unwrap<VoiceChunkResult>(
      analysisApi.post(`${BASE}/${sessionId}/chunk`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );
  },

  /** Get full session voice analysis */
  async getSessionAnalysis(sessionId: string) {
    return unwrap(analysisApi.get(`${BASE}/${sessionId}`));
  },

  /** Get stress timeline for line chart */
  async getStressTimeline(sessionId: string): Promise<VoiceStressTimeline> {
    return unwrap<VoiceStressTimeline>(analysisApi.get(`${BASE}/${sessionId}/stress-timeline`));
  },

  /** Get stress distribution */
  async getStressDistribution(sessionId: string): Promise<VoiceStressDistribution> {
    return unwrap<VoiceStressDistribution>(analysisApi.get(`${BASE}/${sessionId}/distribution`));
  },

  /** Get patient voice history */
  async getPatientVoiceHistory(patientId: string) {
    return unwrap(analysisApi.get(`${BASE}/patient/${patientId}/history`));
  },

  /** Stop voice analysis stream */
  async stopStream(sessionId: string): Promise<void> {
    await unwrap(analysisApi.post(`${BASE}/stream/stop`, { session_id: sessionId }));
  },
};

export default voiceAnalysisService;
