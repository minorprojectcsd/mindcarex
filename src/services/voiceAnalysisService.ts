import api from '@/lib/api';
import type {
  VoiceAnalysisResult,
  VoiceAnalysisFrame,
  StressTimeline,
} from '@/types/analysis';

const BASE = '/api/analysis/voice';

export const voiceAnalysisService = {
  /** Send audio chunk (base64) for real-time analysis */
  async analyzeAudioChunk(sessionId: string, audioData: string, userId: string): Promise<VoiceAnalysisFrame> {
    const res = await api.post<VoiceAnalysisFrame>(`${BASE}/${sessionId}/chunk`, {
      audioData,
      userId,
    });
    return res.data;
  },

  /** Get full voice analysis for a session */
  async getSessionVoiceAnalysis(sessionId: string, userId?: string): Promise<VoiceAnalysisResult> {
    const params = userId ? { userId } : {};
    const res = await api.get<VoiceAnalysisResult>(`${BASE}/${sessionId}`, { params });
    return res.data;
  },

  /** Get stress timeline for a session */
  async getStressTimeline(sessionId: string): Promise<StressTimeline> {
    const res = await api.get<StressTimeline>(`${BASE}/${sessionId}/stress-timeline`);
    return res.data;
  },

  /** Get voice emotion distribution */
  async getVoiceEmotionDistribution(sessionId: string): Promise<Record<string, number>> {
    const res = await api.get<Record<string, number>>(`${BASE}/${sessionId}/distribution`);
    return res.data;
  },

  /** Get patient voice analysis history */
  async getPatientVoiceHistory(patientId: string): Promise<VoiceAnalysisResult[]> {
    const res = await api.get<VoiceAnalysisResult[]>(`${BASE}/patient/${patientId}/history`);
    return res.data;
  },

  /** Start real-time voice analysis stream */
  async startRealtimeStream(sessionId: string): Promise<{ wsTopic: string }> {
    const res = await api.post<{ wsTopic: string }>(`${BASE}/${sessionId}/stream/start`);
    return res.data;
  },

  /** Stop real-time voice analysis stream */
  async stopRealtimeStream(sessionId: string): Promise<void> {
    await api.post(`${BASE}/${sessionId}/stream/stop`);
  },
};

export default voiceAnalysisService;
