import api from '@/lib/api';
import type {
  EmotionAnalysisResult,
  EmotionFrame,
  PatientEmotionHistory,
} from '@/types/analysis';

const BASE = '/api/analysis/emotion';

export const emotionService = {
  /** Send a video frame (base64) for emotion detection */
  async analyzeFrame(sessionId: string, frameData: string, userId: string): Promise<EmotionFrame> {
    const res = await api.post<EmotionFrame>(`${BASE}/${sessionId}/frame`, {
      frameData,
      userId,
    });
    return res.data;
  },

  /** Get full emotion analysis for a session */
  async getSessionEmotions(sessionId: string, userId?: string): Promise<EmotionAnalysisResult> {
    const params = userId ? { userId } : {};
    const res = await api.get<EmotionAnalysisResult>(`${BASE}/${sessionId}`, { params });
    return res.data;
  },

  /** Get emotion distribution for a session */
  async getEmotionDistribution(sessionId: string): Promise<Record<string, number>> {
    const res = await api.get<Record<string, number>>(`${BASE}/${sessionId}/distribution`);
    return res.data;
  },

  /** Get patient emotion history across sessions */
  async getPatientEmotionHistory(patientId: string): Promise<PatientEmotionHistory> {
    const res = await api.get<PatientEmotionHistory>(`${BASE}/patient/${patientId}/history`);
    return res.data;
  },

  /** Get average emotion score for a session */
  async getAverageScore(sessionId: string): Promise<{ averageScore: number; dominantEmotion: string }> {
    const res = await api.get<{ averageScore: number; dominantEmotion: string }>(`${BASE}/${sessionId}/average`);
    return res.data;
  },

  /** Start real-time emotion streaming (returns WebSocket topic) */
  async startRealtimeStream(sessionId: string): Promise<{ wsTopic: string }> {
    const res = await api.post<{ wsTopic: string }>(`${BASE}/${sessionId}/stream/start`);
    return res.data;
  },

  /** Stop real-time emotion streaming */
  async stopRealtimeStream(sessionId: string): Promise<void> {
    await api.post(`${BASE}/${sessionId}/stream/stop`);
  },
};

export default emotionService;
