import api from '@/lib/api';
import type {
  NotificationPreferences,
  NotificationLog,
  SendNotificationRequest,
} from '@/types/analysis';

const BASE = '/api/notifications';

export const emailNotificationService = {
  /** Get notification preferences for current user */
  async getPreferences(): Promise<NotificationPreferences> {
    const res = await api.get<NotificationPreferences>(`${BASE}/preferences`);
    return res.data;
  },

  /** Update notification preferences */
  async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const res = await api.put<NotificationPreferences>(`${BASE}/preferences`, prefs);
    return res.data;
  },

  /** Get notification history for current user */
  async getNotificationHistory(page = 0, size = 20): Promise<{ content: NotificationLog[]; totalPages: number }> {
    const res = await api.get<{ content: NotificationLog[]; totalPages: number }>(`${BASE}/history`, {
      params: { page, size },
    });
    return res.data;
  },

  /** Send appointment reminder */
  async sendAppointmentReminder(appointmentId: string): Promise<{ status: string }> {
    const res = await api.post<{ status: string }>(`${BASE}/reminder/${appointmentId}`);
    return res.data;
  },

  /** Send session summary email */
  async sendSessionSummary(sessionId: string): Promise<{ status: string }> {
    const res = await api.post<{ status: string }>(`${BASE}/session-summary/${sessionId}`);
    return res.data;
  },

  /** Send custom notification */
  async sendNotification(request: SendNotificationRequest): Promise<{ status: string }> {
    const res = await api.post<{ status: string }>(`${BASE}/send`, request);
    return res.data;
  },

  /** Resend a failed notification */
  async resendNotification(notificationId: string): Promise<{ status: string }> {
    const res = await api.post<{ status: string }>(`${BASE}/${notificationId}/resend`);
    return res.data;
  },
};

export default emailNotificationService;
