import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VideoRoom } from '@/components/video/VideoRoom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ConsentSettings, Session } from '@/types';
import { sessionService } from '@/services/sessionService';
import { useAuth } from '@/contexts/AuthContext';

export default function VideoSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [consent, setConsent] = useState<ConsentSettings>({
    cameraEnabled: true,
    micEnabled: true,
    emotionTrackingEnabled: true,
    chatAnalysisEnabled: true,
  });
  const [hasConfirmedConsent, setHasConfirmedConsent] = useState(false);

  // Load session details
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsLoading(false);
        return;
      }

      // For demo/dev mode - allow "demo-session" without API call
      if (sessionId === 'demo-session' || sessionId.startsWith('demo')) {
        setSession({
          id: sessionId,
          doctor_id: 'demo-doctor',
          patient_id: 'demo-patient',
          start_time: new Date().toISOString(),
          end_time: null,
          status: 'in-progress',
        });
        setIsLoading(false);
        return;
      }

      try {
        const sessionData = await sessionService.getSession(sessionId);
        setSession(sessionData);
      } catch (err: any) {
        console.error('Failed to load session:', err);
        // For development - create a mock session if API not available
        if (err.code === 'ERR_NETWORK' || err.response?.status === 404) {
          setSession({
            id: sessionId,
            doctor_id: user?.id || 'unknown',
            patient_id: user?.id || 'unknown',
            start_time: new Date().toISOString(),
            end_time: null,
            status: 'in-progress',
          });
        } else {
          setError(err.message || 'Failed to load session');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [sessionId, user?.id]);

  const handleConsentChange = (key: keyof ConsentSettings) => {
    setConsent({ ...consent, [key]: !consent[key] });
  };

  const handleConfirm = async () => {
    // Optionally start the session via API
    if (session && sessionId && !sessionId.startsWith('demo')) {
      try {
        await sessionService.startSession(sessionId);
      } catch (err) {
        console.warn('Could not start session via API:', err);
      }
    }
    setHasConfirmedConsent(true);
  };

  const handleEndSession = async () => {
    if (session && sessionId && !sessionId.startsWith('demo')) {
      try {
        await sessionService.endSession(sessionId);
      } catch (err) {
        console.warn('Could not end session via API:', err);
      }
    }
  };

  const getBackUrl = () => {
    if (user?.role === 'DOCTOR') return '/doctor/dashboard';
    if (user?.role === 'PATIENT') return '/patient/dashboard';
    return '/dashboard';
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading session...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-xl animate-slide-up">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(getBackUrl())}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
              <h2 className="mt-4 text-xl font-semibold">Session Not Found</h2>
              <p className="mt-2 text-muted-foreground">{error}</p>
              <Button className="mt-6" onClick={() => navigate(getBackUrl())}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Show consent confirmation before joining
  if (!hasConfirmedConsent) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-xl animate-slide-up">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(getBackUrl())}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Before You Join</CardTitle>
              <CardDescription>
                Please review and confirm your privacy settings for this session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-warning-light p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
                  <div className="text-sm">
                    <p className="font-medium text-warning-foreground">
                      Privacy Notice
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Your session may be analyzed to provide better mental health insights.
                      You can control what data is collected below.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Camera</p>
                    <p className="text-sm text-muted-foreground">
                      Enable video during the session
                    </p>
                  </div>
                  <Switch
                    checked={consent.cameraEnabled}
                    onCheckedChange={() => handleConsentChange('cameraEnabled')}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Microphone</p>
                    <p className="text-sm text-muted-foreground">
                      Enable audio during the session
                    </p>
                  </div>
                  <Switch
                    checked={consent.micEnabled}
                    onCheckedChange={() => handleConsentChange('micEnabled')}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Emotion Analysis</p>
                    <p className="text-sm text-muted-foreground">
                      Allow AI to analyze facial expressions
                    </p>
                  </div>
                  <Switch
                    checked={consent.emotionTrackingEnabled}
                    onCheckedChange={() => handleConsentChange('emotionTrackingEnabled')}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Chat Analysis</p>
                    <p className="text-sm text-muted-foreground">
                      Allow AI to analyze chat messages
                    </p>
                  </div>
                  <Switch
                    checked={consent.chatAnalysisEnabled}
                    onCheckedChange={() => handleConsentChange('chatAnalysisEnabled')}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(getBackUrl())}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleConfirm}>
                  Join Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-5rem)] md:h-[calc(100vh-8rem)]">
        <VideoRoom
          sessionId={sessionId || 'demo-session'}
          consent={consent}
          onEnd={handleEndSession}
        />
      </div>
    </DashboardLayout>
  );
}
