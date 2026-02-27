import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, TrendingUp, AlertTriangle, BarChart3, Loader2 } from 'lucide-react';
import type { ChatAnalysisResult, SentimentTimeline } from '@/types/analysis';

export default function ChatAnalysis() {
  const { sessionId } = useParams();
  const [analysis, setAnalysis] = useState<ChatAnalysisResult | null>(null);
  const [timeline, setTimeline] = useState<SentimentTimeline | null>(null);
  const [loading, setLoading] = useState(false);

  const sentimentColor = (label: string) => {
    switch (label) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold md:text-2xl">Chat Analysis</h1>
            <p className="text-sm text-muted-foreground">
              {sessionId ? `Session: ${sessionId}` : 'Select a session to analyze'}
            </p>
          </div>
          <Button disabled={loading || !sessionId} className="w-full sm:w-auto">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
            Analyze Chat
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="risks">Risk Flags</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Sentiment Score</CardDescription>
                  <CardTitle className={`text-3xl ${sentimentColor(analysis?.sentimentLabel || 'neutral')}`}>
                    {analysis ? `${(analysis.sentimentScore * 100).toFixed(0)}%` : '—'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">{analysis?.sentimentLabel || 'Awaiting analysis'}</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Keywords Detected</CardDescription>
                  <CardTitle className="text-3xl">{analysis?.keywords.length ?? '—'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {analysis?.keywords.slice(0, 5).map((kw, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardDescription>Topics Discussed</CardDescription>
                  <CardTitle className="text-3xl">{analysis?.topicsSummary.length ?? '—'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {analysis?.topicsSummary.slice(0, 3).map((t, i) => (
                      <p key={i} className="text-xs text-muted-foreground truncate">{t}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {!analysis && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No analysis data yet</p>
                  <p className="text-xs text-muted-foreground/70">Click "Analyze Chat" to start</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Sentiment Timeline
                </CardTitle>
                <CardDescription>Track sentiment changes throughout the session</CardDescription>
              </CardHeader>
              <CardContent>
                {timeline ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Trend: <Badge variant="secondary">{timeline.trend}</Badge></span>
                      <span className="text-muted-foreground">
                        Avg: {(timeline.averageSentiment * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-48 rounded-lg bg-muted/50 flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">Chart renders when Python backend is connected</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <TrendingUp className="mb-3 h-10 w-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">Sentiment timeline will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Flags
                </CardTitle>
                <CardDescription>Automatically detected concerns from chat content</CardDescription>
              </CardHeader>
              <CardContent>
                {analysis?.riskFlags?.length ? (
                  <div className="space-y-2">
                    {analysis.riskFlags.map((flag, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                        <p className="text-sm">{flag}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <AlertTriangle className="mb-3 h-10 w-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No risk flags detected</p>
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
