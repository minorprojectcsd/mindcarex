import api from '@/lib/api';
import type {
  ChatAnalysisRequest,
  ChatAnalysisResult,
  SentimentTimeline,
} from '@/types/analysis';

const BASE = '/api/analysis/chat';

export const chatAnalysisService = {
  /** Analyze chat messages for a session */
  async analyzeChat(request: ChatAnalysisRequest): Promise<ChatAnalysisResult> {
    const res = await api.post<ChatAnalysisResult>(`${BASE}/analyze`, request);
    return res.data;
  },

  /** Get cached analysis result for a session */
  async getAnalysis(sessionId: string): Promise<ChatAnalysisResult> {
    const res = await api.get<ChatAnalysisResult>(`${BASE}/${sessionId}`);
    return res.data;
  },

  /** Get real-time sentiment timeline */
  async getSentimentTimeline(sessionId: string): Promise<SentimentTimeline> {
    const res = await api.get<SentimentTimeline>(`${BASE}/${sessionId}/sentiment-timeline`);
    return res.data;
  },

  /** Trigger real-time sentiment analysis for a single message */
  async analyzeSingleMessage(sessionId: string, message: string, senderId: string): Promise<{ score: number; label: string }> {
    const res = await api.post<{ score: number; label: string }>(`${BASE}/${sessionId}/realtime`, {
      message,
      senderId,
    });
    return res.data;
  },

  /** Get analysis history for a patient across sessions */
  async getPatientChatHistory(patientId: string): Promise<ChatAnalysisResult[]> {
    const res = await api.get<ChatAnalysisResult[]>(`${BASE}/patient/${patientId}/history`);
    return res.data;
  },
};

export default chatAnalysisService;
