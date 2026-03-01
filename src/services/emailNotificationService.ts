import api from '@/lib/api';
import type {
  NotificationPreferences,
  NotificationLog,
  NotificationStats,
  SendNotificationRequest,
} from '@/types/analysis';

const BASE = '/api/notifications';

export const emailNotificationService = {
  /** Get email history for current user */
  async getHistory(): Promise<NotificationLog[]> {
    const res = await api.get<NotificationLog[]>(`${BASE}/history`);
    return res.data;
  },

  /** Get email statistics */
  async getStatistics(): Promise<NotificationStats> {
    const res = await api.get<NotificationStats>(`${BASE}/statistics`);
    return res.data;
  },

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

  /** Resend a failed notification */
  async resendNotification(notificationId: string): Promise<{ status: string }> {
    const res = await api.post<{ status: string }>(`${BASE}/${notificationId}/resend`);
    return res.data;
  },
};

export default emailNotificationService;
