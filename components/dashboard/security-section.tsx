
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, XCircle, AlertCircle, Info } from 'lucide-react';
import { SecurityAlert, PerformanceIssue } from '@/lib/types';

interface SecuritySectionProps {
  securityAlerts: SecurityAlert[];
  performanceIssues: PerformanceIssue[];
}

export function SecuritySection({ securityAlerts, performanceIssues }: SecuritySectionProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return XCircle;
      case 'WARNING':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'status-critical';
      case 'WARNING':
        return 'status-warning';
      default:
        return 'status-info';
    }
  };

  const allIssues = [
    ...securityAlerts.map(alert => ({ ...alert, category: 'Security' })),
    ...performanceIssues.map(issue => ({ ...issue, category: 'Performance' }))
  ].sort((a, b) => {
    const severityOrder = { 'CRITICAL': 0, 'WARNING': 1, 'INFO': 2 };
    return severityOrder[a.severity as keyof typeof severityOrder] - 
           severityOrder[b.severity as keyof typeof severityOrder];
  });

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security & Performance Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allIssues.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-green-400 mb-2">All Clear!</h3>
            <p className="text-muted-foreground">No security or performance issues detected</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allIssues.map((issue, index) => {
              const Icon = getSeverityIcon(issue.severity);
              return (
                <div 
                  key={`${issue.category}-${index}`}
                  className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{issue.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {issue.category}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getSeverityColor(issue.severity)}`}
                        >
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {issue.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {'count' in issue && issue.count && (
                          <span>Count: {issue.count}</span>
                        )}
                        {'value' in issue && issue.value !== undefined && (
                          <span>
                            Value: {issue.value.toFixed(2)} 
                            {'threshold' in issue && issue.threshold && ` (threshold: ${issue.threshold.toFixed(2)})`}
                          </span>
                        )}
                        <span>
                          {new Date(issue.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
