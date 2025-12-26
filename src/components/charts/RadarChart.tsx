import { useMemo } from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { biomotorCategories } from '@/data/biomotorTests';

interface RadarChartProps {
  data: {
    category: string;
    score: number;
    fullMark: number;
  }[];
  compareData?: {
    category: string;
    score: number;
    fullMark: number;
  }[];
  height?: number;
}

export function RadarChart({ data, compareData, height = 300 }: RadarChartProps) {
  const chartData = useMemo(() => {
    if (!compareData) return data;
    
    return data.map((item, index) => ({
      ...item,
      compareScore: compareData[index]?.score || 0,
    }));
  }, [data, compareData]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid 
          stroke="hsl(var(--border))" 
          strokeOpacity={0.5}
        />
        <PolarAngleAxis 
          dataKey="category" 
          tick={{ 
            fill: 'hsl(var(--muted-foreground))', 
            fontSize: 11,
            fontFamily: 'var(--font-body)',
          }}
          tickLine={false}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 5]} 
          tick={{ 
            fill: 'hsl(var(--muted-foreground))', 
            fontSize: 10 
          }}
          tickCount={6}
          axisLine={false}
        />
        <Radar
          name="Skor"
          dataKey="score"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        {compareData && (
          <Radar
            name="Pembanding"
            dataKey="compareScore"
            stroke="hsl(var(--accent))"
            fill="hsl(var(--accent))"
            fillOpacity={0.2}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        )}
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            color: 'hsl(var(--foreground))',
          }}
          formatter={(value: number) => [value.toFixed(1), 'Skor']}
        />
        {compareData && <Legend />}
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}

export function generateRadarData(
  categoryScores: Record<string, number>
): { category: string; score: number; fullMark: number }[] {
  return biomotorCategories.map((cat) => ({
    category: cat.name,
    score: categoryScores[cat.id] || 0,
    fullMark: 5,
  }));
}
