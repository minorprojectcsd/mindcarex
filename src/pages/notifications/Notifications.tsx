import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Mail, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import type { NotificationPreferences, NotificationLog } from '@/types/analysis';

export default function Notifications() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    userId: '',
    emailReminders: true,
    reminderMinutesBefore: 10,
    sessionSummaryEmail: true,
    statusUpdateEmail: true,
  });
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [saving, setSaving] = useState(false);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold md:text-2xl">Notifications</h1>
            <p className="text-sm text-muted-foreground">Email notifications & preferences</p>
          </div>
        </div>

        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Control what emails you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Appointment Reminders</Label>
                    <p className="text-xs text-muted-foreground">Get reminded 10 minutes before</p>
                  </div>
                  <Switch
                    checked={preferences.emailReminders}
                    onCheckedChange={(v) => setPreferences((p) => ({ ...p, emailReminders: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Summaries</Label>
                    <p className="text-xs text-muted-foreground">AI-generated summary after sessions</p>
                  </div>
                  <Switch
                    checked={preferences.sessionSummaryEmail}
                    onCheckedChange={(v) => setPreferences((p) => ({ ...p, sessionSummaryEmail: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Status Updates</Label>
                    <p className="text-xs text-muted-foreground">Appointment confirmations & changes</p>
                  </div>
                  <Switch
                    checked={preferences.statusUpdateEmail}
                    onCheckedChange={(v) => setPreferences((p) => ({ ...p, statusUpdateEmail: v }))}
                  />
                </div>
                <Button className="w-full sm:w-auto" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Preferences'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Notification History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logs.length > 0 ? (
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-center gap-3 rounded-lg border p-3">
                        {statusIcon(log.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{log.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.sentAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-xs">{log.type.replace(/_/g, ' ')}</Badge>
                        {log.status === 'failed' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <Mail className="mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
