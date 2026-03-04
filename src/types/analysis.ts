// ========================
// Part 1: Chat Analysis (Flask)
// ========================

export interface ChatAnalysisUploadResult {
  session_id: string;
  user: string;
  stats: {
    total_messages: number;
    total_words: number;
    media_shared: number;
    links_shared: number;
  };
  sentiment: {
    aggregate: {
      overall_label: 'positive' | 'negative' | 'neutral';
      score_0_100: number;
      avg_compound: number;
      positive_msgs: number;
      negative_msgs: number;
      neutral_msgs: number;
      positivity_ratio: number;
    };
    per_sender: Array<{
      sender: string;
      overall_label: string;
      score_0_100: number;
    }>;
    sample_size: number;
  };
  most_active: Array<{ user: string; messages: number; percent: number }>;
  monthly_timeline: Array<{ period: string; count: number }>;
  daily_timeline: Array<{ only_date: string; count: number }>;
  week_activity: Array<{ day: string; count: number }>;
  hour_activity: Array<{ hour: number; count: number }>;
  top_words: Array<{ word: string; count: number }>;
  top_emojis: Array<{ emoji: string; count: number }>;
  risk: {
    risk_level: 'low' | 'medium' | 'high';
    risk_flags: {
      high: string[];
      medium: string[];
      low: string[];
    };
    total_flagged: number;
  };
  participants: string[];
}

export interface ChatSentimentTimelinePoint {
  date: string;
  avg_sentiment: number;
}

export interface ChatSentimentTimeline {
  session_id: string;
  timeline: ChatSentimentTimelinePoint[];
}

export interface ChatRealtimeResult {
  message: string;
  analysis: {
    label: 'positive' | 'negative' | 'neutral';
    score: number;
    vader_compound: number;
    vader_pos: number;
    vader_neg: number;
    vader_neu: number;
    textblob_polarity: number;
    textblob_subjectivity: number;
  };
}

export interface ChatRiskResult {
  risk_level: 'low' | 'medium' | 'high';
  risk_flags: {
    high: string[];
    medium: string[];
    low: string[];
  };
  total_flagged: number;
}

// Legacy aliases for backward compat in pages
export type ChatAnalysisResult = ChatAnalysisUploadResult;
export interface SentimentTimeline extends ChatSentimentTimeline {}

// ========================
// Part 2: Facial Emotion (Socket.IO)
// ========================
export type FacialEmotion =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprise'
  | 'fear'
  | 'disgust'
  | 'neutral';

export interface EmotionFrameResult {
  session_id: string;
  frame_index: number;
  face_detected: boolean;
  dominant_emotion: FacialEmotion | null;
  dominant_score: number;
  emotions: Record<FacialEmotion, number>;
  face_confidence: number;
  region: { x: number; y: number; w: number; h: number } | null;
  live_summary: {
    distribution: Record<string, number>;
    average: {
      avg_score: number;
      positivity_ratio: number;
      negativity_ratio: number;
      neutral_ratio: number;
      most_frequent_emotion: string;
      total_frames: number;
    };
  } | null;
}

export interface EmotionSessionSummary {
  session_id: string;
  total_frames: number;
  face_detected_frames: number;
  no_face_frames: number;
  distribution: Record<FacialEmotion, number>;
  average: {
    avg_score: number;
    positivity_ratio: number;
    negativity_ratio: number;
    neutral_ratio: number;
    most_frequent_emotion: string;
    total_frames: number;
  };
  timeline: Array<{
    frame_index: number;
    timestamp: number;
    dominant_emotion: string;
    dominant_score: number;
  }>;
  duration_seconds: number;
}

// Legacy aliases
export type EmotionFrame = EmotionFrameResult;
export interface EmotionAnalysisResult {
  sessionId: string;
  userId: string;
  frames: EmotionFrameResult[];
  dominantEmotion: FacialEmotion;
  averageConfidence: number;
  emotionDistribution: Record<FacialEmotion, number>;
  analyzedAt: string;
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
// Part 3: Voice Stress Analysis (Flask)
// ========================
export interface VoiceChunkResult {
  stress_score: number;
  stress_label: 'calm' | 'mild_stress' | 'moderate_stress' | 'high_stress';
  stress_level: 'low' | 'mild' | 'medium' | 'high';
  contributing_factors: string[];
  suggestions: string[];
  pitch_mean_hz: number;
  pitch_std_hz: number;
  jitter_percent: number;
  shimmer_percent: number;
  speaking_rate_syllables_per_sec: number;
  duration_seconds: number;
  chunk_index: number;
}

export interface VoiceStressTimelinePoint {
  chunk_index: number;
  time_start_sec: number;
  time_end_sec: number;
  stress_score: number;
  stress_label: string;
  pitch_mean_hz: number;
}

export interface VoiceStressTimeline {
  timeline: VoiceStressTimelinePoint[];
}

export interface VoiceStressDistribution {
  distribution: {
    calm: number;
    mild_stress: number;
    moderate_stress: number;
    high_stress: number;
  };
}

// Legacy aliases
export type VoiceEmotion = 'calm' | 'happy' | 'sad' | 'angry' | 'fearful' | 'surprised' | 'neutral';

export interface VoiceAnalysisFrame {
  timestamp: string;
  emotion: VoiceEmotion;
  confidence: number;
  stressLevel: number;
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
// Part 4: Email Notifications (Spring Boot — unchanged)
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
  recipient: string;
  subject: string;
  emailType: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  errorMessage: string | null;
  appointmentId: string;
  sessionId: string | null;
  createdAt: string;
  sentAt: string | null;
}

export interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

export interface SendNotificationRequest {
  userId: string;
  type: NotificationType;
  appointmentId: string;
  customMessage?: string;
}

// ========================
// Part 5: Session Summary AI (Flask)
// ========================
export interface TranscriptionResult {
  text: string;
  language: string;
  duration: number;
  segments: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
  }>;
  model: string;
}

export interface SessionSummary {
  session_id: string;
  short_summary: string;
  key_themes: string[];
  emotional_tone: 'positive' | 'negative' | 'neutral' | 'mixed';
  risk_level: 'none' | 'low' | 'medium' | 'high';
  risk_signals: string[];
  action_items: string[];
  progress_notes: string;
  follow_up_recommended: boolean;
  sentiment_score: number;
  word_count: number;
  model_used: string;
  generated_at: number;
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
}

// Legacy compat aliases used in older pages
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

export interface EmotionTimelineEntry {
  timestamp: string;
  emotions: Record<FacialEmotion, number>;
}
