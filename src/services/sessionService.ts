import api from '@/lib/api';
import { Session, Message, EmotionMetric, ChatAnalysis, SessionSummary } from '@/types';

// ============= Session API Endpoints =============
// These endpoints match the Spring Boot backend specification

export interface CreateSessionRequest {
  doctorId: string;
  patientId: string;
  scheduledTime?: string;
}

export interface UpdateSessionRequest {
  status?: string;
  notes?: string;
  endTime?: string;
}

export const sessionService = {
  // ============= Session CRUD =============
  
  // Create a new session
  async createSession(data: CreateSessionRequest): Promise<Session> {
    const response = await api.post<Session>('/api/sessions', data);
    return response.data;
  },

  // Get session by ID
  async getSession(sessionId: string): Promise<Session> {
    const response = await api.get<Session>(`/api/sessions/${sessionId}`);
    return response.data;
  },

  // Get all sessions for current user (based on role)
  async getMySessions(): Promise<Session[]> {
    const response = await api.get<Session[]>('/api/sessions/my');
    return response.data;
  },

  // Get doctor's sessions
  async getDoctorSessions(): Promise<Session[]> {
    const response = await api.get<Session[]>('/api/doctor/sessions');
    return response.data;
  },

  // Update session
  async updateSession(sessionId: string, data: UpdateSessionRequest): Promise<Session> {
    const response = await api.put<Session>(`/api/sessions/${sessionId}`, data);
    return response.data;
  },

  // Start a session (change status to in-progress)
  async startSession(sessionId: string): Promise<Session> {
    const response = await api.post<Session>(`/api/sessions/${sessionId}/start`);
    return response.data;
  },

  // End a session (change status to completed)
  async endSession(sessionId: string): Promise<Session> {
    const response = await api.post<Session>(`/api/sessions/${sessionId}/end`);
    return response.data;
  },

  // ============= Messages =============

  // Get messages for a session
  async getSessionMessages(sessionId: string): Promise<Message[]> {
    const response = await api.get<Message[]>(`/api/sessions/${sessionId}/messages`);
    return response.data;
  },

  // Send a message in a session
  async sendMessage(sessionId: string, content: string): Promise<Message> {
    const response = await api.post<Message>(`/api/sessions/${sessionId}/messages`, { content });
    return response.data;
  },

  // ============= Emotion Metrics =============

  // Get emotion metrics for a session
  async getEmotionMetrics(sessionId: string): Promise<EmotionMetric[]> {
    const response = await api.get<EmotionMetric[]>(`/api/sessions/${sessionId}/emotions`);
    return response.data;
  },

  // Submit emotion frame for analysis (to Flask backend via Spring Boot proxy)
  async submitEmotionFrame(sessionId: string, userId: string, imageBase64: string): Promise<any> {
    const response = await api.post(`/api/sessions/${sessionId}/emotions/frame`, {
      userId,
      imageBase64,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  },

  // ============= Chat Analysis =============

  // Get chat analysis for a session
  async getChatAnalysis(sessionId: string): Promise<ChatAnalysis> {
    const response = await api.get<ChatAnalysis>(`/api/sessions/${sessionId}/analysis`);
    return response.data;
  },

  // ============= Session Summary =============

  // Get session summary
  async getSessionSummary(sessionId: string): Promise<SessionSummary> {
    const response = await api.get<SessionSummary>(`/api/sessions/${sessionId}/summary`);
    return response.data;
  },

  // Generate session summary (triggers AI summary generation)
  async generateSessionSummary(sessionId: string): Promise<SessionSummary> {
    const response = await api.post<SessionSummary>(`/api/sessions/${sessionId}/summary/generate`);
    return response.data;
  },
};

export default sessionService;
