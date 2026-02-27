import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Activity, Gauge, BarChart3, Loader2 } from 'lucide-react';
import type { VoiceAnalysisResult } from '@/types/analysis';

const STRESS_COLORS = {
  low: 'bg-green-500/20 text-green-700 dark:text-green-400',
  moderate: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  high: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
  critical: 'bg-red-500/20 text-red-700 dark:text-red-400',
};

export default function VoiceAnalysis() {
  const { sessionId } = useParams();
  const [analysis, setAnalysis] = useState<VoiceAnalysisResult | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);

  const stressCategory = analysis?.stressCategory || 'low';

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold md:text-2xl">Voice Analysis</h1>
            <p className="text-sm text-muted-foreground">
              {sessionId ? `Session: ${sessionId}` : 'Voice tone & stress detection'}
            </p>
          </div>
          <Button
            variant={isStreaming ? 'destructive' : 'default'}
            disabled={!sessionId}
            onClick={() => setIsStreaming(!isStreaming)}
            className="w-full sm:w-auto"
          >
            <Mic className="mr-2 h-4 w-4" />
            {isStreaming ? 'Stop Analysis' : 'Start Analysis'}
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Stress Level</CardDescription>
              <CardTitle className="text-3xl">{analysis ? `${analysis.averageStressLevel}%` : '—'}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={STRESS_COLORS[stressCategory]}>{stressCategory}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Dominant Tone</CardDescription>
              <CardTitle className="text-2xl capitalize">{analysis?.dominantEmotion || '—'}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Frames Analyzed</CardDescription>
              <CardTitle className="text-3xl">{analysis?.frames.length ?? '—'}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="stress" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="stress">Stress Timeline</TabsTrigger>
            <TabsTrigger value="distribution">Voice Emotions</TabsTrigger>
          </TabsList>

          <TabsContent value="stress" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Stress Level Over Time
                </CardTitle>
                <CardDescription>Real-time stress detection from voice patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 rounded-lg bg-muted/50 flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Stress chart renders when backend is connected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Voice Emotion Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 rounded-lg bg-muted/50 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Distribution chart appears after analysis</p>
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
