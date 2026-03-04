import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Brain, AlertTriangle, CheckCircle, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import sessionSummaryService from '@/services/sessionSummaryService';
import type { SessionSummary, TranscriptionResult } from '@/types/analysis';

const RISK_COLORS: Record<string, string> = {
  none: 'bg-green-500/20 text-green-700 dark:text-green-400',
  low: 'bg-green-500/20 text-green-700 dark:text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  high: 'bg-red-500/20 text-red-700 dark:text-red-400',
};

export default function SessionSummaryPage() {
  const { sessionId: routeSessionId } = useParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(routeSessionId || null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTranscribing(true);
    try {
      // Create session if needed
      let sid = activeSessionId;
      if (!sid) {
        const session = await sessionSummaryService.createSession();
        sid = session.session_id;
        setActiveSessionId(sid);
      }

      // Transcribe
      const result = await sessionSummaryService.transcribe(sid, file);
      setTranscription(result);
      toast({ title: 'Transcription complete', description: `${result.duration?.toFixed(0)}s of audio transcribed` });
    } catch (err: any) {
      toast({ title: 'Transcription failed', description: err.message, variant: 'destructive' });
    } finally {
      setTranscribing(false);
    }
  };

  const generateSummary = async () => {
    if (!activeSessionId) return;
    setGenerating(true);
    try {
      const result = await sessionSummaryService.generateSummary(activeSessionId);
      setSummary(result);
      toast({ title: 'Summary generated' });
    } catch (err: any) {
      toast({ title: 'Generation failed', description: err.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!activeSessionId) return;
    sessionSummaryService.downloadReportPDF(activeSessionId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold md:text-2xl">Session Summary</h1>
            <p className="text-sm text-muted-foreground">
              {activeSessionId ? `Session: ${activeSessionId.slice(0, 8)}…` : 'Upload session audio for AI analysis'}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.mp3,.webm,.ogg"
              className="hidden"
              onChange={handleAudioUpload}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={transcribing}
              className="flex-1 sm:flex-none"
            >
              {transcribing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload Audio
            </Button>
            <Button
              onClick={generateSummary}
              disabled={generating || !activeSessionId || !transcription}
              className="flex-1 sm:flex-none"
            >
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
              Generate Summary
            </Button>
            <Button variant="outline" disabled={!summary} onClick={downloadPDF} className="flex-1 sm:flex-none">
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4 mt-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Risk Level</CardDescription>
                  <CardTitle>
                    {summary ? (
                      <Badge className={RISK_COLORS[summary.risk_level] || RISK_COLORS.low}>{summary.risk_level}</Badge>
                    ) : '—'}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Key Themes</CardDescription>
                  <CardTitle className="text-3xl">{summary?.key_themes?.length ?? '—'}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Emotional Tone</CardDescription>
                  <CardTitle className="text-2xl capitalize">{summary?.emotional_tone ?? '—'}</CardTitle>
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
                    <p className="text-sm leading-relaxed">{summary.short_summary}</p>
                    {summary.progress_notes && (
                      <div>
                        <p className="mb-2 text-sm font-medium">Progress Notes</p>
                        <p className="text-sm text-muted-foreground">{summary.progress_notes}</p>
                      </div>
                    )}
                    {summary.key_themes.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-medium">Key Themes</p>
                        <div className="flex flex-wrap gap-1">
                          {summary.key_themes.map((t, i) => (
                            <Badge key={i} variant="secondary">{t}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {summary.follow_up_recommended && (
                      <Badge variant="outline" className="border-primary text-primary">Follow-up recommended</Badge>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <Brain className="mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Upload audio → Transcribe → Generate summary</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Action Items & Risk Signals</CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.action_items?.length ? (
                  <div className="space-y-2">
                    {summary.action_items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg border p-3">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                    {summary.risk_signals && summary.risk_signals.length > 0 && (
                      <>
                        <p className="mt-4 text-sm font-medium">Risk Signals</p>
                        {summary.risk_signals.map((sig, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                            <p className="text-sm">{sig}</p>
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

          <TabsContent value="transcript" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Transcription</CardTitle>
                <CardDescription>
                  {transcription
                    ? `Language: ${transcription.language} · Duration: ${transcription.duration?.toFixed(0)}s · Model: ${transcription.model}`
                    : 'Upload audio to generate transcription'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transcription ? (
                  <div className="space-y-3">
                    <div className="max-h-96 overflow-y-auto rounded-lg bg-muted/50 p-4">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{transcription.text}</p>
                    </div>
                    {transcription.segments?.length > 0 && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-muted-foreground">View segments ({transcription.segments.length})</summary>
                        <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                          {transcription.segments.map((seg) => (
                            <div key={seg.id} className="flex gap-2 text-xs border-b py-1">
                              <span className="text-muted-foreground shrink-0">
                                {seg.start.toFixed(1)}s–{seg.end.toFixed(1)}s
                              </span>
                              <span>{seg.text}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Transcript will appear here after upload</p>
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
