
'use client';

import { Activity, Clock, Shield, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisResult } from '@/lib/types';

interface SummaryCardsProps {
  analysis: AnalysisResult;
}

export function SummaryCards({ analysis }: SummaryCardsProps) {
  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    return AlertTriangle;
  };

  const criticalAlerts = analysis.securityAlerts.filter(a => a.severity === 'CRITICAL').length +
    analysis.performanceIssues.filter(p => p.severity === 'CRITICAL').length;

  const QualityIcon = getQualityIcon(analysis.qualityScore);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Packets</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analysis.totalPackets.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {formatBytes(Number(analysis.totalBytes))} total
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Capture Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDuration(analysis.captureDuration)}</div>
          <p className="text-xs text-muted-foreground">
            {(analysis.throughput / 1024 / 1024).toFixed(2)} Mbps avg
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Network Quality</CardTitle>
          <QualityIcon className={`h-4 w-4 ${getQualityColor(analysis.qualityScore)}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getQualityColor(analysis.qualityScore)}`}>
            {analysis.qualityScore}/100
          </div>
          <p className="text-xs text-muted-foreground">
            {analysis.qualityScore >= 80 ? 'Excellent' : 
             analysis.qualityScore >= 60 ? 'Good' : 'Needs attention'}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
          <AlertTriangle className={`h-4 w-4 ${criticalAlerts > 0 ? 'text-red-400' : 'text-green-400'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${criticalAlerts > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {criticalAlerts}
          </div>
          <p className="text-xs text-muted-foreground">
            Security & performance issues
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
