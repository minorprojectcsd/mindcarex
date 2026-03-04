import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, TrendingUp, AlertTriangle, BarChart3, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import chatAnalysisService from '@/services/chatAnalysisService';
import type { ChatAnalysisUploadResult, ChatSentimentTimeline } from '@/types/analysis';

export default function ChatAnalysis() {
  const { sessionId } = useParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analysis, setAnalysis] = useState<ChatAnalysisUploadResult | null>(null);
  const [timeline, setTimeline] = useState<ChatSentimentTimeline | null>(null);
  const [loading, setLoading] = useState(false);

  const sentimentColor = (label: string) => {
    switch (label) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const result = await chatAnalysisService.analyzeChat(file);
      setAnalysis(result);

      // Fetch sentiment timeline
      if (result.session_id) {
        try {
          const tl = await chatAnalysisService.getSentimentTimeline(result.session_id);
          setTimeline(tl);
        } catch { /* timeline optional */ }
      }

      toast({ title: 'Analysis complete', description: `Analyzed ${result.stats.total_messages} messages` });
    } catch (err: any) {
      toast({ title: 'Analysis failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadCachedAnalysis = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const result = await chatAnalysisService.getAnalysis(sessionId);
      setAnalysis(result);
      const tl = await chatAnalysisService.getSentimentTimeline(sessionId);
      setTimeline(tl);
    } catch (err: any) {
      toast({ title: 'Failed to load', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const agg = analysis?.sentiment?.aggregate;
  const risk = analysis?.risk;

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold md:text-2xl">Chat Analysis</h1>
            <p className="text-sm text-muted-foreground">
              {sessionId ? `Session: ${sessionId}` : 'Upload a WhatsApp chat export to analyze'}
            </p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload Chat
            </Button>
            {sessionId && (
              <Button variant="outline" onClick={loadCachedAnalysis} disabled={loading}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Load Cached
              </Button>
            )}
          </div>
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
                  <CardTitle className={`text-3xl ${sentimentColor(agg?.overall_label || 'neutral')}`}>
                    {agg ? `${agg.score_0_100}%` : '—'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">{agg?.overall_label || 'Awaiting analysis'}</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Top Words</CardDescription>
                  <CardTitle className="text-3xl">{analysis?.top_words?.length ?? '—'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {analysis?.top_words?.slice(0, 5).map((tw, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{tw.word} ({tw.count})</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="sm:col-span-2 lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardDescription>Messages Analyzed</CardDescription>
                  <CardTitle className="text-3xl">{analysis?.stats?.total_messages ?? '—'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Words: {analysis?.stats?.total_words ?? '—'}</p>
                    <p>Media: {analysis?.stats?.media_shared ?? '—'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {!analysis && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No analysis data yet</p>
                  <p className="text-xs text-muted-foreground/70">Upload a WhatsApp .txt export to start</p>
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
                <CardDescription>Track sentiment changes over time</CardDescription>
              </CardHeader>
              <CardContent>
                {timeline && timeline.timeline.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Points: <Badge variant="secondary">{timeline.timeline.length}</Badge></span>
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {timeline.timeline.map((pt, i) => (
                        <div key={i} className="flex justify-between text-xs border-b py-1">
                          <span className="text-muted-foreground">{pt.date}</span>
                          <span className={sentimentColor(pt.avg_sentiment >= 50 ? 'positive' : pt.avg_sentiment < 40 ? 'negative' : 'neutral')}>
                            {pt.avg_sentiment.toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <TrendingUp className="mb-3 h-10 w-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">Sentiment timeline will appear after analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Per-sender breakdown */}
            {analysis?.sentiment?.per_sender && (
              <Card>
                <CardHeader>
                  <CardTitle>Per-Sender Sentiment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.sentiment.per_sender.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>{s.sender}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{s.overall_label}</Badge>
                          <span className="text-muted-foreground">{s.score_0_100}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="risks" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Flags
                </CardTitle>
                <CardDescription>
                  {risk ? `Risk Level: ${risk.risk_level.toUpperCase()} — ${risk.total_flagged} flagged` : 'Automatically detected concerns from chat content'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {risk && risk.total_flagged > 0 ? (
                  <div className="space-y-4">
                    {risk.risk_flags.high.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-500 mb-2">High Risk</p>
                        {risk.risk_flags.high.map((flag, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 mb-1">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                            <p className="text-sm">{flag}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {risk.risk_flags.medium.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-yellow-500 mb-2">Medium Risk</p>
                        {risk.risk_flags.medium.map((flag, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 mb-1">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                            <p className="text-sm">{flag}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {risk.risk_flags.low.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Low Risk</p>
                        {risk.risk_flags.low.map((flag, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-lg border p-3 mb-1">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <p className="text-sm">{flag}</p>
                          </div>
                        ))}
                      </div>
                    )}
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
