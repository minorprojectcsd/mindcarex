import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmotionMetrics } from '@/types';

interface EmotionChartProps {
  metrics: EmotionMetrics;
  title?: string;
}

const EMOTION_COLORS: Record<string, string> = {
  neutral: 'hsl(210 12% 50%)',
  happy: 'hsl(152 55% 45%)',
  sad: 'hsl(215 60% 55%)',
  angry: 'hsl(0 72% 55%)',
  fearful: 'hsl(38 92% 55%)',
  surprised: 'hsl(280 60% 55%)',
  disgusted: 'hsl(150 30% 40%)',
};

export function EmotionChart({ metrics, title = 'Emotion Timeline' }: EmotionChartProps) {
  const chartData = useMemo(() => {
    return metrics.timeline.map((point) => ({
      time: Math.floor(point.timestamp / 60),
      ...point.scores,
    }));
  }, [metrics.timeline]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}m`}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 1]}
                tickFormatter={(value) => `${Math.round(value * 100)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${Math.round(value * 100)}%`]}
                labelFormatter={(label) => `${label} minutes`}
              />
              <Legend />
              {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
                <Line
                  key={emotion}
                  type="monotone"
                  dataKey={emotion}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
