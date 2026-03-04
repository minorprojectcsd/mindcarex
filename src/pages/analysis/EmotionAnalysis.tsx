import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Activity, History, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import emotionStreamService from '@/services/emotionStreamService';
import type { FacialEmotion, EmotionFrameResult, EmotionSessionSummary } from '@/types/analysis';

const EMOTION_COLORS: Record<FacialEmotion, string> = {
  happy: 'bg-green-500/20 text-green-700 dark:text-green-400',
  sad: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  angry: 'bg-red-500/20 text-red-700 dark:text-red-400',
  surprise: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  fear: 'bg-purple-500/20 text-purple-700 dark:text-purple-400',
  disgust: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
  neutral: 'bg-muted text-muted-foreground',
};

const EMOTION_EMOJIS: Record<FacialEmotion, string> = {
  happy: '😊', sad: '😢', angry: '😠', surprise: '😲',
  fear: '😨', disgust: '🤢', neutral: '😐',
};

const ALL_EMOTIONS: FacialEmotion[] = ['happy', 'sad', 'angry', 'surprise', 'fear', 'disgust', 'neutral'];

export default function EmotionAnalysis() {
  const { sessionId } = useParams();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const [isStreaming, setIsStreaming] = useState(false);
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
  const [latestFrame, setLatestFrame] = useState<EmotionFrameResult | null>(null);
  const [summary, setSummary] = useState<EmotionSessionSummary | null>(null);

  const handleResult = useCallback((data: EmotionFrameResult) => {
    setLatestFrame(data);
  }, []);

  const startStream = async () => {
    try {
      // Start webcam
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      emotionStreamService.connect();
      emotionStreamService.onEmotionResult(handleResult);

      emotionStreamService.startSession(undefined, (sid) => {
        setLiveSessionId(sid);
        setIsStreaming(true);

        // Send frames every 200ms
        intervalRef.current = setInterval(() => {
          if (!videoRef.current || !canvasRef.current) return;
          const ctx = canvasRef.current.getContext('2d');
          if (!ctx) return;
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0);
          const base64 = canvasRef.current.toDataURL('image/jpeg', 0.7);
          emotionStreamService.sendFrame(sid, base64);
        }, 200);
      });
    } catch (err: any) {
      toast({ title: 'Camera error', description: err.message, variant: 'destructive' });
    }
  };

  const stopStream = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (liveSessionId) {
      emotionStreamService.stopSession(liveSessionId, (data) => {
        setSummary(data);
        toast({ title: 'Session complete', description: `Analyzed ${data.total_frames} frames` });
      });
    }

    // Stop webcam
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }

    emotionStreamService.offEmotionResult(handleResult);
    setIsStreaming(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      emotionStreamService.disconnect();
    };
  }, []);

  const distribution = summary?.distribution ?? latestFrame?.live_summary?.distribution;
  const dominantEmotion = latestFrame?.dominant_emotion;

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold md:text-2xl">Emotion Recognition</h1>
            <p className="text-sm text-muted-foreground">
              {liveSessionId ? `Live Session: ${liveSessionId.slice(0, 8)}…` : 'Real-time facial emotion detection'}
            </p>
          </div>
          <Button
            variant={isStreaming ? 'destructive' : 'default'}
            onClick={isStreaming ? stopStream : startStream}
            className="w-full sm:w-auto"
          >
            {isStreaming ? 'Stop Stream' : 'Start Live'}
          </Button>
        </div>

        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />

        <Tabs defaultValue="realtime" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="history">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="space-y-4 mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="sm:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Live Emotion Feed
                    {isStreaming && (
                      <span className="ml-2 flex items-center gap-1">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                        <span className="text-xs font-normal text-red-500">LIVE</span>
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden relative">
                    <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                    {!isStreaming && !videoRef.current?.srcObject && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Eye className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                          <p className="text-sm text-muted-foreground">Click "Start Live" to begin</p>
                        </div>
                      </div>
                    )}
                    {/* Emotion overlay */}
                    {isStreaming && latestFrame?.face_detected && dominantEmotion && (
                      <div className="absolute top-2 left-2 bg-background/80 rounded-lg px-3 py-2 backdrop-blur-sm">
                        <span className="text-lg mr-1">{EMOTION_EMOJIS[dominantEmotion]}</span>
                        <span className="capitalize font-medium">{dominantEmotion}</span>
                        <span className="text-xs text-muted-foreground ml-2">{latestFrame.dominant_score}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Dominant Emotion</CardDescription>
                  <CardTitle className="text-3xl">
                    {dominantEmotion ? (
                      <span className="flex items-center gap-2">
                        {EMOTION_EMOJIS[dominantEmotion]}
                        <span className="capitalize">{dominantEmotion}</span>
                      </span>
                    ) : '—'}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Confidence</CardDescription>
                  <CardTitle className="text-3xl">
                    {latestFrame?.face_detected ? `${latestFrame.dominant_score}%` : '—'}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Emotion Distribution
                </CardTitle>
                <CardDescription>Percentage of time spent in each emotional state</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ALL_EMOTIONS.map((emotion) => {
                    const value = distribution?.[emotion] ?? 0;
                    return (
                      <div key={emotion} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span>{EMOTION_EMOJIS[emotion]}</span>
                            <span className="capitalize">{emotion}</span>
                          </span>
                          <span className="text-muted-foreground">{value.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all ${EMOTION_COLORS[emotion].split(' ')[0]}`}
                            style={{ width: `${Math.min(value, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Session Emotion Timeline
                </CardTitle>
                <CardDescription>
                  {summary ? `${summary.total_frames} frames analyzed in ${summary.duration_seconds?.toFixed(0)}s` : 'Data populates after session ends'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.timeline && summary.timeline.length > 0 ? (
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {summary.timeline.map((pt, i) => (
                      <div key={i} className="flex justify-between text-xs border-b py-1">
                        <span className="text-muted-foreground">Frame {pt.frame_index}</span>
                        <span className="capitalize">{pt.dominant_emotion} ({pt.dominant_score}%)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 rounded-lg bg-muted/50 flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">Timeline appears after session ends</p>
                    </div>
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
