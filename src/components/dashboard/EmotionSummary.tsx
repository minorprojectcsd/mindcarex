import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmotionScores } from '@/types';
import { cn } from '@/lib/utils';

interface EmotionSummaryProps {
  averages: EmotionScores;
  title?: string;
}

const EMOTION_CONFIG: Record<keyof EmotionScores, { label: string; color: string; bgColor: string }> = {
  neutral: { label: 'Neutral', color: 'text-muted-foreground', bgColor: 'bg-secondary' },
  happy: { label: 'Happy', color: 'text-success', bgColor: 'bg-success-light' },
  sad: { label: 'Sad', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  angry: { label: 'Angry', color: 'text-destructive', bgColor: 'bg-destructive-light' },
  fearful: { label: 'Fearful', color: 'text-warning-foreground', bgColor: 'bg-warning-light' },
  surprised: { label: 'Surprised', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  disgusted: { label: 'Disgusted', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
};

export function EmotionSummary({ averages, title = 'Emotion Averages' }: EmotionSummaryProps) {
  const sortedEmotions = Object.entries(averages).sort(([, a], [, b]) => b - a);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedEmotions.map(([emotion, value]) => {
          const config = EMOTION_CONFIG[emotion as keyof EmotionScores];
          const percentage = Math.round(value * 100);

          return (
            <div key={emotion} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className={cn('font-medium capitalize', config.color)}>
                  {config.label}
                </span>
                <span className="text-muted-foreground">{percentage}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', config.bgColor)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
