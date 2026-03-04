/**
 * REST fallback for Emotion Analysis (when WebSocket is unavailable).
 * Uses the Flask analysis backend.
 */
import analysisApi, { unwrap } from '@/lib/analysisApi';
import type { EmotionSessionSummary } from '@/types/analysis';

const BASE = '/api/analysis/emotion';

export const emotionService = {
  /** Start a new emotion stream session */
  async startStream(patientId?: string): Promise<{ session_id: string }> {
    return unwrap(analysisApi.post(`${BASE}/stream/start`, { patient_id: patientId }));
  },

  /** Send a single frame (base64 or multipart) */
  async analyzeFrame(sessionId: string, imageBase64: string) {
    return unwrap(analysisApi.post(`${BASE}/${sessionId}/frame`, { image_base64: imageBase64 }));
  },

  /** Get live snapshot (latest frame + running totals) */
  async getLiveSnapshot(sessionId: string) {
    return unwrap(analysisApi.get(`${BASE}/${sessionId}/live-snapshot`));
  },

  /** Get full session analysis */
  async getSessionEmotions(sessionId: string) {
    return unwrap(analysisApi.get(`${BASE}/${sessionId}`));
  },

  /** Get emotion distribution */
  async getEmotionDistribution(sessionId: string): Promise<Record<string, number>> {
    return unwrap<Record<string, number>>(analysisApi.get(`${BASE}/${sessionId}/distribution`));
  },

  /** Get average score */
  async getAverageScore(sessionId: string) {
    return unwrap(analysisApi.get(`${BASE}/${sessionId}/average`));
  },

  /** Get patient emotion history */
  async getPatientEmotionHistory(patientId: string) {
    return unwrap(analysisApi.get(`${BASE}/patient/${patientId}/history`));
  },

  /** Stop emotion stream */
  async stopStream(sessionId: string): Promise<void> {
    await unwrap(analysisApi.post(`${BASE}/stream/stop`, { session_id: sessionId }));
  },
};

export default emotionService;
