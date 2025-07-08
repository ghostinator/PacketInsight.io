
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  ArrowRight, 
  Filter, 
  Globe, 
  Home, 
  Info,
  TrendingUp,
  TrendingDown,
  Wifi
} from 'lucide-react';
import { TrafficFlow as TrafficFlowType, TrafficFlowNode, TrafficFlowLink } from '@/lib/types';
import dynamic from 'next/dynamic';

// @ts-ignore
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <div className="h-96 bg-muted/30 rounded-lg flex items-center justify-center">
    <div className="text-center space-y-2">
      <Activity className="h-8 w-8 text-muted-foreground/60 mx-auto animate-spin" />
      <p className="text-sm text-muted-foreground">Loading visualization...</p>
    </div>
  </div>
});

interface TrafficFlowProps {
  trafficFlow: TrafficFlowType;
}

interface PlotlySankeyData {
  nodes: {
    label: string[];
    color: string[];
    hovertemplate: string;
  };
  links: {
    source: number[];
    target: number[];
    value: number[];
    color: string[];
    hovertemplate: string;
  };
}

export function TrafficFlow({ trafficFlow }: TrafficFlowProps) {
  const [selectedProtocol, setSelectedProtocol] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedQuality, setSelectedQuality] = useState<string>('all');
  const [showAllFlows, setShowAllFlows] = useState<boolean>(false);
  
  // Default limits for better performance
  const DEFAULT_MAX_FLOWS = 20;
  const DEFAULT_MAX_LINKS = 30;

  // Filter flows based on selections and apply performance limiting
  const filteredFlows = useMemo(() => {
    let flows = trafficFlow.flows;
    let links = trafficFlow.links;

    if (selectedType !== 'all') {
      if (selectedType === 'internal') {
        flows = flows.filter(f => f.type === 'internal');
        links = links.filter(l => 
          flows.some(f => f.id === l.source) && flows.some(f => f.id === l.target)
        );
      } else if (selectedType === 'external') {
        flows = flows.filter(f => f.type === 'external');
        links = links.filter(l => 
          flows.some(f => f.id === l.source) || flows.some(f => f.id === l.target)
        );
      }
    }

    if (selectedProtocol !== 'all') {
      links = links.filter(l => 
        l.protocols.some(p => p.toLowerCase().includes(selectedProtocol.toLowerCase()))
      );
      const linkNodeIds = new Set([...links.map(l => l.source), ...links.map(l => l.target)]);
      flows = flows.filter(f => linkNodeIds.has(f.id));
    }

    if (selectedQuality !== 'all') {
      links = links.filter(l => l.quality === selectedQuality);
      const linkNodeIds = new Set([...links.map(l => l.source), ...links.map(l => l.target)]);
      flows = flows.filter(f => linkNodeIds.has(f.id));
    }

    // Apply performance limiting when not showing all flows
    if (!showAllFlows && flows.length > DEFAULT_MAX_FLOWS) {
      // Sort flows by total bytes (descending) to show most important flows first
      const sortedFlows = [...flows].sort((a, b) => b.totalBytes - a.totalBytes);
      flows = sortedFlows.slice(0, DEFAULT_MAX_FLOWS);
      
      // Filter links to only include those connecting to limited flows
      const flowIds = new Set(flows.map(f => f.id));
      links = links.filter(l => flowIds.has(l.source) && flowIds.has(l.target));
      
      // If links are still too many, limit them by bytes
      if (links.length > DEFAULT_MAX_LINKS) {
        links = [...links].sort((a, b) => b.bytes - a.bytes).slice(0, DEFAULT_MAX_LINKS);
      }
    }

    return { flows, links };
  }, [trafficFlow, selectedProtocol, selectedType, selectedQuality, showAllFlows]);

  // Prepare Plotly Sankey data
  const sankeyData = useMemo((): PlotlySankeyData => {
    const { flows, links } = filteredFlows;
    
    // Create node mapping and labels
    const nodeMap = new Map<string, number>();
    const nodeLabels: string[] = [];
    const nodeColors: string[] = [];
    
    flows.forEach((flow, index) => {
      nodeMap.set(flow.id, index);
      nodeLabels.push(flow.name);
      
      // Color nodes based on type and device type
      if (flow.type === 'internal') {
        switch (flow.deviceType) {
          case 'gateway':
          case 'router':
            nodeColors.push('#60B5FF'); // Blue for infrastructure
            break;
          case 'server':
            nodeColors.push('#FF9149'); // Orange for servers
            break;
          case 'dns':
            nodeColors.push('#80D8C3'); // Teal for DNS
            break;
          default:
            nodeColors.push('#A19AD3'); // Purple for clients
        }
      } else {
        nodeColors.push('#FF9898'); // Light red for external
      }
    });

    // Create links arrays
    const linkSources: number[] = [];
    const linkTargets: number[] = [];
    const linkValues: number[] = [];
    const linkColors: string[] = [];

    links
      .filter(link => nodeMap.has(link.source) && nodeMap.has(link.target))
      .forEach(link => {
        const sourceIndex = nodeMap.get(link.source)!;
        const targetIndex = nodeMap.get(link.target)!;
        
        linkSources.push(sourceIndex);
        linkTargets.push(targetIndex);
        linkValues.push(link.bytes);
        
        // Color links based on quality
        switch (link.quality) {
          case 'excellent':
            linkColors.push('rgba(34, 197, 94, 0.6)'); // Green
            break;
          case 'good':
            linkColors.push('rgba(59, 130, 246, 0.6)'); // Blue
            break;
          case 'fair':
            linkColors.push('rgba(245, 158, 11, 0.6)'); // Yellow
            break;
          case 'poor':
            linkColors.push('rgba(239, 68, 68, 0.6)'); // Red
            break;
          default:
            linkColors.push('rgba(156, 163, 175, 0.6)'); // Gray
        }
      });

    return {
      nodes: {
        label: nodeLabels,
        color: nodeColors,
        hovertemplate: '%{label}<br>%{value} connections<extra></extra>'
      },
      links: {
        source: linkSources,
        target: linkTargets,
        value: linkValues,
        color: linkColors,
        hovertemplate: '%{source.label} → %{target.label}<br>%{value} bytes<extra></extra>'
      }
    };
  }, [filteredFlows]);

  // Get unique protocols for filter
  const protocols = useMemo(() => {
    const allProtocols = new Set<string>();
    trafficFlow.links.forEach(link => {
      link.protocols.forEach(protocol => allProtocols.add(protocol));
    });
    return Array.from(allProtocols);
  }, [trafficFlow.links]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getNodeIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'gateway':
      case 'router':
        return <Wifi className="h-4 w-4" />;
      case 'server':
        return <Activity className="h-4 w-4" />;
      case 'dns':
        return <Globe className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  const getQualityColor = (quality: string): string => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const clearFilters = () => {
    setSelectedProtocol('all');
    setSelectedType('all');
    setSelectedQuality('all');
    setShowAllFlows(false);
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Traffic Flow Analysis
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {!showAllFlows && trafficFlow.flows.length > DEFAULT_MAX_FLOWS 
                ? `${filteredFlows.flows.length}/${trafficFlow.flows.length} Nodes, ${filteredFlows.links.length}/${trafficFlow.links.length} Flows`
                : `${filteredFlows.flows.length} Nodes, ${filteredFlows.links.length} Flows`
              }
            </Badge>
            {!showAllFlows && trafficFlow.flows.length > DEFAULT_MAX_FLOWS && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllFlows(true)}
                className="text-xs"
              >
                Show All
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters:</span>
          </div>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="external">External</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedProtocol} onValueChange={setSelectedProtocol}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Protocol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Protocols</SelectItem>
              {protocols.map(protocol => (
                <SelectItem key={protocol} value={protocol}>
                  {protocol.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedQuality} onValueChange={setSelectedQuality}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Quality</SelectItem>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="text-xs"
          >
            Clear Filters
          </Button>
        </div>

        <Separator />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Flow</span>
            </div>
            <p className="text-2xl font-bold">{formatBytes(trafficFlow.statistics.totalFlow)}</p>
            <p className="text-xs text-muted-foreground">
              Peak: {(trafficFlow.statistics.peakBandwidth / 1000).toFixed(1)} Kbps
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Internal Traffic</span>
            </div>
            <p className="text-2xl font-bold">{formatBytes(trafficFlow.statistics.internalTraffic)}</p>
            <p className="text-xs text-muted-foreground">
              {((trafficFlow.statistics.internalTraffic / trafficFlow.statistics.totalFlow) * 100).toFixed(1)}% of total
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">External Traffic</span>
            </div>
            <p className="text-2xl font-bold">{formatBytes(trafficFlow.statistics.externalTraffic)}</p>
            <p className="text-xs text-muted-foreground">
              {((trafficFlow.statistics.externalTraffic / trafficFlow.statistics.totalFlow) * 100).toFixed(1)}% of total
            </p>
          </div>
        </div>

        {/* Interactive Sankey Diagram */}
        <div className="h-96 bg-background rounded-lg border overflow-hidden">
          {sankeyData.nodes.label.length > 0 && sankeyData.links.source.length > 0 ? (
            <Plot
              data={[
                {
                  type: 'sankey' as const,
                  orientation: 'h',
                  node: sankeyData.nodes,
                  link: sankeyData.links,
                  textfont: {
                    size: 11,
                    color: 'hsl(var(--foreground))'
                  },
                  hoverlabel: {
                    bgcolor: 'hsl(var(--popover))',
                    bordercolor: 'hsl(var(--border))',
                    font: {
                      size: 12,
                      color: 'hsl(var(--popover-foreground))'
                    }
                  }
                }
              ]}
              layout={{
                font: {
                  size: 11,
                  color: 'hsl(var(--foreground))'
                },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                margin: { l: 10, r: 10, t: 20, b: 10 },
                hovermode: 'closest',
                hoverlabel: {
                  bgcolor: 'hsl(var(--popover))',
                  bordercolor: 'hsl(var(--border))',
                  font: {
                    size: 12,
                    color: 'hsl(var(--popover-foreground))'
                  }
                },
                showlegend: false
              }}
              config={{
                responsive: true,
                displaylogo: false,
                modeBarButtonsToRemove: [
                  'pan2d',
                  'select2d',
                  'lasso2d',
                  'zoomIn2d',
                  'zoomOut2d',
                  'autoScale2d',
                  'resetScale2d',
                  'hoverClosestCartesian',
                  'hoverCompareCartesian',
                  'toggleSpikelines'
                ] as any
              }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <Filter className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">No data matches current filters</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-xs"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Top Sources and Destinations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Sources
            </h3>
            <div className="space-y-2">
              {trafficFlow.statistics.topSources.slice(0, 5).map((source, index) => (
                <div key={source.ip} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{source.ip}</p>
                      <p className="text-xs text-muted-foreground">{source.percentage}% of total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatBytes(source.bytes)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Top Destinations
            </h3>
            <div className="space-y-2">
              {trafficFlow.statistics.topDestinations.slice(0, 5).map((dest, index) => (
                <div key={dest.ip} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{dest.ip}</p>
                      <p className="text-xs text-muted-foreground">{dest.percentage}% of total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatBytes(dest.bytes)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Protocols */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Protocol Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {trafficFlow.statistics.topProtocols.map((protocol, index) => (
              <div key={protocol.protocol} className="bg-muted/50 rounded-lg p-4 space-y-2 text-center">
                <Badge variant="secondary" className="w-full justify-center">
                  {protocol.protocol.toUpperCase()}
                </Badge>
                <p className="text-lg font-bold">{formatBytes(protocol.bytes)}</p>
                <p className="text-xs text-muted-foreground">{protocol.percentage}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Flow Quality Legend */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Info className="h-4 w-4" />
            Connection Quality
          </h3>
          <div className="flex flex-wrap gap-4">
            {['excellent', 'good', 'fair', 'poor'].map(quality => (
              <div key={quality} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getQualityColor(quality)}`} />
                <span className="text-sm capitalize">{quality}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
