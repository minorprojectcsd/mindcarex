/**
 * Live Emotion Analysis via Socket.IO
 *
 * Connects to the Flask /emotion-live namespace.
 * Sends camera frames as base64, receives per-frame emotion results.
 */
import { io, Socket } from 'socket.io-client';
import type { EmotionFrameResult, EmotionSessionSummary } from '@/types/analysis';

const WS_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://mindcarex-backend.onrender.com';

export type EmotionResultCallback = (data: EmotionFrameResult) => void;
export type SessionSummaryCallback = (data: EmotionSessionSummary) => void;

class EmotionStreamService {
  private socket: Socket | null = null;
  private sessionId: string | null = null;

  /** Connect to the emotion-live namespace */
  connect() {
    if (this.socket?.connected) return;

    this.socket = io(`${WS_URL}/emotion-live`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('[EmotionStream] Connected');
    });

    this.socket.on('disconnect', () => {
      console.log('[EmotionStream] Disconnected');
    });

    this.socket.on('connect_error', (err) => {
      console.error('[EmotionStream] Connection error:', err.message);
    });
  }

  /** Start a session — server returns session_id */
  startSession(
    patientId?: string,
    onReady?: (sessionId: string) => void
  ) {
    if (!this.socket) this.connect();

    this.socket!.emit('start_session', { patient_id: patientId });

    this.socket!.once('session_ready', (data: { session_id: string }) => {
      this.sessionId = data.session_id;
      onReady?.(data.session_id);
    });
  }

  /** Send a camera frame (base64 jpeg) */
  sendFrame(
    sessionId: string,
    imageBase64: string,
    detector: 'opencv' | 'retinaface' = 'opencv'
  ) {
    this.socket?.emit('frame', {
      session_id: sessionId,
      image: imageBase64,
      detector,
    });
  }

  /** Subscribe to emotion results */
  onEmotionResult(callback: EmotionResultCallback) {
    this.socket?.on('emotion_result', callback);
  }

  /** Unsubscribe from emotion results */
  offEmotionResult(callback: EmotionResultCallback) {
    this.socket?.off('emotion_result', callback);
  }

  /** Stop the session and get a summary */
  stopSession(sessionId: string, onSummary?: SessionSummaryCallback) {
    if (onSummary) {
      this.socket?.once('session_summary', onSummary);
    }
    this.socket?.emit('stop_session', { session_id: sessionId });
    this.sessionId = null;
  }

  /** Disconnect entirely */
  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.sessionId = null;
  }

  get currentSessionId() {
    return this.sessionId;
  }

  get isConnected() {
    return this.socket?.connected ?? false;
  }
}

// Singleton instance
export const emotionStreamService = new EmotionStreamService();
export default emotionStreamService;
