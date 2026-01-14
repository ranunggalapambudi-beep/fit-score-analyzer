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
import { biomotorCategories } from '@/data/biomotorTests';
import { TestSession } from '@/types/athlete';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface PerformanceTrendChartProps {
  sessions: TestSession[];
  height?: number;
  showLegend?: boolean;
}

// Color palette for categories
const categoryColors: Record<string, string> = {
  strength: 'hsl(var(--strength))',
  speed: 'hsl(var(--speed))',
  endurance: 'hsl(var(--endurance))',
  flexibility: 'hsl(var(--flexibility))',
  coordination: 'hsl(var(--coordination))',
  balance: 'hsl(var(--balance))',
};

export function PerformanceTrendChart({ 
  sessions, 
  height = 300, 
  showLegend = true 
}: PerformanceTrendChartProps) {
  const chartData = useMemo(() => {
    if (!sessions.length) return [];

    // Sort sessions by date (oldest first for trend line)
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sortedSessions.map((session) => {
      // Calculate average score per category
      const categoryScores: Record<string, number[]> = {};
      session.results.forEach((result) => {
        if (!categoryScores[result.categoryId]) {
          categoryScores[result.categoryId] = [];
        }
        categoryScores[result.categoryId].push(result.score);
      });

      const dataPoint: Record<string, any> = {
        date: format(new Date(session.date), 'd MMM yy', { locale: localeId }),
        fullDate: session.date,
      };

      // Calculate average for each category
      Object.entries(categoryScores).forEach(([catId, scores]) => {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const category = biomotorCategories.find((c) => c.id === catId);
        if (category) {
          dataPoint[category.name] = Number(avg.toFixed(2));
        }
      });

      // Calculate overall average
      const allScores = session.results.map((r) => r.score);
      if (allScores.length > 0) {
        dataPoint['Rata-rata'] = Number(
          (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2)
        );
      }

      return dataPoint;
    });
  }, [sessions]);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    sessions.forEach((session) => {
      session.results.forEach((result) => {
        const category = biomotorCategories.find((c) => c.id === result.categoryId);
        if (category) {
          categories.add(category.name);
        }
      });
    });
    return Array.from(categories);
  }, [sessions]);

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
        Belum ada data sesi tes
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
        <XAxis 
          dataKey="date" 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
        />
        <YAxis 
          domain={[0, 5]} 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickCount={6}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            color: 'hsl(var(--foreground))',
            fontSize: '12px',
          }}
          formatter={(value: number, name: string) => [value.toFixed(2), name]}
        />
        {showLegend && (
          <Legend 
            wrapperStyle={{ fontSize: '11px' }}
            iconType="circle"
            iconSize={8}
          />
        )}
        
        {/* Overall Average Line */}
        <Line
          type="monotone"
          dataKey="Rata-rata"
          stroke="hsl(var(--primary))"
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />

        {/* Category Lines */}
        {availableCategories.map((catName) => {
          const category = biomotorCategories.find((c) => c.name === catName);
          const color = category ? categoryColors[category.id] || 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))';
          return (
            <Line
              key={catName}
              type="monotone"
              dataKey={catName}
              stroke={color}
              strokeWidth={2}
              strokeOpacity={0.7}
              dot={{ fill: color, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Component to show score change between sessions
interface ScoreChangeProps {
  current: number;
  previous: number;
  showPercentage?: boolean;
}

export function ScoreChange({ current, previous, showPercentage = false }: ScoreChangeProps) {
  const diff = current - previous;
  const percentage = previous > 0 ? ((diff / previous) * 100).toFixed(1) : '0';
  
  if (diff === 0) {
    return <span className="text-muted-foreground text-xs">→ Tetap</span>;
  }
  
  if (diff > 0) {
    return (
      <span className="text-emerald-500 text-xs flex items-center gap-0.5">
        ↑ {showPercentage ? `${percentage}%` : diff.toFixed(2)}
      </span>
    );
  }
  
  return (
    <span className="text-rose-500 text-xs flex items-center gap-0.5">
      ↓ {showPercentage ? `${percentage}%` : Math.abs(diff).toFixed(2)}
    </span>
  );
}
