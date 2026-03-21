import { useMemo } from 'react';
import type { VoiceChunkResult } from '@/services/voiceAnalysisService';

interface Props {
  latestChunk: VoiceChunkResult | null;
  stressHistory: number[];
  faceEmotion?: string | null;
}

const COLOR_MAP: Record<string, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  red: '#ef4444',
};

function getStressColor(score: number, color?: string): string {
  if (color && COLOR_MAP[color]) return COLOR_MAP[color];
  if (score < 30) return '#22c55e';
  if (score < 50) return '#eab308';
  if (score < 72) return '#f97316';
  return '#ef4444';
}

function getStressBgClass(score: number, color?: string): string {
  const c = color || (score < 30 ? 'green' : score < 50 ? 'yellow' : score < 72 ? 'orange' : 'red');
  const map: Record<string, string> = {
    green: 'bg-green-500/15 border-green-500/30',
    yellow: 'bg-yellow-500/15 border-yellow-500/30',
    orange: 'bg-orange-500/15 border-orange-500/30',
    red: 'bg-red-500/15 border-red-500/30',
  };
  return map[c] || map.green;
}

function Sparkline({ data }: { data: number[] }) {
  const points = data.slice(-20);
  if (points.length < 2) return null;
  const w = 140, h = 36;
  const pathData = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (v / 100) * h;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} className="mt-1">
      <path d={pathData} fill="none" stroke={getStressColor(points[points.length - 1])} strokeWidth="2" />
      {points.length <= 12 && points.map((v, i) => (
        <circle key={i} cx={(i / (points.length - 1)) * w} cy={h - (v / 100) * h} r="2" fill={getStressColor(v)} />
      ))}
    </svg>
  );
}

export function StressOverlay({ latestChunk, stressHistory, faceEmotion }: Props) {
  const hasData = latestChunk !== null;
  const score = latestChunk?.stress_score ?? 0;
  const color = latestChunk?.color;
  const stressColor = getStressColor(score, color);
  const bgClass = getStressBgClass(score, color);
  const label = latestChunk?.mental_state_label || latestChunk?.mental_state?.replace(/_/g, ' ') || null;
  const topEmotions = useMemo(
    () => (Array.isArray(latestChunk?.top_emotions) ? latestChunk!.top_emotions : []).slice(0, 3),
    [latestChunk]
  );
  const transcript = latestChunk?.chunk_transcript || latestChunk?.transcript;

  if (!hasData) {
    return (
      <div className="rounded-xl border p-3 backdrop-blur-md bg-muted/30 border-muted-foreground/20 w-56 space-y-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex h-6 items-center rounded-full bg-muted px-2 text-xs font-semibold text-muted-foreground">
            Connecting…
          </span>
          <span className="text-lg font-bold text-muted-foreground">
            --<span className="text-xs font-normal">/100</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Waiting for analysis…</p>
        {faceEmotion && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">Face:</span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium capitalize">{faceEmotion}</span>
          </div>
        )}
        <div className="h-1.5 w-full rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-3 backdrop-blur-md ${bgClass} w-56 space-y-2`}>
      {/* Score + label */}
      <div className="flex items-center justify-between">
        <span
          className="inline-flex h-6 items-center rounded-full px-2 text-xs font-semibold text-white"
          style={{ backgroundColor: stressColor }}
        >
          {label || 'Analyzing…'}
        </span>
        <span className="text-lg font-bold" style={{ color: stressColor }}>
          {Math.round(score)}<span className="text-xs font-normal text-muted-foreground">/100</span>
        </span>
      </div>

      {/* Risk level */}
      {latestChunk?.risk_level && (
        <p className="text-[10px] text-muted-foreground">
          Risk: <span className="font-medium capitalize">{latestChunk.risk_level}</span>
        </p>
      )}

      {/* Face emotion badge */}
      {faceEmotion && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Face:</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium capitalize">{faceEmotion}</span>
        </div>
      )}

      {/* Top emotions */}
      {topEmotions.length > 0 && (
        <div className="space-y-1">
          {topEmotions.map((e) => (
            <div key={e.label} className="flex items-center gap-2">
              <span className="w-14 truncate text-[10px] capitalize text-muted-foreground">{e.label}</span>
              <div className="h-1.5 flex-1 rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(e.score * 100, 100)}%`,
                    backgroundColor: stressColor,
                  }}
                />
              </div>
              <span className="w-8 text-right text-[10px] font-medium">{Math.round(e.score * 100)}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Sparkline */}
      <Sparkline data={stressHistory} />

      {/* Transcript line */}
      {transcript && (
        <p className="line-clamp-2 text-[10px] italic text-muted-foreground">
          "{transcript}"
        </p>
      )}
    </div>
  );
}
