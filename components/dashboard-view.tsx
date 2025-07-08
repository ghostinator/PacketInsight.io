
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  RefreshCw, 
  Shield, 
  Activity, 
  Network, 
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { usePacketInsight } from '@/lib/context';
import { AnalysisResult } from '@/lib/types';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { ProtocolChart } from '@/components/dashboard/protocol-chart';
import { PerformanceSection } from '@/components/dashboard/performance-section';
import { SecuritySection } from '@/components/dashboard/security-section';
import { ProtocolTabs } from '@/components/dashboard/protocol-tabs';
import { NetworkTopology } from '@/components/dashboard/network-topology';
import { TrafficFlow } from '@/components/dashboard/traffic-flow';
import { TimelineAnalysisComponent } from '@/components/dashboard/timeline-analysis';

export function DashboardView() {
  const { setState, analysis, setAnalysis, analysisId, setAnalysisId } = usePacketInsight();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysisData();
  }, [analysisId]);

  const loadAnalysisData = async () => {
    console.log('Loading analysis data for ID:', analysisId);
    
    if (!analysisId) {
      console.error('No analysis ID provided');
      setErrorMessage('No analysis ID provided. Please upload a PCAP file first.');
      setIsLoading(false);
      return;
    }

    // Reset error state when starting new load
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // If analysis data is already loaded from context, use it
      if (analysis && analysis.id === analysisId) {
        console.log('Analysis data already loaded from context');
        setIsLoading(false);
        return;
      }

      console.log('Loading analysis from secure client-side storage...');
      
      // Try localStorage first, then sessionStorage
      let analysisDataString = localStorage.getItem(`analysis_${analysisId}`);
      if (!analysisDataString) {
        analysisDataString = sessionStorage.getItem(`analysis_${analysisId}`);
      }
      
      if (analysisDataString) {
        const analysisData = JSON.parse(analysisDataString);
        console.log('Analysis data loaded successfully from client storage:', {
          filename: analysisData.filename,
          totalPackets: analysisData.totalPackets,
          captureDuration: analysisData.captureDuration,
          hasNetworkTopology: !!analysisData.networkTopology,
          hasTrafficFlow: !!analysisData.trafficFlow,
          hasTimelineAnalysis: !!analysisData.timelineAnalysis
        });
        
        setAnalysis(analysisData);
        setIsLoading(false);
        return;
      } else {
        console.log('Analysis data not found in client storage, trying API...');
        
        // If not found in localStorage, try loading from API
        const response = await fetch(`/api/analysis/${analysisId}`);
        if (!response.ok) {
          throw new Error('Failed to load analysis from API');
        }
        
        const analysisData = await response.json();
        console.log('Analysis data loaded successfully from API:', {
          filename: analysisData.filename,
          totalPackets: analysisData.totalPackets,
          captureDuration: analysisData.captureDuration,
          status: analysisData.status
        });
        
        // Check if analysis has actual data (even if status is "failed")
        if (analysisData.totalPackets > 0) {
          setAnalysis(analysisData);
          setIsLoading(false);
          return;
        } else {
          setErrorMessage('Analysis data not found. Please upload and analyze a PCAP file first.');
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load analysis:', error);
      setErrorMessage(`Error loading analysis: ${error instanceof Error ? error.message : 'Load error'}`);
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'html') => {
    if (!analysis) return;

    try {
      console.log('Generating client-side export:', format);
      
      let content: string;
      let mimeType: string;
      let fileExtension: string;

      if (format === 'json') {
        content = JSON.stringify(analysis, null, 2);
        mimeType = 'application/json';
        fileExtension = 'json';
      } else if (format === 'csv') {
        content = generateCSVExport(analysis);
        mimeType = 'text/csv';
        fileExtension = 'csv';
      } else if (format === 'html') {
        content = generateHTMLExport(analysis);
        mimeType = 'text/html';
        fileExtension = 'html';
      } else {
        throw new Error('Unsupported export format');
      }

      // Create and download the file
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `packetinsight_${analysis.filename || 'analysis'}_report.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('Client-side export completed successfully');
    } catch (error) {
      console.error('Client-side export failed:', error);
    }
  };

  // Client-side export generation functions
  const generateCSVExport = (analysis: AnalysisResult): string => {
    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDuration = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return hours > 0 ? `${hours}h ${minutes}m ${secs}s` : 
             minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
    };

    let csvContent = 'PacketInsight Comprehensive Analysis Report\n\n';
    
    // Overview Section
    csvContent += 'OVERVIEW\n';
    csvContent += `Filename,${analysis.filename}\n`;
    csvContent += `Total Packets,${analysis.totalPackets}\n`;
    csvContent += `Total Bytes,${formatBytes(analysis.totalBytes)}\n`;
    csvContent += `Capture Duration,${formatDuration(analysis.captureDuration)}\n`;
    csvContent += `Average Packet Size,${analysis.avgPacketSize?.toFixed(2)} bytes\n`;
    csvContent += `Throughput,${formatBytes(analysis.throughput || 0)}/s\n`;
    csvContent += `Quality Score,${analysis.qualityScore}/100\n\n`;

    // Protocol Distribution
    csvContent += 'PROTOCOL DISTRIBUTION\n';
    csvContent += 'Protocol,Percentage\n';
    Object.entries(analysis.protocols || {}).forEach(([protocol, percentage]) => {
      csvContent += `${protocol.toUpperCase()},${(percentage as number).toFixed(1)}%\n`;
    });
    csvContent += '\n';

    // Top Talkers (Top 10)
    csvContent += 'TOP TALKERS (Top 10)\n';
    csvContent += 'IP Address,Packets,Bytes,Percentage\n';
    (analysis.topTalkers || []).slice(0, 10).forEach(talker => {
      csvContent += `${talker.ip},${talker.packets},${formatBytes(talker.bytes)},${talker.percentage?.toFixed(2)}%\n`;
    });
    csvContent += '\n';

    // Top Conversations (Top 10)
    csvContent += 'TOP CONVERSATIONS (Top 10)\n';
    csvContent += 'Source,Destination,Protocol,Packets,Bytes\n';
    (analysis.topConversations || []).slice(0, 10).forEach(conv => {
      csvContent += `${conv.src},${conv.dst},${conv.protocol},${conv.packets},${formatBytes(conv.bytes)}\n`;
    });
    csvContent += '\n';

    // Security Alerts
    csvContent += 'SECURITY ALERTS\n';
    csvContent += 'Severity,Type,Title,Description,Count,Timestamp\n';
    (analysis.securityAlerts || []).forEach(alert => {
      csvContent += `${alert.severity},${alert.type},"${alert.title}","${alert.description}",${alert.count},${alert.timestamp}\n`;
    });
    csvContent += '\n';

    // Performance Issues
    csvContent += 'PERFORMANCE ISSUES\n';
    csvContent += 'Severity,Type,Title,Description,Value,Threshold,Timestamp\n';
    (analysis.performanceIssues || []).forEach(issue => {
      csvContent += `${issue.severity},${issue.type},"${issue.title}","${issue.description}",${issue.value},${issue.threshold},${issue.timestamp}\n`;
    });
    csvContent += '\n';

    // TCP Analysis
    if (analysis.tcpAnalysis) {
      csvContent += 'TCP ANALYSIS\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Connections,${analysis.tcpAnalysis.connections}\n`;
      csvContent += `Retransmissions,${analysis.tcpAnalysis.retransmissions}\n`;
      csvContent += `Retransmission Rate,${analysis.tcpAnalysis.retransmissionRate.toFixed(2)}%\n`;
      csvContent += `Connection Resets,${analysis.tcpAnalysis.connectionResets}\n`;
      csvContent += `Average SYN Delay,${analysis.tcpAnalysis.synDelayAvg.toFixed(2)}ms\n`;
      csvContent += `Maximum SYN Delay,${analysis.tcpAnalysis.synDelayMax.toFixed(2)}ms\n`;
      csvContent += '\n';
    }

    // UDP Analysis
    if (analysis.udpAnalysis) {
      csvContent += 'UDP ANALYSIS\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Flows,${analysis.udpAnalysis.flows}\n`;
      csvContent += `Average Jitter,${analysis.udpAnalysis.jitterAvg.toFixed(2)}ms\n`;
      csvContent += `Maximum Jitter,${analysis.udpAnalysis.jitterMax.toFixed(2)}ms\n`;
      csvContent += `Packet Loss,${analysis.udpAnalysis.packetLoss.toFixed(2)}%\n`;
      csvContent += '\n';
    }

    // DNS Analysis
    if (analysis.dnsAnalysis) {
      csvContent += 'DNS ANALYSIS\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Queries,${analysis.dnsAnalysis.queries}\n`;
      csvContent += `Responses,${analysis.dnsAnalysis.responses}\n`;
      csvContent += `Timeouts,${analysis.dnsAnalysis.timeouts}\n`;
      csvContent += `Average Response Time,${analysis.dnsAnalysis.responseTimeAvg.toFixed(2)}ms\n`;
      csvContent += `Maximum Response Time,${analysis.dnsAnalysis.responseTimeMax.toFixed(2)}ms\n`;
      csvContent += '\n';
      
      if (analysis.dnsAnalysis.topDomains?.length > 0) {
        csvContent += 'TOP DNS DOMAINS (Top 10)\n';
        csvContent += 'Domain,Count\n';
        analysis.dnsAnalysis.topDomains.slice(0, 10).forEach(domain => {
          csvContent += `${domain.domain},${domain.count}\n`;
        });
        csvContent += '\n';
      }
    }

    // HTTP Analysis
    if (analysis.httpAnalysis) {
      csvContent += 'HTTP ANALYSIS\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Requests,${analysis.httpAnalysis.requests}\n`;
      csvContent += `Responses,${analysis.httpAnalysis.responses}\n`;
      csvContent += `4xx Errors,${analysis.httpAnalysis.errors4xx}\n`;
      csvContent += `5xx Errors,${analysis.httpAnalysis.errors5xx}\n`;
      csvContent += '\n';
    }

    // TLS Analysis
    if (analysis.tlsAnalysis) {
      csvContent += 'TLS ANALYSIS\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Handshakes,${analysis.tlsAnalysis.handshakes}\n`;
      csvContent += `Alerts,${analysis.tlsAnalysis.alerts}\n`;
      csvContent += `Certificate Issues,${analysis.tlsAnalysis.certIssues}\n`;
      csvContent += '\n';
    }

    // DHCP Analysis
    if (analysis.dhcpAnalysis) {
      csvContent += 'DHCP ANALYSIS\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Discoveries,${analysis.dhcpAnalysis.discoveries}\n`;
      csvContent += `Offers,${analysis.dhcpAnalysis.offers}\n`;
      csvContent += `Requests,${analysis.dhcpAnalysis.requests}\n`;
      csvContent += `ACKs,${analysis.dhcpAnalysis.acks}\n`;
      csvContent += `NAKs,${analysis.dhcpAnalysis.naks}\n`;
      csvContent += `Success Rate,${analysis.dhcpAnalysis.successRate.toFixed(2)}%\n`;
      csvContent += '\n';
    }

    // Network Topology Statistics
    if (analysis.networkTopology) {
      csvContent += 'NETWORK TOPOLOGY STATISTICS\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Total Nodes,${analysis.networkTopology.statistics.totalNodes}\n`;
      csvContent += `Total Edges,${analysis.networkTopology.statistics.totalEdges}\n`;
      csvContent += `Internal Nodes,${analysis.networkTopology.statistics.internalNodes}\n`;
      csvContent += `External Nodes,${analysis.networkTopology.statistics.externalNodes}\n`;
      csvContent += `Total Traffic,${formatBytes(analysis.networkTopology.statistics.totalTraffic)}\n`;
      csvContent += '\n';

      if (analysis.networkTopology.internalDevices?.length > 0) {
        csvContent += 'INTERNAL DEVICES (Top 10)\n';
        csvContent += 'IP Address,MAC Address,Hostname,Device Type,Last Seen\n';
        analysis.networkTopology.internalDevices.slice(0, 10).forEach(device => {
          csvContent += `${device.ip},${device.mac || 'N/A'},${device.hostname || 'N/A'},${device.deviceType},${device.lastSeen}\n`;
        });
        csvContent += '\n';
      }
    }

    // Traffic Flow Statistics
    if (analysis.trafficFlow) {
      csvContent += 'TRAFFIC FLOW STATISTICS\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Total Flow,${formatBytes(analysis.trafficFlow.statistics.totalFlow)}\n`;
      csvContent += `Peak Bandwidth,${formatBytes(analysis.trafficFlow.statistics.peakBandwidth)}/s\n`;
      csvContent += `Average Bandwidth,${formatBytes(analysis.trafficFlow.statistics.averageBandwidth)}/s\n`;
      csvContent += `Internal Traffic,${formatBytes(analysis.trafficFlow.statistics.internalTraffic)}\n`;
      csvContent += `External Traffic,${formatBytes(analysis.trafficFlow.statistics.externalTraffic)}\n`;
      csvContent += '\n';

      if (analysis.trafficFlow.statistics.topSources?.length > 0) {
        csvContent += 'TOP TRAFFIC SOURCES (Top 10)\n';
        csvContent += 'IP Address,Bytes,Percentage\n';
        analysis.trafficFlow.statistics.topSources.slice(0, 10).forEach(source => {
          csvContent += `${source.ip},${formatBytes(source.bytes)},${source.percentage.toFixed(2)}%\n`;
        });
        csvContent += '\n';
      }
    }

    // Timeline Statistics
    if (analysis.timelineAnalysis) {
      csvContent += 'TIMELINE STATISTICS\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Total Duration,${formatDuration(analysis.timelineAnalysis.statistics.totalDuration)}\n`;
      csvContent += `Average Packets/Second,${analysis.timelineAnalysis.statistics.averagePacketsPerSecond.toFixed(2)}\n`;
      csvContent += `Average Bytes/Second,${formatBytes(analysis.timelineAnalysis.statistics.averageBytesPerSecond)}\n`;
      csvContent += `Peak Activity,${analysis.timelineAnalysis.statistics.peakActivity.packetCount} packets at ${new Date(analysis.timelineAnalysis.statistics.peakActivity.timestamp).toLocaleString()}\n`;
      csvContent += '\n';
    }

    return csvContent;
  };

  const generateHTMLExport = (analysis: AnalysisResult): string => {
    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDuration = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return hours > 0 ? `${hours}h ${minutes}m ${secs}s` : 
             minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
    };

    const getSeverityBadge = (severity: string) => {
      const colors = {
        'CRITICAL': '#ef4444',
        'WARNING': '#f97316', 
        'INFO': '#3b82f6'
      };
      return `<span style="background-color: ${colors[severity as keyof typeof colors] || '#6b7280'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">${severity}</span>`;
    };

    const currentDate = new Date().toLocaleString();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PacketInsight Comprehensive Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 40px; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; background: #fafafa; }
        .overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .metric { text-align: center; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; }
        .metric-value { font-size: 1.8em; font-weight: bold; color: #3b82f6; }
        .metric-label { color: #666; margin-top: 5px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .table th { background-color: #f8f9fa; font-weight: 600; }
        .table tbody tr:hover { background-color: #f8f9fa; }
        .alert-item { padding: 12px; margin-bottom: 8px; border-radius: 6px; border-left: 4px solid #3b82f6; background: #f8fafc; }
        .alert-critical { border-left-color: #ef4444; background: #fef2f2; }
        .alert-warning { border-left-color: #f97316; background: #fff7ed; }
        .protocol-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 0.9em; border-top: 1px solid #ddd; padding-top: 20px; }
        h1 { color: #1f2937; }
        h2 { color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        h3 { color: #4b5563; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 PacketInsight Comprehensive Analysis Report</h1>
        <p>Generated on ${currentDate}</p>
        <p><strong>File:</strong> ${analysis.filename}</p>
    </div>

    <div class="section">
        <h2>📈 Overview</h2>
        <div class="overview-grid">
            <div class="metric">
                <div class="metric-value">${analysis.totalPackets?.toLocaleString()}</div>
                <div class="metric-label">Total Packets</div>
            </div>
            <div class="metric">
                <div class="metric-value">${formatBytes(analysis.totalBytes)}</div>
                <div class="metric-label">Total Data</div>
            </div>
            <div class="metric">
                <div class="metric-value">${formatDuration(analysis.captureDuration)}</div>
                <div class="metric-label">Duration</div>
            </div>
            <div class="metric">
                <div class="metric-value">${analysis.qualityScore}/100</div>
                <div class="metric-label">Quality Score</div>
            </div>
            <div class="metric">
                <div class="metric-value">${analysis.avgPacketSize?.toFixed(2)}</div>
                <div class="metric-label">Avg Packet Size (bytes)</div>
            </div>
            <div class="metric">
                <div class="metric-value">${formatBytes(analysis.throughput || 0)}/s</div>
                <div class="metric-label">Throughput</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>🌐 Protocol Distribution</h2>
        <div class="card">
            <table class="table">
                <thead>
                    <tr><th>Protocol</th><th>Percentage</th></tr>
                </thead>
                <tbody>
                    ${Object.entries(analysis.protocols || {}).map(([protocol, percentage]) => 
                        `<tr><td>${protocol.toUpperCase()}</td><td>${(percentage as number).toFixed(1)}%</td></tr>`
                    ).join('')}
                </tbody>
            </table>
        </div>
    </div>

    <div class="section">
        <h2>👥 Top Talkers (Top 10)</h2>
        <div class="card">
            <table class="table">
                <thead>
                    <tr><th>IP Address</th><th>Packets</th><th>Bytes</th><th>Percentage</th></tr>
                </thead>
                <tbody>
                    ${(analysis.topTalkers || []).slice(0, 10).map(talker => 
                        `<tr>
                            <td>${talker.ip}</td>
                            <td>${talker.packets?.toLocaleString()}</td>
                            <td>${formatBytes(talker.bytes)}</td>
                            <td>${talker.percentage?.toFixed(2)}%</td>
                        </tr>`
                    ).join('')}
                </tbody>
            </table>
        </div>
    </div>

    <div class="section">
        <h2>💬 Top Conversations (Top 10)</h2>
        <div class="card">
            <table class="table">
                <thead>
                    <tr><th>Source</th><th>Destination</th><th>Protocol</th><th>Packets</th><th>Bytes</th></tr>
                </thead>
                <tbody>
                    ${(analysis.topConversations || []).slice(0, 10).map(conv => 
                        `<tr>
                            <td>${conv.src}</td>
                            <td>${conv.dst}</td>
                            <td>${conv.protocol}</td>
                            <td>${conv.packets?.toLocaleString()}</td>
                            <td>${formatBytes(conv.bytes)}</td>
                        </tr>`
                    ).join('')}
                </tbody>
            </table>
        </div>
    </div>

    ${(analysis.securityAlerts?.length > 0 || analysis.performanceIssues?.length > 0) ? `
    <div class="section">
        <h2>🚨 Security & Performance Alerts</h2>
        <div class="card">
            ${[...analysis.securityAlerts.map(alert => ({ ...alert, category: 'Security' })), 
               ...analysis.performanceIssues.map(issue => ({ ...issue, category: 'Performance' }))]
               .sort((a, b) => {
                 const severityOrder = { 'CRITICAL': 0, 'WARNING': 1, 'INFO': 2 };
                 return severityOrder[a.severity as keyof typeof severityOrder] - 
                        severityOrder[b.severity as keyof typeof severityOrder];
               })
               .map((item, index) => 
                `<div class="alert-item ${item.severity.toLowerCase() === 'critical' ? 'alert-critical' : 
                                           item.severity.toLowerCase() === 'warning' ? 'alert-warning' : ''}">
                    <h4>${item.title} ${getSeverityBadge(item.severity)} <small>${item.category}</small></h4>
                    <p>${item.description}</p>
                    <small>
                        ${'count' in item && item.count ? `Count: ${item.count} | ` : ''}
                        ${'value' in item && item.value !== undefined ? `Value: ${item.value.toFixed(2)}${('threshold' in item && item.threshold) ? ` (threshold: ${item.threshold.toFixed(2)})` : ''} | ` : ''}
                        ${new Date(item.timestamp).toLocaleString()}
                    </small>
                </div>`
            ).join('')}
        </div>
    </div>` : ''}

    <div class="section">
        <h2>🔬 Protocol Analysis</h2>
        <div class="protocol-section">
            ${analysis.tcpAnalysis ? `
            <div class="card">
                <h3>🔗 TCP Analysis</h3>
                <table class="table">
                    <tr><td><strong>Connections</strong></td><td>${analysis.tcpAnalysis.connections}</td></tr>
                    <tr><td><strong>Retransmissions</strong></td><td>${analysis.tcpAnalysis.retransmissions} (${analysis.tcpAnalysis.retransmissionRate.toFixed(2)}%)</td></tr>
                    <tr><td><strong>Connection Resets</strong></td><td>${analysis.tcpAnalysis.connectionResets}</td></tr>
                    <tr><td><strong>Average SYN Delay</strong></td><td>${analysis.tcpAnalysis.synDelayAvg.toFixed(2)}ms</td></tr>
                    <tr><td><strong>Maximum SYN Delay</strong></td><td>${analysis.tcpAnalysis.synDelayMax.toFixed(2)}ms</td></tr>
                </table>
            </div>` : ''}

            ${analysis.udpAnalysis ? `
            <div class="card">
                <h3>📡 UDP Analysis</h3>
                <table class="table">
                    <tr><td><strong>Flows</strong></td><td>${analysis.udpAnalysis.flows}</td></tr>
                    <tr><td><strong>Average Jitter</strong></td><td>${analysis.udpAnalysis.jitterAvg.toFixed(2)}ms</td></tr>
                    <tr><td><strong>Maximum Jitter</strong></td><td>${analysis.udpAnalysis.jitterMax.toFixed(2)}ms</td></tr>
                    <tr><td><strong>Packet Loss</strong></td><td>${analysis.udpAnalysis.packetLoss.toFixed(2)}%</td></tr>
                </table>
            </div>` : ''}

            ${analysis.dnsAnalysis ? `
            <div class="card">
                <h3>🌐 DNS Analysis</h3>
                <table class="table">
                    <tr><td><strong>Queries</strong></td><td>${analysis.dnsAnalysis.queries}</td></tr>
                    <tr><td><strong>Responses</strong></td><td>${analysis.dnsAnalysis.responses}</td></tr>
                    <tr><td><strong>Timeouts</strong></td><td>${analysis.dnsAnalysis.timeouts}</td></tr>
                    <tr><td><strong>Average Response Time</strong></td><td>${analysis.dnsAnalysis.responseTimeAvg.toFixed(2)}ms</td></tr>
                    <tr><td><strong>Maximum Response Time</strong></td><td>${analysis.dnsAnalysis.responseTimeMax.toFixed(2)}ms</td></tr>
                </table>
                ${analysis.dnsAnalysis.topDomains?.length > 0 ? `
                <h4>Top DNS Domains (Top 10)</h4>
                <table class="table">
                    <thead><tr><th>Domain</th><th>Count</th></tr></thead>
                    <tbody>
                        ${analysis.dnsAnalysis.topDomains.slice(0, 10).map(domain => 
                            `<tr><td>${domain.domain}</td><td>${domain.count}</td></tr>`
                        ).join('')}
                    </tbody>
                </table>` : ''}
            </div>` : ''}

            ${analysis.httpAnalysis ? `
            <div class="card">
                <h3>🌍 HTTP Analysis</h3>
                <table class="table">
                    <tr><td><strong>Requests</strong></td><td>${analysis.httpAnalysis.requests}</td></tr>
                    <tr><td><strong>Responses</strong></td><td>${analysis.httpAnalysis.responses}</td></tr>
                    <tr><td><strong>4xx Errors</strong></td><td>${analysis.httpAnalysis.errors4xx}</td></tr>
                    <tr><td><strong>5xx Errors</strong></td><td>${analysis.httpAnalysis.errors5xx}</td></tr>
                </table>
            </div>` : ''}

            ${analysis.tlsAnalysis ? `
            <div class="card">
                <h3>🔒 TLS Analysis</h3>
                <table class="table">
                    <tr><td><strong>Handshakes</strong></td><td>${analysis.tlsAnalysis.handshakes}</td></tr>
                    <tr><td><strong>Alerts</strong></td><td>${analysis.tlsAnalysis.alerts}</td></tr>
                    <tr><td><strong>Certificate Issues</strong></td><td>${analysis.tlsAnalysis.certIssues}</td></tr>
                </table>
            </div>` : ''}

            ${analysis.dhcpAnalysis ? `
            <div class="card">
                <h3>🏠 DHCP Analysis</h3>
                <table class="table">
                    <tr><td><strong>Discoveries</strong></td><td>${analysis.dhcpAnalysis.discoveries}</td></tr>
                    <tr><td><strong>Offers</strong></td><td>${analysis.dhcpAnalysis.offers}</td></tr>
                    <tr><td><strong>Requests</strong></td><td>${analysis.dhcpAnalysis.requests}</td></tr>
                    <tr><td><strong>ACKs</strong></td><td>${analysis.dhcpAnalysis.acks}</td></tr>
                    <tr><td><strong>NAKs</strong></td><td>${analysis.dhcpAnalysis.naks}</td></tr>
                    <tr><td><strong>Success Rate</strong></td><td>${analysis.dhcpAnalysis.successRate.toFixed(2)}%</td></tr>
                </table>
            </div>` : ''}
        </div>
    </div>

    ${analysis.networkTopology ? `
    <div class="section">
        <h2>🕸️ Network Topology</h2>
        <div class="card">
            <h3>Statistics</h3>
            <div class="overview-grid">
                <div class="metric">
                    <div class="metric-value">${analysis.networkTopology.statistics.totalNodes}</div>
                    <div class="metric-label">Total Nodes</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${analysis.networkTopology.statistics.totalEdges}</div>
                    <div class="metric-label">Total Edges</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${analysis.networkTopology.statistics.internalNodes}</div>
                    <div class="metric-label">Internal Nodes</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${analysis.networkTopology.statistics.externalNodes}</div>
                    <div class="metric-label">External Nodes</div>
                </div>
            </div>
            ${analysis.networkTopology.internalDevices?.length > 0 ? `
            <h4>Internal Devices (Top 10)</h4>
            <table class="table">
                <thead><tr><th>IP Address</th><th>MAC Address</th><th>Hostname</th><th>Device Type</th><th>Last Seen</th></tr></thead>
                <tbody>
                    ${analysis.networkTopology.internalDevices.slice(0, 10).map(device => 
                        `<tr>
                            <td>${device.ip}</td>
                            <td>${device.mac || 'N/A'}</td>
                            <td>${device.hostname || 'N/A'}</td>
                            <td>${device.deviceType}</td>
                            <td>${device.lastSeen}</td>
                        </tr>`
                    ).join('')}
                </tbody>
            </table>` : ''}
        </div>
    </div>` : ''}

    ${analysis.trafficFlow ? `
    <div class="section">
        <h2>🚦 Traffic Flow</h2>
        <div class="card">
            <h3>Statistics</h3>
            <div class="overview-grid">
                <div class="metric">
                    <div class="metric-value">${formatBytes(analysis.trafficFlow.statistics.totalFlow)}</div>
                    <div class="metric-label">Total Flow</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${formatBytes(analysis.trafficFlow.statistics.peakBandwidth)}/s</div>
                    <div class="metric-label">Peak Bandwidth</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${formatBytes(analysis.trafficFlow.statistics.averageBandwidth)}/s</div>
                    <div class="metric-label">Average Bandwidth</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${formatBytes(analysis.trafficFlow.statistics.internalTraffic)}</div>
                    <div class="metric-label">Internal Traffic</div>
                </div>
            </div>
            ${analysis.trafficFlow.statistics.topSources?.length > 0 ? `
            <h4>Top Traffic Sources (Top 10)</h4>
            <table class="table">
                <thead><tr><th>IP Address</th><th>Bytes</th><th>Percentage</th></tr></thead>
                <tbody>
                    ${analysis.trafficFlow.statistics.topSources.slice(0, 10).map(source => 
                        `<tr>
                            <td>${source.ip}</td>
                            <td>${formatBytes(source.bytes)}</td>
                            <td>${source.percentage.toFixed(2)}%</td>
                        </tr>`
                    ).join('')}
                </tbody>
            </table>` : ''}
        </div>
    </div>` : ''}

    ${analysis.timelineAnalysis ? `
    <div class="section">
        <h2>📈 Timeline Analysis</h2>
        <div class="card">
            <h3>Statistics</h3>
            <div class="overview-grid">
                <div class="metric">
                    <div class="metric-value">${formatDuration(analysis.timelineAnalysis.statistics.totalDuration)}</div>
                    <div class="metric-label">Total Duration</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${analysis.timelineAnalysis.statistics.averagePacketsPerSecond.toFixed(2)}</div>
                    <div class="metric-label">Avg Packets/Second</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${formatBytes(analysis.timelineAnalysis.statistics.averageBytesPerSecond)}</div>
                    <div class="metric-label">Avg Bytes/Second</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${analysis.timelineAnalysis.statistics.peakActivity.packetCount}</div>
                    <div class="metric-label">Peak Activity (packets)</div>
                </div>
            </div>
        </div>
    </div>` : ''}

    <div class="footer">
        <p>🔒 This comprehensive report was generated entirely in your browser for maximum security and privacy.</p>
        <p>Generated by PacketInsight - Client-Side Network Analysis Tool</p>
    </div>
</body>
</html>`;
  };

  const handleNewAnalysis = () => {
    setAnalysis(null);
    setAnalysisId(null);
    setState('upload');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Processing PCAP file analysis...</span>
          </div>
          <p className="text-sm text-muted-foreground">
            This may take a few moments for large files
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (errorMessage || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 max-w-md text-center">
          <XCircle className="h-12 w-12 text-destructive" />
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Analysis Failed</h2>
            <p className="text-sm text-muted-foreground">
              {errorMessage || 'No analysis data available. Please upload a valid PCAP file.'}
            </p>
          </div>
          <Button onClick={handleNewAnalysis} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Upload New PCAP File
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="py-6 px-4">
        <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* File Info Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Analysis Results</h1>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-muted-foreground">
              {analysis.filename}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('json')}
            >
              <Download className="mr-2 h-4 w-4" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('html')}
            >
              <Download className="mr-2 h-4 w-4" />
              HTML
            </Button>
          </div>
        </div>
        {/* Summary Cards - Always visible */}
        <SummaryCards analysis={analysis} />

        {/* Tabbed Interface */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="topology" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Network Topology
            </TabsTrigger>
            <TabsTrigger value="traffic" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Traffic Flow
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Performance & Security
            </TabsTrigger>
            <TabsTrigger value="protocols" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Protocol Analysis
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Protocol Distribution */}
              <div className="lg:col-span-1">
                <ProtocolChart protocols={analysis.protocols} />
              </div>

              {/* Performance Metrics Overview */}
              <div className="lg:col-span-2">
                <PerformanceSection analysis={analysis} />
              </div>
            </div>

            {/* Quality Score and Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                  {analysis.qualityScore >= 80 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : analysis.qualityScore >= 60 ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.qualityScore}/100</div>
                  <p className="text-xs text-muted-foreground">
                    {analysis.qualityScore >= 80 ? 'Excellent' : 
                     analysis.qualityScore >= 60 ? 'Good' : 'Needs Attention'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analysis.securityAlerts.length + analysis.performanceIssues.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analysis.securityAlerts.length} security, {analysis.performanceIssues.length} performance
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Network Nodes</CardTitle>
                  <Network className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analysis.networkTopology?.statistics.totalNodes || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analysis.networkTopology?.statistics.internalNodes || 0} internal, {' '}
                    {analysis.networkTopology?.statistics.externalNodes || 0} external
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Network Topology Tab */}
          <TabsContent value="topology" className="space-y-6">
            {analysis.networkTopology ? (
              <NetworkTopology topology={analysis.networkTopology} />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center space-y-2">
                    <Network className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-lg font-medium text-muted-foreground">No Network Topology Data</p>
                    <p className="text-sm text-muted-foreground">Network topology analysis is not available for this capture.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Traffic Flow Tab */}
          <TabsContent value="traffic" className="space-y-6">
            {analysis.trafficFlow ? (
              <TrafficFlow trafficFlow={analysis.trafficFlow} />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center space-y-2">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-lg font-medium text-muted-foreground">No Traffic Flow Data</p>
                    <p className="text-sm text-muted-foreground">Traffic flow analysis is not available for this capture.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timeline Analysis Tab */}
          <TabsContent value="timeline" className="space-y-6">
            {analysis.timelineAnalysis ? (
              <TimelineAnalysisComponent timelineAnalysis={analysis.timelineAnalysis} />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center space-y-2">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-lg font-medium text-muted-foreground">No Timeline Data</p>
                    <p className="text-sm text-muted-foreground">Timeline analysis is not available for this capture.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Performance & Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <SecuritySection 
              securityAlerts={analysis.securityAlerts}
              performanceIssues={analysis.performanceIssues}
            />
          </TabsContent>

          {/* Protocol Analysis Tab */}
          <TabsContent value="protocols" className="space-y-6">
            <ProtocolTabs analysis={analysis} />
          </TabsContent>
        </Tabs>
        </div>
      </main>
    </div>
  );
}
