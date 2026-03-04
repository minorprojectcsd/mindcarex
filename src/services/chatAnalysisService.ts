import analysisApi, { unwrap } from '@/lib/analysisApi';
import type {
  ChatAnalysisUploadResult,
  ChatSentimentTimeline,
  ChatRealtimeResult,
  ChatRiskResult,
} from '@/types/analysis';

const BASE = '/api/analysis/chat';

export const chatAnalysisService = {
  /** Upload WhatsApp .txt export and get full analysis */
  async analyzeChat(file: File, user?: string): Promise<ChatAnalysisUploadResult> {
    const form = new FormData();
    form.append('file', file);
    if (user) form.append('user', user);
    return unwrap<ChatAnalysisUploadResult>(
      analysisApi.post(`${BASE}/analyze`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );
  },

  /** Get cached analysis result for a session */
  async getAnalysis(sessionId: string): Promise<ChatAnalysisUploadResult> {
    return unwrap<ChatAnalysisUploadResult>(analysisApi.get(`${BASE}/${sessionId}`));
  },

  /** Get sentiment timeline for line chart */
  async getSentimentTimeline(sessionId: string): Promise<ChatSentimentTimeline> {
    return unwrap<ChatSentimentTimeline>(analysisApi.get(`${BASE}/${sessionId}/sentiment-timeline`));
  },

  /** Quick stats only */
  async getStats(sessionId: string) {
    return unwrap(analysisApi.get(`${BASE}/${sessionId}/stats`));
  },

  /** Risk flags only */
  async getRisk(sessionId: string): Promise<ChatRiskResult> {
    return unwrap<ChatRiskResult>(analysisApi.get(`${BASE}/${sessionId}/risk`));
  },

  /** Get participants list */
  async getParticipants(sessionId: string): Promise<{ participants: string[] }> {
    return unwrap<{ participants: string[] }>(analysisApi.get(`${BASE}/${sessionId}/participants`));
  },

  /** Real-time sentiment on a single typed message */
  async analyzeRealtimeMessage(message: string): Promise<ChatRealtimeResult> {
    return unwrap<ChatRealtimeResult>(analysisApi.post(`${BASE}/realtime`, { message }));
  },

  /** Get analysis history for a patient */
  async getPatientChatHistory(patientId: string) {
    return unwrap(analysisApi.get(`${BASE}/patient/${patientId}/history`));
  },
};

export default chatAnalysisService;
