import api from '@/lib/api';
import type {
  TranscriptionResult,
  SessionSummary,
  SessionReport,
} from '@/types/analysis';

const BASE = '/api/analysis/summary';

export const sessionSummaryService = {
  /** Generate transcription from session audio */
  async generateTranscription(sessionId: string): Promise<TranscriptionResult> {
    const res = await api.post<TranscriptionResult>(`${BASE}/${sessionId}/transcribe`);
    return res.data;
  },

  /** Get existing transcription */
  async getTranscription(sessionId: string): Promise<TranscriptionResult> {
    const res = await api.get<TranscriptionResult>(`${BASE}/${sessionId}/transcription`);
    return res.data;
  },

  /** Generate AI-powered session summary */
  async generateSummary(sessionId: string): Promise<SessionSummary> {
    const res = await api.post<SessionSummary>(`${BASE}/${sessionId}/generate`);
    return res.data;
  },

  /** Get existing session summary */
  async getSummary(sessionId: string): Promise<SessionSummary> {
    const res = await api.get<SessionSummary>(`${BASE}/${sessionId}`);
    return res.data;
  },

  /** Get full session report (combines all analyses) */
  async getFullReport(sessionId: string): Promise<SessionReport> {
    const res = await api.get<SessionReport>(`${BASE}/${sessionId}/report`);
    return res.data;
  },

  /** Get patient session reports history */
  async getPatientReports(patientId: string): Promise<SessionReport[]> {
    const res = await api.get<SessionReport[]>(`${BASE}/patient/${patientId}/reports`);
    return res.data;
  },

  /** Download report as PDF */
  async downloadReportPDF(sessionId: string): Promise<Blob> {
    const res = await api.get(`${BASE}/${sessionId}/report/pdf`, { responseType: 'blob' });
    return res.data;
  },

  /** Update/edit summary (doctor only) */
  async updateSummary(sessionId: string, updates: Partial<SessionSummary>): Promise<SessionSummary> {
    const res = await api.put<SessionSummary>(`${BASE}/${sessionId}`, updates);
    return res.data;
  },
};

export default sessionSummaryService;
