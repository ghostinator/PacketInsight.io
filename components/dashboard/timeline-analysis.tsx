
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  BarChart3,
  Filter,
  Play,
  Pause
} from 'lucide-react';
import { TimelineAnalysis, TimelineDataPoint, TimelineEvent } from '@/lib/types';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

// Dynamically import recharts to avoid SSR issues
const LineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((mod) => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
// const Legend = dynamic(() => import('recharts').then((mod) => mod.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then((mod) => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((mod) => mod.Area), { ssr: false });

interface TimelineAnalysisProps {
  timelineAnalysis: TimelineAnalysis;
}

export function TimelineAnalysisComponent({ timelineAnalysis }: TimelineAnalysisProps) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [selectedMetric, setSelectedMetric] = useState<'packets' | 'bytes' | 'throughput'>('packets');
  const [selectedProtocol, setSelectedProtocol] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'all' | '1min' | '5min' | '10min'>('all');
  const [showEvents, setShowEvents] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // Filter and process timeline data
  const processedData = useMemo(() => {
    let data = timelineAnalysis.timelineData || [];
    
    // Apply time range filter
    if (timeRange !== 'all' && data.length > 0) {
      const now = Math.max(...data.map(d => d.timestamp));
      const rangeMs = timeRange === '1min' ? 60000 : timeRange === '5min' ? 300000 : 600000;
      const cutoff = now - rangeMs;
      data = data.filter(d => d.timestamp >= cutoff);
    }
    
    // Process data for chart
    return data.map(point => {
      const date = new Date(point.timestamp);
      const timeLabel = date.toLocaleTimeString();
      
      return {
        time: timeLabel,
        timestamp: point.timestamp,
        packets: point.packetCount,
        bytes: Math.round(point.bytes / 1024), // Convert to KB
        throughput: Math.round(point.throughput / 1000), // Convert to Kbps
        tcp: point.protocols?.tcp || 0,
        udp: point.protocols?.udp || 0,
        icmp: point.protocols?.icmp || 0,
        dns: point.protocols?.dns || 0,
        http: point.protocols?.http || 0,
        total: point.packetCount
      };
    });
  }, [timelineAnalysis.timelineData, timeRange]);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (!showEvents || !timelineAnalysis.eventMarkers) return [];
    
    let events = timelineAnalysis.eventMarkers;
    
    if (timeRange !== 'all') {
      const now = Math.max(...timelineAnalysis.timelineData.map(d => d.timestamp));
      const rangeMs = timeRange === '1min' ? 60000 : timeRange === '5min' ? 300000 : 600000;
      const cutoff = now - rangeMs;
      events = events.filter(e => e.timestamp >= cutoff);
    }
    
    return events;
  }, [timelineAnalysis.eventMarkers, timeRange, showEvents]);

  // Get metric color
  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'packets': return '#3b82f6';
      case 'bytes': return '#10b981';
      case 'throughput': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  // Format value based on metric
  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'packets': return `${value} packets`;
      case 'bytes': return `${value} KB`;
      case 'throughput': return `${value} Kbps`;
      default: return value.toString();
    }
  };

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
          <p className="font-semibold mb-1">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p 
              key={index}
              className={isDark ? 'text-blue-300' : 'text-blue-600'}
            >
              {`${entry.name}: ${formatValue(entry.value, selectedMetric)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const statistics = timelineAnalysis.statistics || {
    totalDuration: 0,
    peakActivity: { timestamp: 0, packetCount: 0, bytes: 0 },
    averagePacketsPerSecond: 0,
    averageBytesPerSecond: 0,
    quietPeriods: [],
    busyPeriods: []
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Timeline Analysis</h2>
          <p className="text-muted-foreground">Network activity over time with interactive exploration</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="packets">Packets</SelectItem>
              <SelectItem value="bytes">Bytes</SelectItem>
              <SelectItem value="throughput">Throughput</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="10min">10 min</SelectItem>
              <SelectItem value="5min">5 min</SelectItem>
              <SelectItem value="1min">1 min</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEvents(!showEvents)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Events
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(statistics.totalDuration)}s
            </div>
            <p className="text-xs text-muted-foreground">
              Total capture time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.peakActivity.packetCount}
            </div>
            <p className="text-xs text-muted-foreground">
              packets/second max
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Packets/sec</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(statistics.averagePacketsPerSecond)}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEvents.length}
            </div>
            <p className="text-xs text-muted-foreground">
              notable events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Network Activity Timeline</span>
            <Badge variant="outline" className="ml-auto">
              {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            {processedData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={processedData}
                  margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={isDark ? '#374151' : '#e5e7eb'} 
                    opacity={0.5} 
                  />
                  <XAxis 
                    dataKey="time" 
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                    fontSize={10}
                    tickLine={false}
                    interval="preserveStartEnd"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    stroke={isDark ? '#9ca3af' : '#6b7280'}
                    fontSize={10}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    label={{ 
                      value: formatValue(0, selectedMetric).split(' ')[1] || '', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { 
                        textAnchor: 'middle', 
                        fontSize: 10,
                        fill: isDark ? '#9ca3af' : '#6b7280'
                      }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    stroke={getMetricColor(selectedMetric)}
                    fill={getMetricColor(selectedMetric)}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-lg font-medium text-muted-foreground">No Timeline Data</p>
                  <p className="text-sm text-muted-foreground">Timeline analysis is not available for this capture.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Protocol Distribution Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Protocol Distribution Over Time</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            {processedData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    label={{ 
                      value: 'Packets', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 10 }
                    }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      fontSize: '11px'
                    }}
                  />
                  {/* Legend component removed due to TypeScript compatibility issues */}
                  <Line type="monotone" dataKey="tcp" stroke="#3b82f6" strokeWidth={2} dot={false} name="TCP" />
                  <Line type="monotone" dataKey="udp" stroke="#10b981" strokeWidth={2} dot={false} name="UDP" />
                  <Line type="monotone" dataKey="icmp" stroke="#f59e0b" strokeWidth={2} dot={false} name="ICMP" />
                  <Line type="monotone" dataKey="dns" stroke="#8b5cf6" strokeWidth={2} dot={false} name="DNS" />
                  <Line type="monotone" dataKey="http" stroke="#ef4444" strokeWidth={2} dot={false} name="HTTP" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">No protocol data available</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Timeline */}
      {showEvents && filteredEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Event Timeline</span>
              <Badge variant="outline" className="ml-auto">
                {filteredEvents.length} events
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {filteredEvents.map((event, index) => (
                <div key={event.id || index} className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    event.severity === 'critical' ? 'bg-red-500' :
                    event.severity === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{event.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                    {event.protocol && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {event.protocol}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
