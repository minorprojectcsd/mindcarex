// Unified API layer - switches between Supabase direct, Spring Boot/Flask, or mock data
import { API_CONFIG } from '@/config/api';
import { supabaseScheduleApi, supabaseSessionApi, supabasePatientApi } from './supabaseApi';
import { springScheduleApi, springSessionApi, springPatientApi, flaskAiApi } from './backendApi';
import { mockSessions, mockSchedules, mockEmotionMetrics, mockChatMessages, mockPatients } from './mockData';
import type {
  Session,
  Schedule,
  Patient,
  EmotionMetrics,
  ChatMessage,
  ConsentSettings,
  EmotionFrameRequest,
  EmotionFrameResponse,
  ChatAnalysisRequest,
  ChatAnalysis,
  SessionSummaryRequest,
} from '@/types';

const { USE_MOCK, USE_SUPABASE_DIRECT } = API_CONFIG;

// Simulated API delay for mock mode
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============= Schedule API =============
export const scheduleApi = {
  async createSchedule(schedule: Omit<Schedule, 'id'>): Promise<Schedule> {
    if (USE_MOCK) {
      await delay(500);
      const newSchedule: Schedule = { ...schedule, id: `schedule-${Date.now()}` };
      mockSchedules.push(newSchedule);
      return newSchedule;
    }
    return USE_SUPABASE_DIRECT 
      ? supabaseScheduleApi.createSchedule(schedule)
      : springScheduleApi.createSchedule(schedule);
  },

  async getDoctorSchedules(doctorId: string): Promise<Schedule[]> {
    if (USE_MOCK) {
      await delay(400);
      return mockSchedules.filter(s => s.doctor_id === doctorId);
    }
    return USE_SUPABASE_DIRECT
      ? supabaseScheduleApi.getDoctorSchedules(doctorId)
      : springScheduleApi.getDoctorSchedules(doctorId);
  },

  async getPatientSchedules(patientId: string): Promise<Schedule[]> {
    if (USE_MOCK) {
      await delay(400);
      return mockSchedules.filter(s => s.patient_id === patientId);
    }
    return USE_SUPABASE_DIRECT
      ? supabaseScheduleApi.getPatientSchedules(patientId)
      : springScheduleApi.getPatientSchedules(patientId);
  },

  async updateSchedule(scheduleId: string, updates: Partial<Schedule>): Promise<void> {
    if (USE_MOCK) {
      await delay(400);
      const idx = mockSchedules.findIndex(s => s.id === scheduleId);
      if (idx !== -1) mockSchedules[idx] = { ...mockSchedules[idx], ...updates };
      return;
    }
    return USE_SUPABASE_DIRECT
      ? supabaseScheduleApi.updateSchedule(scheduleId, updates)
      : springScheduleApi.updateSchedule(scheduleId, updates);
  },

  async cancelSchedule(scheduleId: string): Promise<void> {
    return this.updateSchedule(scheduleId, { status: 'cancelled' });
  },
};

// ============= Session API =============
export const sessionApi = {
  async startSession(doctorId: string, patientId: string): Promise<Session> {
    if (USE_MOCK) {
      await delay(500);
      return {
        id: `session-${Date.now()}`,
        doctor_id: doctorId,
        patient_id: patientId,
        start_time: new Date().toISOString(),
        end_time: null,
        status: 'in-progress',
      };
    }
    return USE_SUPABASE_DIRECT
      ? supabaseSessionApi.startSession(doctorId, patientId)
      : springSessionApi.startSession(doctorId, patientId);
  },

  async endSession(sessionId: string): Promise<Session> {
    if (USE_MOCK) {
      await delay(500);
      return {
        id: sessionId,
        doctor_id: 'doctor-1',
        patient_id: 'patient-1',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        status: 'completed',
      };
    }
    return USE_SUPABASE_DIRECT
      ? supabaseSessionApi.endSession(sessionId)
      : springSessionApi.endSession(sessionId);
  },

  async getSession(sessionId: string): Promise<Session | null> {
    if (USE_MOCK) {
      await delay(300);
      return mockSessions.find(s => s.id === sessionId) || null;
    }
    return USE_SUPABASE_DIRECT
      ? supabaseSessionApi.getSession(sessionId)
      : springSessionApi.getSession(sessionId);
  },

  async getSessionHistory(userId: string): Promise<Session[]> {
    if (USE_MOCK) {
      await delay(400);
      return mockSessions.filter(s => s.patient_id === userId || s.doctor_id === userId);
    }
    return USE_SUPABASE_DIRECT
      ? supabaseSessionApi.getSessionHistory(userId)
      : springSessionApi.getSessionHistory(userId);
  },

  async getSessions(userId: string, role: 'PATIENT' | 'DOCTOR'): Promise<Session[]> {
    return this.getSessionHistory(userId);
  },

  async getEmotionMetrics(sessionId: string): Promise<EmotionMetrics | null> {
    if (USE_MOCK) {
      await delay(400);
      return sessionId === 'session-1' ? mockEmotionMetrics : null;
    }
    // For real data, fetch from Supabase emotion summary
    const summary = await supabaseSessionApi.getEmotionSummary(sessionId);
    if (!summary) return null;
    
    return {
      sessionId,
      averages: {
        happy: summary.avg_happy || 0,
        sad: summary.avg_sad || 0,
        neutral: summary.avg_neutral || 0,
        angry: summary.avg_angry || 0,
        fearful: summary.avg_fearful || 0,
        surprised: summary.avg_surprised || 0,
        disgusted: summary.avg_disgusted || 0,
      },
      timeline: [],
      riskIndicators: [],
    };
  },

  async getChatTranscript(sessionId: string): Promise<ChatMessage[]> {
    if (USE_MOCK) {
      await delay(300);
      return mockChatMessages.filter(m => m.sessionId === sessionId);
    }
    const messages = await supabaseSessionApi.getMessages(sessionId);
    return messages.map(m => ({
      id: m.id,
      sessionId: m.session_id,
      senderId: m.sender_id,
      senderRole: m.sender_role || 'PATIENT',
      content: m.content,
      timestamp: m.created_at,
      isRead: true,
    }));
  },

  async sendMessage(sessionId: string, senderId: string, content: string, senderRole: 'PATIENT' | 'DOCTOR') {
    if (USE_MOCK) {
      await delay(200);
      return { id: `msg-${Date.now()}`, session_id: sessionId, sender_id: senderId, content, created_at: new Date().toISOString() };
    }
    return supabaseSessionApi.sendMessage(sessionId, senderId, content, senderRole);
  },
};

// ============= Patient API =============
export const patientApi = {
  async getPatients(doctorId: string): Promise<Patient[]> {
    if (USE_MOCK) {
      await delay(400);
      return mockPatients.filter(p => p.primaryDoctorId === doctorId);
    }
    return USE_SUPABASE_DIRECT
      ? supabasePatientApi.getPatients(doctorId)
      : springPatientApi.getPatients(doctorId);
  },

  async getPatient(patientId: string): Promise<Patient | null> {
    if (USE_MOCK) {
      await delay(300);
      return mockPatients.find(p => p.id === patientId) || null;
    }
    return USE_SUPABASE_DIRECT
      ? supabasePatientApi.getPatient(patientId)
      : springPatientApi.getPatient(patientId);
  },

  async getPatientSessions(patientId: string): Promise<Session[]> {
    return sessionApi.getSessionHistory(patientId);
  },
};

// ============= AI/ML API (always goes to Flask) =============
export const aiApi = {
  async analyzeEmotionFrame(data: EmotionFrameRequest): Promise<EmotionFrameResponse> {
    if (USE_MOCK) {
      await delay(200);
      const emotions = ['happy', 'sad', 'neutral', 'angry', 'stressed'] as const;
      return {
        emotion: emotions[Math.floor(Math.random() * emotions.length)],
        confidence: 0.75 + Math.random() * 0.2,
        rollingAverage: {
          happy: 0.3 + Math.random() * 0.2,
          sad: 0.1 + Math.random() * 0.1,
          neutral: 0.4 + Math.random() * 0.2,
          angry: Math.random() * 0.05,
          stressed: 0.1 + Math.random() * 0.1,
        },
      };
    }
    return flaskAiApi.analyzeEmotionFrame(data);
  },

  async analyzeChatMessages(data: ChatAnalysisRequest): Promise<ChatAnalysis> {
    if (USE_MOCK) {
      await delay(500);
      return {
        session_id: data.sessionId,
        sentiment: 'positive',
        risk_score: 0.15,
        keywords: ['anxiety', 'improvement', 'coping', 'progress'],
      };
    }
    return flaskAiApi.analyzeChatMessages(data);
  },

  async generateSessionSummary(data: SessionSummaryRequest): Promise<{ summary: string }> {
    if (USE_MOCK) {
      await delay(1000);
      return {
        summary: 'Patient showed positive engagement throughout the session. Key topics discussed include anxiety management techniques and sleep improvement strategies.',
      };
    }
    return flaskAiApi.generateSessionSummary(data);
  },
};

// ============= Consent API (local storage for now) =============
export const consentApi = {
  async getConsent(userId: string): Promise<ConsentSettings> {
    await delay(200);
    const stored = localStorage.getItem(`consent_${userId}`);
    if (stored) return JSON.parse(stored);
    return {
      cameraEnabled: true,
      micEnabled: true,
      chatAnalysisEnabled: true,
      emotionTrackingEnabled: true,
    };
  },

  async updateConsent(userId: string, settings: ConsentSettings): Promise<void> {
    await delay(300);
    localStorage.setItem(`consent_${userId}`, JSON.stringify(settings));
  },
};

// ============= Export Utilities =============
export const exportChatTranscript = (messages: ChatMessage[], format: 'txt' | 'pdf' = 'txt'): void => {
  const content = messages
    .map(m => {
      const time = new Date(m.timestamp).toLocaleTimeString();
      const sender = m.senderRole === 'DOCTOR' ? 'Doctor' : 'Patient';
      return `[${time}] ${sender}: ${m.content}`;
    })
    .join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-transcript-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Re-export for backward compatibility
export { supabaseScheduleApi, supabaseSessionApi, supabasePatientApi } from './supabaseApi';
export { springScheduleApi, springSessionApi, springPatientApi, flaskAiApi } from './backendApi';
