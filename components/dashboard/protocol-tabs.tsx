
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Network, Globe, Lock, Wifi, Activity, Server, BarChart3 } from 'lucide-react';
import { AnalysisResult } from '@/lib/types';

interface ProtocolTabsProps {
  analysis: AnalysisResult;
}

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#80D8C3', '#A19AD3'];

export function ProtocolTabs({ analysis }: ProtocolTabsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Protocol Analysis
          </CardTitle>
        </CardHeader>
      </Card>

      {/* TCP Analysis Section */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Network className="h-4 w-4" />
            TCP Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Connections</span>
                <span className="font-medium">{analysis.tcpAnalysis?.connections || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Retransmissions</span>
                <Badge variant={
                  (analysis.tcpAnalysis?.retransmissionRate || 0) > 5 ? "destructive" : "secondary"
                }>
                  {analysis.tcpAnalysis?.retransmissions || 0} ({(analysis.tcpAnalysis?.retransmissionRate || 0).toFixed(1)}%)
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Connection Resets</span>
                <span className="font-medium">{analysis.tcpAnalysis?.connectionResets || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg SYN Delay</span>
                <Badge variant={
                  (analysis.tcpAnalysis?.synDelayAvg || 0) > 500 ? "destructive" : "secondary"
                }>
                  {(analysis.tcpAnalysis?.synDelayAvg || 0).toFixed(1)}ms
                </Badge>
              </div>
            </div>

            <div className="h-40">
              <div className="text-sm font-medium mb-2">Connection Quality</div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Good', value: Math.max(0, (analysis.tcpAnalysis?.connections || 0) - (analysis.tcpAnalysis?.connectionResets || 0)) },
                  { name: 'Reset', value: analysis.tcpAnalysis?.connectionResets || 0 },
                ]}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="value" fill="#60B5FF" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UDP Analysis Section */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            UDP Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Flows</span>
                <span className="font-medium">{analysis.udpAnalysis?.flows || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Average Jitter</span>
                <Badge variant={
                  (analysis.udpAnalysis?.jitterAvg || 0) > 100 ? "destructive" : "secondary"
                }>
                  {(analysis.udpAnalysis?.jitterAvg || 0).toFixed(1)}ms
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Max Jitter</span>
                <span className="font-medium">{(analysis.udpAnalysis?.jitterMax || 0).toFixed(1)}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Packet Loss</span>
                <Badge variant={
                  (analysis.udpAnalysis?.packetLoss || 0) > 1 ? "destructive" : "secondary"
                }>
                  {(analysis.udpAnalysis?.packetLoss || 0).toFixed(2)}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DNS Analysis Section */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            DNS Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Queries</span>
                <span className="font-medium">{analysis.dnsAnalysis?.queries || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Responses</span>
                <span className="font-medium">{analysis.dnsAnalysis?.responses || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Timeouts</span>
                <Badge variant={
                  (analysis.dnsAnalysis?.timeouts || 0) > 0 ? "destructive" : "secondary"
                }>
                  {analysis.dnsAnalysis?.timeouts || 0}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg Response Time</span>
                <Badge variant={
                  (analysis.dnsAnalysis?.responseTimeAvg || 0) > 1000 ? "destructive" : "secondary"
                }>
                  {(analysis.dnsAnalysis?.responseTimeAvg || 0).toFixed(1)}ms
                </Badge>
              </div>
            </div>

            <div className="h-40">
              <div className="text-sm font-medium mb-2">Query Types</div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(analysis.dnsAnalysis?.queryTypes || {}).map(([name, value]) => ({
                      name,
                      value
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {Object.entries(analysis.dnsAnalysis?.queryTypes || {}).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {analysis.dnsAnalysis?.topDomains && analysis.dnsAnalysis.topDomains.length > 0 && (
            <div>
              <Separator className="my-4" />
              <div className="space-y-3">
                <div className="text-sm font-medium">Top Queried Domains</div>
                <div className="space-y-2">
                  {analysis.dnsAnalysis.topDomains.slice(0, 5).map((domain, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-mono truncate">{domain.domain}</span>
                      <Badge variant="outline">{domain.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* HTTP Analysis Section */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            HTTP Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Requests</span>
                <span className="font-medium">{analysis.httpAnalysis?.requests || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Responses</span>
                <span className="font-medium">{analysis.httpAnalysis?.responses || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">4xx Errors</span>
                <Badge variant={
                  (analysis.httpAnalysis?.errors4xx || 0) > 0 ? "destructive" : "secondary"
                }>
                  {analysis.httpAnalysis?.errors4xx || 0}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">5xx Errors</span>
                <Badge variant={
                  (analysis.httpAnalysis?.errors5xx || 0) > 0 ? "destructive" : "secondary"
                }>
                  {analysis.httpAnalysis?.errors5xx || 0}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TLS Analysis Section */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4" />
            TLS Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Handshakes</span>
                <span className="font-medium">{analysis.tlsAnalysis?.handshakes || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Alerts</span>
                <Badge variant={
                  (analysis.tlsAnalysis?.alerts || 0) > 0 ? "destructive" : "secondary"
                }>
                  {analysis.tlsAnalysis?.alerts || 0}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Certificate Issues</span>
                <Badge variant={
                  (analysis.tlsAnalysis?.certIssues || 0) > 0 ? "destructive" : "secondary"
                }>
                  {analysis.tlsAnalysis?.certIssues || 0}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DHCP Analysis Section */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4" />
            DHCP Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Discoveries</span>
                <span className="font-medium">{analysis.dhcpAnalysis?.discoveries || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <Badge variant={
                  (analysis.dhcpAnalysis?.successRate || 0) < 95 ? "destructive" : "secondary"
                }>
                  {(analysis.dhcpAnalysis?.successRate || 0).toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">NAKs</span>
                <Badge variant={
                  (analysis.dhcpAnalysis?.naks || 0) > 0 ? "destructive" : "secondary"
                }>
                  {analysis.dhcpAnalysis?.naks || 0}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
