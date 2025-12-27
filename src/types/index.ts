export type UserRole = 'PATIENT' | 'DOCTOR';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Patient extends User {
  role: 'PATIENT';
  dateOfBirth?: string;
  primaryDoctorId?: string;
}

export interface Doctor extends User {
  role: 'DOCTOR';
  specialization: string;
  licenseNumber: string;
  availability: Availability[];
}

export interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Session {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  duration: number; // minutes
  status: SessionStatus;
  notes?: string;
  summary?: string;
  emotionMetrics?: EmotionMetrics;
  chatTranscript?: ChatMessage[];
}

export type SessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface EmotionMetrics {
  sessionId: string;
  averages: EmotionScores;
  timeline: EmotionTimepoint[];
  riskIndicators: RiskIndicator[];
}

export interface EmotionScores {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  surprised: number;
  disgusted: number;
}

export interface EmotionTimepoint {
  timestamp: number;
  scores: EmotionScores;
}

export interface RiskIndicator {
  type: 'high_anxiety' | 'depression_signs' | 'distress' | 'improvement';
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  description: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Schedule {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  scheduledAt: string;
  duration: number;
  status: SessionStatus;
  notes?: string;
}

export interface ConsentSettings {
  cameraEnabled: boolean;
  micEnabled: boolean;
  chatAnalysisEnabled: boolean;
  emotionTrackingEnabled: boolean;
}

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  payload: RTCSessionDescriptionInit | RTCIceCandidateInit;
  from: string;
  to: string;
}

export interface SocketEvents {
  // Chat events
  'chat:message': ChatMessage;
  'chat:typing': { sessionId: string; userId: string; isTyping: boolean };
  
  // WebRTC signaling
  'webrtc:offer': WebRTCSignal;
  'webrtc:answer': WebRTCSignal;
  'webrtc:ice-candidate': WebRTCSignal;
  
  // Session events
  'session:join': { sessionId: string; userId: string };
  'session:leave': { sessionId: string; userId: string };
  'session:end': { sessionId: string };
  
  // Risk alerts
  'risk:alert': RiskIndicator;
}
