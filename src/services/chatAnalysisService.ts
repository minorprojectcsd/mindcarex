import type { ChatAnalysisResult } from '@/types/chatAnalysis';
import { createDualFetch } from '@/lib/apiFetch';

const dualFetch = createDualFetch(
  import.meta.env.VITE_CHAT_API || import.meta.env.VITE_API_CHAT_URL || '',
  'https://mindcarex-chat-api.onrender.com',
  'https://mindcarex-chat-api-08st.onrender.com'
);

async function unwrap<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (body.success === false) {
    throw new Error(body.error || body.detail || 'Request failed');
  }
  return (body.data ?? body) as T;
}

export const chatAnalysisService = {
  async analyze(file: File, user = 'Overall'): Promise<ChatAnalysisResult> {
    const form = new FormData();
    form.append('file', file);
    form.append('user', user);

    const res = await dualFetch('/api/analysis/chat/analyze', {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.error || `Upload failed (${res.status})`);
    }

    return unwrap<ChatAnalysisResult>(res);
  },

  async realtime(message: string): Promise<{ sentiment: number; label: string }> {
    const res = await dualFetch('/api/analysis/chat/realtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return unwrap(res);
  },

  async getSession(sessionId: string): Promise<ChatAnalysisResult> {
    const res = await dualFetch(`/api/analysis/chat/${sessionId}`);
    return unwrap<ChatAnalysisResult>(res);
  },

  async getStats(sessionId: string) {
    const res = await dualFetch(`/api/analysis/chat/${sessionId}/stats`);
    return unwrap(res);
  },

  async getRisk(sessionId: string) {
    const res = await dualFetch(`/api/analysis/chat/${sessionId}/risk`);
    return unwrap(res);
  },

  async getMentalHealth(sessionId: string) {
    const res = await dualFetch(`/api/analysis/chat/${sessionId}/mental-health`);
    return unwrap(res);
  },

  async getSentimentTimeline(sessionId: string) {
    const res = await dualFetch(`/api/analysis/chat/${sessionId}/sentiment-timeline`);
    return unwrap(res);
  },

  async getParticipants(sessionId: string): Promise<string[]> {
    const res = await dualFetch(`/api/analysis/chat/${sessionId}/participants`);
    return unwrap<string[]>(res);
  },

  async getWords(sessionId: string) {
    const res = await dualFetch(`/api/analysis/chat/${sessionId}/words`);
    return unwrap(res);
  },

  async getEmojis(sessionId: string) {
    const res = await dualFetch(`/api/analysis/chat/${sessionId}/emojis`);
    return unwrap(res);
  },

  async getResponseTime(sessionId: string) {
    const res = await dualFetch(`/api/analysis/chat/${sessionId}/response-time`);
    return unwrap(res);
  },

  async getMostActive(sessionId: string) {
    const res = await dualFetch(`/api/analysis/chat/${sessionId}/most-active`);
    return unwrap(res);
  },
};
