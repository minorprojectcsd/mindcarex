import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Activity, History, BarChart3, Loader2 } from 'lucide-react';
import type { EmotionAnalysisResult, FacialEmotion } from '@/types/analysis';

const EMOTION_COLORS: Record<FacialEmotion, string> = {
  happy: 'bg-green-500/20 text-green-700 dark:text-green-400',
  sad: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  angry: 'bg-red-500/20 text-red-700 dark:text-red-400',
  surprised: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  fearful: 'bg-purple-500/20 text-purple-700 dark:text-purple-400',
  disgusted: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
  neutral: 'bg-muted text-muted-foreground',
  contempt: 'bg-pink-500/20 text-pink-700 dark:text-pink-400',
};

const EMOTION_EMOJIS: Record<FacialEmotion, string> = {
  happy: '😊', sad: '😢', angry: '😠', surprised: '😲',
  fearful: '😨', disgusted: '🤢', neutral: '😐', contempt: '😏',
};

export default function EmotionAnalysis() {
  const { sessionId } = useParams();
  const [analysis, setAnalysis] = useState<EmotionAnalysisResult | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);

  const allEmotions: FacialEmotion[] = ['happy', 'sad', 'angry', 'surprised', 'fearful', 'disgusted', 'neutral', 'contempt'];

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold md:text-2xl">Emotion Recognition</h1>
            <p className="text-sm text-muted-foreground">
              {sessionId ? `Session: ${sessionId}` : 'Facial emotion detection & analysis'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isStreaming ? 'destructive' : 'default'}
              disabled={loading || !sessionId}
              onClick={() => setIsStreaming(!isStreaming)}
              className="flex-1 sm:flex-none"
            >
              {isStreaming ? 'Stop Stream' : 'Start Live'}
            </Button>
          </div>
        </div>

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
                  <div className="aspect-video rounded-lg bg-muted/50 flex items-center justify-center">
                    <div className="text-center">
                      <Eye className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">Video emotion overlay renders here</p>
                      <p className="text-xs text-muted-foreground/60">Connect Python backend to enable</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Dominant Emotion</CardDescription>
                  <CardTitle className="text-3xl">
                    {analysis ? (
                      <span className="flex items-center gap-2">
                        {EMOTION_EMOJIS[analysis.dominantEmotion]}
                        <span className="capitalize">{analysis.dominantEmotion}</span>
                      </span>
                    ) : '—'}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Confidence</CardDescription>
                  <CardTitle className="text-3xl">
                    {analysis ? `${(analysis.averageConfidence * 100).toFixed(0)}%` : '—'}
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
                  {allEmotions.map((emotion) => {
                    const value = analysis?.emotionDistribution[emotion] ?? 0;
                    return (
                      <div key={emotion} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span>{EMOTION_EMOJIS[emotion]}</span>
                            <span className="capitalize">{emotion}</span>
                          </span>
                          <span className="text-muted-foreground">{(value * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all ${EMOTION_COLORS[emotion].split(' ')[0]}`}
                            style={{ width: `${value * 100}%` }}
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
                  Patient Emotional Timeline
                </CardTitle>
                <CardDescription>Emotion trends across past sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 rounded-lg bg-muted/50 flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Patient timeline chart renders here</p>
                    <p className="text-xs text-muted-foreground/60">Data populates after sessions are analyzed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
