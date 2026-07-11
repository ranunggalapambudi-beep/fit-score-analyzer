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
  showValues?: boolean;
}

export function RadarChart({ data, compareData, height = 300, showValues = false }: RadarChartProps) {
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
            fontSize: showValues ? 13 : 11,
            fontFamily: 'var(--font-body)',
          }}
          tickLine={false}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 5]} 
          tick={{ 
            fill: 'hsl(var(--muted-foreground))', 
            fontSize: showValues ? 11 : 10,
          }}
          tickCount={6}
          axisLine={false}
        />
        <Radar
          name="Skor"
          dataKey="score"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.35}
          strokeWidth={2}
          dot={showValues ? { r: 4, fill: 'hsl(var(--primary))', stroke: '#fff', strokeWidth: 1 } : false}
          label={
            showValues
              ? ({ x, y, value }: any) => (
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    fill="#111827"
                    fontSize={12}
                    fontWeight={700}
                  >
                    {Number(value).toFixed(1)}
                  </text>
                )
              : false
          }
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
  categoryScores: Record<string, number>,
  onlyTested: boolean = false
): { category: string; score: number; fullMark: number }[] {
  // Body composition is tracked separately and MUST NOT be part of the
  // 8-category biomotor radar/average.
  const EXCLUDED = new Set(['body-composition']);
  const categories = biomotorCategories
    .filter((cat) => !EXCLUDED.has(cat.id))
    .map((cat) => ({
    category: cat.name,
    categoryId: cat.id,
    score: categoryScores[cat.id] || 0,
    fullMark: 5,
  }));

  // Filter to only show categories that were tested
  if (onlyTested) {
    return categories.filter((cat) => categoryScores[cat.categoryId] > 0);
  }

  return categories;
}
