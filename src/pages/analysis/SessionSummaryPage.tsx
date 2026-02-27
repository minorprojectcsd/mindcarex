import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Brain, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import type { SessionSummary as SessionSummaryType, SessionReport } from '@/types/analysis';

const RISK_COLORS = {
  low: 'bg-green-500/20 text-green-700 dark:text-green-400',
  moderate: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  high: 'bg-red-500/20 text-red-700 dark:text-red-400',
};

export default function SessionSummaryPage() {
  const { sessionId } = useParams();
  const [summary, setSummary] = useState<SessionSummaryType | null>(null);
  const [report, setReport] = useState<SessionReport | null>(null);
  const [generating, setGenerating] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold md:text-2xl">Session Summary</h1>
            <p className="text-sm text-muted-foreground">
              {sessionId ? `Session: ${sessionId}` : 'AI-powered session reports'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button disabled={generating || !sessionId} className="flex-1 sm:flex-none">
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
              Generate Summary
            </Button>
            <Button variant="outline" disabled={!summary} className="flex-1 sm:flex-none">
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="report">Full Report</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4 mt-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Risk Level</CardDescription>
                  <CardTitle>
                    {summary ? (
                      <Badge className={RISK_COLORS[summary.riskLevel]}>{summary.riskLevel}</Badge>
                    ) : '—'}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Key Topics</CardDescription>
                  <CardTitle className="text-3xl">{summary?.keyTopics.length ?? '—'}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Action Items</CardDescription>
                  <CardTitle className="text-3xl">{summary?.actionItems.length ?? '—'}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary ? (
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed">{summary.summary}</p>
                    <div>
                      <p className="mb-2 text-sm font-medium">Mood Assessment</p>
                      <p className="text-sm text-muted-foreground">{summary.moodAssessment}</p>
                    </div>
                    {summary.keyTopics.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-medium">Key Topics</p>
                        <div className="flex flex-wrap gap-1">
                          {summary.keyTopics.map((t, i) => (
                            <Badge key={i} variant="secondary">{t}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <Brain className="mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Generate a summary to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Action Items & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.actionItems.length ? (
                  <div className="space-y-2">
                    {summary.actionItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg border p-3">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                    {summary.recommendations.length > 0 && (
                      <>
                        <p className="mt-4 text-sm font-medium">Recommendations</p>
                        {summary.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <p className="text-sm">{rec}</p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <CheckCircle className="mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No action items yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Full Session Report</CardTitle>
                <CardDescription>Combined analysis from all modules</CardDescription>
              </CardHeader>
              <CardContent>
                {report ? (
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-muted-foreground">Patient:</span> {report.patientName}</div>
                      <div><span className="text-muted-foreground">Doctor:</span> {report.doctorName}</div>
                      <div><span className="text-muted-foreground">Date:</span> {new Date(report.date).toLocaleDateString()}</div>
                      <div><span className="text-muted-foreground">Duration:</span> {report.duration} min</div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {report.chatAnalysis && <Badge variant="outline">Chat ✓</Badge>}
                      {report.emotionAnalysis && <Badge variant="outline">Emotion ✓</Badge>}
                      {report.voiceAnalysis && <Badge variant="outline">Voice ✓</Badge>}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Full report will appear after analysis</p>
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
