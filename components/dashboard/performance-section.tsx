
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';
import { AnalysisResult } from '@/lib/types';

interface PerformanceSectionProps {
  analysis: AnalysisResult;
}

export function PerformanceSection({ analysis }: PerformanceSectionProps) {
  // Generate mock time series data for charts
  const generateTimeSeriesData = (baseValue: number, variance: number = 0.3) => {
    return Array.from({ length: 12 }, (_, i) => ({
      time: `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
      value: Math.max(0, baseValue + (Math.random() - 0.5) * variance * baseValue),
    }));
  };

  const retransmissionData = generateTimeSeriesData(
    analysis.tcpAnalysis?.retransmissionRate || 0, 0.5
  );

  const jitterData = generateTimeSeriesData(
    analysis.udpAnalysis?.jitterAvg || 0, 0.4
  );

  const responseTimeData = generateTimeSeriesData(
    analysis.dnsAnalysis?.responseTimeAvg || 0, 0.6
  );

  const throughputData = generateTimeSeriesData(analysis.throughput / 1024 / 1024, 0.3);

  const MetricCard = ({ 
    title, 
    value, 
    unit, 
    icon: Icon, 
    data, 
    color = '#60B5FF',
    threshold,
    isGood 
  }: {
    title: string;
    value: number;
    unit: string;
    icon: any;
    data: any[];
    color?: string;
    threshold?: number;
    isGood?: boolean;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${
              isGood !== undefined 
                ? isGood ? 'text-green-400' : 'text-red-400'
                : 'text-foreground'
            }`}>
              {value.toFixed(value < 1 ? 3 : 1)}
            </span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
          
          {threshold && (
            <div className="text-xs text-muted-foreground">
              Threshold: {threshold.toFixed(1)} {unit}
            </div>
          )}
          
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                />
                <Tooltip 
                  formatter={(value: number) => [
                    `${value.toFixed(value < 1 ? 3 : 1)} ${unit}`, 
                    title
                  ]}
                  labelStyle={{ color: '#e5e7eb' }}
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    fontSize: '11px'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Performance Metrics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="TCP Retransmissions"
          value={analysis.tcpAnalysis?.retransmissionRate || 0}
          unit="%"
          icon={Activity}
          data={retransmissionData}
          color="#FF9149"
          threshold={5}
          isGood={(analysis.tcpAnalysis?.retransmissionRate || 0) <= 5}
        />
        
        <MetricCard
          title="UDP Jitter"
          value={analysis.udpAnalysis?.jitterAvg || 0}
          unit="ms"
          icon={Zap}
          data={jitterData}
          color="#FF9898"
          threshold={100}
          isGood={(analysis.udpAnalysis?.jitterAvg || 0) <= 100}
        />
        
        <MetricCard
          title="DNS Response Time"
          value={analysis.dnsAnalysis?.responseTimeAvg || 0}
          unit="ms"
          icon={Clock}
          data={responseTimeData}
          color="#80D8C3"
          threshold={1000}
          isGood={(analysis.dnsAnalysis?.responseTimeAvg || 0) <= 1000}
        />
        
        <MetricCard
          title="Throughput"
          value={analysis.throughput / 1024 / 1024}
          unit="Mbps"
          icon={TrendingUp}
          data={throughputData}
          color="#A19AD3"
        />
      </div>
    </div>
  );
}
