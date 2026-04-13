import { failoverFetch } from '@/lib/apiFetch';

const RAW = import.meta.env.VITE_CAMERA_API_URL || 'https://mindcarex-camera-api.onrender.com,https://mindcarex-camera-api-5ccv.onrender.com';
const [PRIMARY, BACKUP] = RAW.split(',').map((u: string) => u.trim());

const dualFetch = (path: string, init?: RequestInit) =>
  failoverFetch(PRIMARY, BACKUP || PRIMARY, path, init);

async function unwrap<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (body.success === false) {
    throw new Error(body.error || body.detail || 'Request failed');
  }
  return (body.data ?? body) as T;
}

export interface CameraFrameResult {
  dominant_emotion: string;
  emotion_scores: Record<string, number>;
  face_detected: boolean;
}

export interface CameraSession {
  camera_session_id: string;
}

export const cameraService = {
  async startSession(sessionId: string): Promise<CameraSession> {
    const res = await dualFetch('/api/camera/session/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });
    return unwrap(res);
  },

  async uploadFrame(cameraSessionId: string, imageBlob: Blob): Promise<CameraFrameResult> {
    const form = new FormData();
    form.append('file', imageBlob, 'frame.jpg');
    const res = await dualFetch(`/api/camera/${cameraSessionId}/frame`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || err?.error || `Frame upload failed (${res.status})`);
    }
    return unwrap<CameraFrameResult>(res);
  },

  getLiveWebSocketUrl(cameraSessionId: string): string {
    const wsBase = PRIMARY.replace('https://', 'wss://').replace('http://', 'ws://');
    return `${wsBase}/api/camera/${cameraSessionId}/live`;
  },
};
