
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';

interface ProtocolChartProps {
  protocols: Record<string, number>;
}

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#80D8C3', '#A19AD3', '#72BF78'];

export function ProtocolChart({ protocols }: ProtocolChartProps) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const data = Object.entries(protocols).map(([name, value]) => ({
    name: name.toUpperCase(),
    value: Number(value.toFixed(1)),
  }));

  // Custom tooltip component with theme-aware styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className={`
            px-3 py-2 rounded-lg border shadow-lg text-sm
            ${isDark 
              ? 'bg-gray-800 border-gray-600 text-gray-100' 
              : 'bg-white border-gray-300 text-gray-900'
            }
          `}
          style={{
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          <p className="font-semibold">{label}</p>
          <p className={isDark ? 'text-blue-300' : 'text-blue-600'}>
            {`${payload[0].value}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">Protocol Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke={isDark ? '#374151' : '#e5e7eb'}
                strokeWidth={1}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top"
                height={36}
                wrapperStyle={{ 
                  fontSize: '12px',
                  paddingBottom: '10px',
                  color: isDark ? '#e5e7eb' : '#374151'
                }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
