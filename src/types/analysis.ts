// ========================
// Part 1: Chat Analysis
// ========================
export interface ChatAnalysisRequest {
  sessionId: string;
  messages: ChatMessageInput[];
}

export interface ChatMessageInput {
  senderId: string;
  senderRole: 'DOCTOR' | 'PATIENT';
  message: string;
  timestamp: string;
}

export interface ChatAnalysisResult {
  sessionId: string;
  sentimentScore: number; // -1 to 1
  sentimentLabel: 'positive' | 'negative' | 'neutral';
  keywords: string[];
  topicsSummary: string[];
  riskFlags: string[];
  analyzedAt: string;
}

export interface SentimentDataPoint {
  timestamp: string;
  score: number;
  label: string;
  message: string;
}

export interface SentimentTimeline {
  sessionId: string;
  dataPoints: SentimentDataPoint[];
  averageSentiment: number;
  trend: 'improving' | 'declining' | 'stable';
}

// ========================
// Part 2: Facial Emotion
// ========================
export type FacialEmotion =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'fearful'
  | 'disgusted'
  | 'neutral'
  | 'contempt';

export interface EmotionFrame {
  timestamp: string;
  emotion: FacialEmotion;
  confidence: number;
  faceDetected: boolean;
}

export interface EmotionAnalysisResult {
  sessionId: string;
  userId: string;
  frames: EmotionFrame[];
  dominantEmotion: FacialEmotion;
  averageConfidence: number;
  emotionDistribution: Record<FacialEmotion, number>;
  analyzedAt: string;
}

export interface EmotionTimelineEntry {
  timestamp: string;
  emotions: Record<FacialEmotion, number>;
}

export interface PatientEmotionHistory {
  patientId: string;
  sessions: {
    sessionId: string;
    date: string;
    dominantEmotion: FacialEmotion;
    averageScore: number;
  }[];
}

// ========================
// Part 3: Voice Emotion
// ========================
export type VoiceEmotion = 'calm' | 'happy' | 'sad' | 'angry' | 'fearful' | 'surprised' | 'neutral';

export interface VoiceAnalysisFrame {
  timestamp: string;
  emotion: VoiceEmotion;
  confidence: number;
  stressLevel: number; // 0 to 100
  pitch: number;
  energy: number;
}

export interface VoiceAnalysisResult {
  sessionId: string;
  userId: string;
  frames: VoiceAnalysisFrame[];
  dominantEmotion: VoiceEmotion;
  averageStressLevel: number;
  stressCategory: 'low' | 'moderate' | 'high' | 'critical';
  emotionDistribution: Record<VoiceEmotion, number>;
  analyzedAt: string;
}

export interface StressTimeline {
  sessionId: string;
  dataPoints: { timestamp: string; stressLevel: number }[];
  peakStress: number;
  averageStress: number;
}

// ========================
// Part 4: Email Notifications
// ========================
export type NotificationType =
  | 'APPOINTMENT_REMINDER'
  | 'SESSION_SUMMARY'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_RESCHEDULED';

export interface NotificationPreferences {
  userId: string;
  emailReminders: boolean;
  reminderMinutesBefore: number;
  sessionSummaryEmail: boolean;
  statusUpdateEmail: boolean;
}

export interface NotificationLog {
  id: string;
  userId: string;
  type: NotificationType;
  subject: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'pending';
  appointmentId?: string;
}

export interface SendNotificationRequest {
  userId: string;
  type: NotificationType;
  appointmentId: string;
  customMessage?: string;
}

// ========================
// Part 5: Session Summary AI
// ========================
export interface TranscriptionResult {
  sessionId: string;
  transcript: string;
  speakers: { role: string; segments: { start: number; end: number; text: string }[] }[];
  language: string;
  duration: number;
}

export interface SessionSummary {
  id: string;
  sessionId: string;
  summary: string;
  keyTopics: string[];
  actionItems: string[];
  moodAssessment: string;
  riskLevel: 'low' | 'moderate' | 'high';
  recommendations: string[];
  generatedAt: string;
}

export interface SessionReport {
  sessionId: string;
  patientName: string;
  doctorName: string;
  date: string;
  duration: number;
  summary: SessionSummary;
  emotionAnalysis?: EmotionAnalysisResult;
  voiceAnalysis?: VoiceAnalysisResult;
  chatAnalysis?: ChatAnalysisResult;
  sentimentTimeline?: SentimentTimeline;
}
