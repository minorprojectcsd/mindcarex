import type { ChatAnalysisResult } from '@/types/chatAnalysis';

const BASE = import.meta.env.VITE_API_CHAT_URL || 'https://mindcarex-chat-api.onrender.com';

async function unwrap<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (body.success === false) {
    throw new Error(body.error || body.detail || 'Request failed');
  }
  // API may return data at top level or nested under `data`
  return (body.data ?? body) as T;
}

export const chatAnalysisService = {
  /** Upload a WhatsApp .txt export and get full analysis */
  async analyze(file: File, user = 'Overall'): Promise<ChatAnalysisResult> {
    const form = new FormData();
    form.append('file', file);
    form.append('user', user);

    const res = await fetch(`${BASE}/api/analysis/chat/analyze`, {
      method: 'POST',
      body: form,
      // Do NOT set Content-Type — browser handles multipart boundary
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(
        err?.detail || err?.error || `Upload failed (${res.status})`
      );
    }

    return unwrap<ChatAnalysisResult>(res);
  },

  /** Fetch cached full analysis by session_id */
  async getSession(sessionId: string): Promise<ChatAnalysisResult> {
    const res = await fetch(`${BASE}/api/analysis/chat/${sessionId}`);
    return unwrap<ChatAnalysisResult>(res);
  },

  /** Fetch risk data only */
  async getRisk(sessionId: string) {
    const res = await fetch(`${BASE}/api/analysis/chat/${sessionId}/risk`);
    return unwrap(res);
  },

  /** Fetch mental-health data only */
  async getMentalHealth(sessionId: string) {
    const res = await fetch(`${BASE}/api/analysis/chat/${sessionId}/mental-health`);
    return unwrap(res);
  },

  /** Fetch sentiment timeline */
  async getSentimentTimeline(sessionId: string) {
    const res = await fetch(`${BASE}/api/analysis/chat/${sessionId}/sentiment-timeline`);
    return unwrap(res);
  },
};
