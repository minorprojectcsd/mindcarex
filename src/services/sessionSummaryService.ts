/**
 * Session Summary AI service — Flask backend.
 * Handles transcription (Groq Whisper) and AI summary (LLaMA3).
 */
import analysisApi, { unwrap, ANALYSIS_BASE } from '@/lib/analysisApi';
import type { TranscriptionResult, SessionSummary } from '@/types/analysis';

const BASE = '/api/analysis/summary';

export const sessionSummaryService = {
  /** Create a new summary session */
  async createSession(patientId?: string): Promise<{ session_id: string; status: string }> {
    return unwrap(analysisApi.post(`${BASE}/session/new`, { patient_id: patientId }));
  },

  /** Upload audio for transcription (Groq Whisper) */
  async transcribe(sessionId: string, audioFile: File | Blob, language?: string): Promise<TranscriptionResult> {
    const form = new FormData();
    form.append('audio', audioFile);
    if (language) form.append('language', language);
    return unwrap<TranscriptionResult>(
      analysisApi.post(`${BASE}/${sessionId}/transcribe`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );
  },

  /** Get stored transcription */
  async getTranscription(sessionId: string): Promise<TranscriptionResult> {
    return unwrap<TranscriptionResult>(analysisApi.get(`${BASE}/${sessionId}/transcription`));
  },

  /** Generate AI summary from transcript */
  async generateSummary(sessionId: string): Promise<SessionSummary> {
    return unwrap<SessionSummary>(analysisApi.post(`${BASE}/${sessionId}/generate`));
  },

  /** Get stored summary */
  async getSummary(sessionId: string): Promise<SessionSummary> {
    return unwrap<SessionSummary>(analysisApi.get(`${BASE}/${sessionId}`));
  },

  /** Get full report (summary + transcript preview + metadata) */
  async getFullReport(sessionId: string) {
    return unwrap(analysisApi.get(`${BASE}/${sessionId}/report`));
  },

  /** Download report as PDF — opens in new tab */
  downloadReportPDF(sessionId: string) {
    window.open(`${ANALYSIS_BASE}${BASE}/${sessionId}/report/pdf`, '_blank');
  },

  /** Edit/correct summary fields (doctor only) */
  async updateSummary(sessionId: string, updates: Partial<SessionSummary>): Promise<SessionSummary> {
    return unwrap<SessionSummary>(analysisApi.put(`${BASE}/${sessionId}`, updates));
  },

  /** Get all reports for a patient */
  async getPatientReports(patientId: string) {
    return unwrap(analysisApi.get(`${BASE}/patient/${patientId}/reports`));
  },
};

export default sessionSummaryService;
