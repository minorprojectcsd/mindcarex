import { Session, Schedule, EmotionMetrics, ChatMessage, Patient, ConsentSettings } from '@/types';
import { mockSessions, mockSchedules, mockEmotionMetrics, mockChatMessages, mockPatients } from './mockData';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Session API
export const sessionApi = {
  async getSessions(userId: string, role: 'PATIENT' | 'DOCTOR'): Promise<Session[]> {
    await delay(500);
    return role === 'PATIENT'
      ? mockSessions.filter(s => s.patientId === userId)
      : mockSessions;
  },

  async getSession(sessionId: string): Promise<Session | null> {
    await delay(300);
    return mockSessions.find(s => s.id === sessionId) || null;
  },

  async getEmotionMetrics(sessionId: string): Promise<EmotionMetrics | null> {
    await delay(400);
    return sessionId === 'session-1' ? mockEmotionMetrics : null;
  },

  async getChatTranscript(sessionId: string): Promise<ChatMessage[]> {
    await delay(300);
    return mockChatMessages.filter(m => m.sessionId === sessionId);
  },

  async updateSessionStatus(sessionId: string, status: Session['status']): Promise<void> {
    await delay(300);
    const session = mockSessions.find(s => s.id === sessionId);
    if (session) {
      session.status = status;
    }
  },
};

// Schedule API
export const scheduleApi = {
  async getSchedules(doctorId: string): Promise<Schedule[]> {
    await delay(400);
    return mockSchedules.filter(s => s.doctorId === doctorId);
  },

  async getPatientSchedules(patientId: string): Promise<Schedule[]> {
    await delay(400);
    return mockSchedules.filter(s => s.patientId === patientId);
  },

  async createSchedule(schedule: Omit<Schedule, 'id'>): Promise<Schedule> {
    await delay(500);
    const newSchedule: Schedule = {
      ...schedule,
      id: `schedule-${Date.now()}`,
    };
    mockSchedules.push(newSchedule);
    return newSchedule;
  },

  async updateSchedule(scheduleId: string, updates: Partial<Schedule>): Promise<void> {
    await delay(400);
    const idx = mockSchedules.findIndex(s => s.id === scheduleId);
    if (idx !== -1) {
      mockSchedules[idx] = { ...mockSchedules[idx], ...updates };
    }
  },

  async cancelSchedule(scheduleId: string): Promise<void> {
    await delay(300);
    const idx = mockSchedules.findIndex(s => s.id === scheduleId);
    if (idx !== -1) {
      mockSchedules[idx].status = 'cancelled';
    }
  },
};

// Patient API (for doctors)
export const patientApi = {
  async getPatients(doctorId: string): Promise<Patient[]> {
    await delay(400);
    return mockPatients.filter(p => p.primaryDoctorId === doctorId);
  },

  async getPatient(patientId: string): Promise<Patient | null> {
    await delay(300);
    return mockPatients.find(p => p.id === patientId) || null;
  },

  async getPatientSessions(patientId: string): Promise<Session[]> {
    await delay(400);
    return mockSessions.filter(s => s.patientId === patientId);
  },
};

// Consent API
export const consentApi = {
  async getConsent(userId: string): Promise<ConsentSettings> {
    await delay(200);
    const stored = localStorage.getItem(`consent_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
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

// Export chat transcript
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
