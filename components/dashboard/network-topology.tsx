
'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Network as NetworkIcon, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Settings,
  Filter,
  Eye,
  EyeOff,
  Server,
  Router,
  Laptop,
  Globe,
  Shield,
  ChevronDown,
  ChevronUp,
  Wifi,
  ExternalLink
} from 'lucide-react';
import { NetworkTopology as NetworkTopologyType, NetworkNode, NetworkEdge } from '@/lib/types';

// Import vis-network dynamically to avoid SSR issues
import { DataSet, Network, Node, Edge } from 'vis-network/standalone';

interface NetworkTopologyProps {
  topology: NetworkTopologyType;
}

interface NodeDetails {
  node: NetworkNode | null;
  position: { x: number; y: number } | null;
}

interface EdgeDetails {
  edge: NetworkEdge | null;
  position: { x: number; y: number } | null;
}

export function NetworkTopology({ topology }: NetworkTopologyProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nodeDetails, setNodeDetails] = useState<NodeDetails>({ node: null, position: null });
  const [edgeDetails, setEdgeDetails] = useState<EdgeDetails>({ edge: null, position: null });
  const [showInternalOnly, setShowInternalOnly] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<string>('all');
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('all');
  
  // Node limiting for performance
  const [maxNodesToShow, setMaxNodesToShow] = useState(30);
  const [showAllNodes, setShowAllNodes] = useState(false);
  const defaultNodeLimit = 30;
  
  // Device list pagination state
  const [internalDevicesPage, setInternalDevicesPage] = useState(1);
  const [externalDevicesPage, setExternalDevicesPage] = useState(1);
  const [showAllInternal, setShowAllInternal] = useState(false);
  const [showAllExternal, setShowAllExternal] = useState(false);
  const devicesPerPage = 5;

  useEffect(() => {
    if (!networkRef.current || !topology) return;

    initializeNetwork();
    setIsLoading(false);

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
      }
    };
  }, [topology]);

  useEffect(() => {
    if (networkInstance.current) {
      updateNetworkFilters();
    }
  }, [showInternalOnly, selectedProtocol, selectedDeviceType, maxNodesToShow, showAllNodes]);

  const initializeNetwork = () => {
    if (!networkRef.current || !topology) return;

    // Prepare nodes data
    const visNodes = new DataSet<Node>(
      topology.nodes.map(node => ({
        id: node.id,
        label: node.label,
        title: createNodeTooltip(node),
        color: {
          background: node.color || '#97c2fc',
          border: '#2B7CE9',
          highlight: {
            background: '#D2E5FF',
            border: '#2B7CE9'
          }
        },
        size: node.size || 20,
        font: {
          size: 12,
          color: '#333333'
        },
        shape: getNodeShape(node.deviceType),
        borderWidth: 2
      }))
    );

    // Prepare edges data
    const visEdges = new DataSet<Edge>(
      topology.edges.map(edge => ({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        title: createEdgeTooltip(edge),
        color: {
          color: edge.color || '#848484',
          highlight: '#FF9500',
          hover: '#FF9500'
        },
        width: edge.width || 2,
        dashes: edge.dashes || false,
        arrows: {
          to: { enabled: true, scaleFactor: 0.5 }
        },
        smooth: {
          enabled: true,
          type: 'dynamic',
          roundness: 0.5
        }
      }))
    );

    // Network configuration
    const options = {
      nodes: {
        borderWidth: 2,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.2)',
          size: 5,
          x: 2,
          y: 2
        }
      },
      edges: {
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.1)',
          size: 3,
          x: 1,
          y: 1
        },
        smooth: {
          enabled: true,
          type: 'dynamic',
          roundness: 0.5
        }
      },
      physics: {
        enabled: true,
        stabilization: {
          enabled: true,
          iterations: 200,
          updateInterval: 25
        },
        barnesHut: {
          gravitationalConstant: -8000,
          centralGravity: 0.3,
          springLength: 150,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 0.1
        }
      },
      interaction: {
        hover: true,
        hoverConnectedEdges: true,
        selectConnectedEdges: false,
        tooltipDelay: 300
      },
      layout: {
        improvedLayout: true,
        clusterThreshold: 150
      }
    };

    // Create network
    networkInstance.current = new Network(
      networkRef.current,
      { nodes: visNodes, edges: visEdges },
      options
    );

    // Event handlers
    networkInstance.current.on('click', (params) => {
      setNodeDetails({ node: null, position: null });
      setEdgeDetails({ edge: null, position: null });

      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = topology.nodes.find(n => n.id === nodeId);
        if (node) {
          setNodeDetails({
            node,
            position: { x: params.pointer.DOM.x, y: params.pointer.DOM.y }
          });
        }
      } else if (params.edges.length > 0) {
        const edgeId = params.edges[0];
        const edge = topology.edges.find(e => e.id === edgeId);
        if (edge) {
          setEdgeDetails({
            edge,
            position: { x: params.pointer.DOM.x, y: params.pointer.DOM.y }
          });
        }
      }
    });

    networkInstance.current.on('stabilized', () => {
      setIsLoading(false);
    });
  };

  const updateNetworkFilters = () => {
    if (!networkInstance.current || !topology) return;

    // Filter nodes based on filters
    const filteredNodes = topology.nodes.filter(node => {
      if (showInternalOnly && !node.isInternal) return false;
      if (selectedDeviceType !== 'all' && node.deviceType !== selectedDeviceType) return false;
      if (selectedProtocol !== 'all' && !node.protocols.includes(selectedProtocol)) return false;
      return true;
    });

    // Apply node limiting for performance
    let nodesToShow = filteredNodes;
    if (!showAllNodes && filteredNodes.length > maxNodesToShow) {
      // Prioritize important nodes (routers, gateways, servers) first
      const prioritizedNodes = [...filteredNodes].sort((a, b) => {
        const priorityOrder = { 'gateway': 0, 'router': 1, 'server': 2, 'dns': 3, 'client': 4, 'unknown': 5 };
        const aPriority = priorityOrder[a.deviceType] ?? 5;
        const bPriority = priorityOrder[b.deviceType] ?? 5;
        
        if (aPriority !== bPriority) return aPriority - bPriority;
        
        // Secondary sort by number of connections (more connected nodes first)
        if (a.connections !== b.connections) return b.connections - a.connections;
        
        // Tertiary sort by bytes (higher traffic first)
        return b.bytes - a.bytes;
      });
      
      nodesToShow = prioritizedNodes.slice(0, maxNodesToShow);
    }

    // Filter edges - only show edges between visible nodes
    const nodeIds = new Set(nodesToShow.map(n => n.id));
    const filteredEdges = topology.edges.filter(edge => {
      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) return false;
      if (selectedProtocol !== 'all' && !edge.protocols.includes(selectedProtocol)) return false;
      return true;
    });

    // Update network data
    const visNodes = new DataSet<Node>(
      nodesToShow.map(node => ({
        id: node.id,
        label: node.label,
        title: createNodeTooltip(node),
        color: {
          background: node.color || '#97c2fc',
          border: '#2B7CE9'
        },
        size: node.size || 20,
        font: { size: 12, color: '#333333' },
        shape: getNodeShape(node.deviceType),
        borderWidth: 2
      }))
    );

    const visEdges = new DataSet<Edge>(
      filteredEdges.map(edge => ({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        title: createEdgeTooltip(edge),
        color: { color: edge.color || '#848484' },
        width: edge.width || 2,
        dashes: edge.dashes || false,
        arrows: { to: { enabled: true, scaleFactor: 0.5 } },
        smooth: {
          enabled: true,
          type: 'dynamic',
          roundness: 0.5
        }
      }))
    );

    networkInstance.current.setData({ nodes: visNodes, edges: visEdges });
  };

  const createNodeTooltip = (node: NetworkNode): string => {
    return `
      <div style="max-width: 200px; padding: 8px;">
        <strong>${node.label}</strong><br/>
        IP: ${node.ip}<br/>
        Type: ${node.deviceType}<br/>
        Packets: ${node.packets.toLocaleString()}<br/>
        Bytes: ${formatBytes(node.bytes)}<br/>
        Connections: ${node.connections}<br/>
        Protocols: ${node.protocols.join(', ')}
      </div>
    `;
  };

  const createEdgeTooltip = (edge: NetworkEdge): string => {
    return `
      <div style="max-width: 200px; padding: 8px;">
        <strong>${edge.from} → ${edge.to}</strong><br/>
        Packets: ${edge.packets.toLocaleString()}<br/>
        Bytes: ${formatBytes(edge.bytes)}<br/>
        Protocols: ${edge.protocols.join(', ')}<br/>
        Quality: ${edge.quality}<br/>
        ${edge.latency ? `Latency: ${edge.latency.toFixed(1)}ms` : ''}
      </div>
    `;
  };

  const getNodeShape = (deviceType: NetworkNode['deviceType']): string => {
    switch (deviceType) {
      case 'gateway':
      case 'router':
        return 'triangle';
      case 'server':
        return 'box';
      case 'dns':
        return 'diamond';
      case 'client':
        return 'dot';
      default:
        return 'dot';
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleZoomIn = () => {
    if (networkInstance.current) {
      const scale = networkInstance.current.getScale();
      networkInstance.current.moveTo({ scale: scale * 1.2 });
    }
  };

  const handleZoomOut = () => {
    if (networkInstance.current) {
      const scale = networkInstance.current.getScale();
      networkInstance.current.moveTo({ scale: scale * 0.8 });
    }
  };

  const handleReset = () => {
    if (networkInstance.current) {
      networkInstance.current.fit();
    }
  };

  const getDeviceIcon = (deviceType: NetworkNode['deviceType']) => {
    switch (deviceType) {
      case 'gateway':
      case 'router':
        return <Router className="h-4 w-4" />;
      case 'server':
        return <Server className="h-4 w-4" />;
      case 'dns':
        return <Globe className="h-4 w-4" />;
      case 'client':
        return <Laptop className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const uniqueProtocols = Array.from(
    new Set(topology.nodes.flatMap(node => node.protocols))
  ).sort();

  const uniqueDeviceTypes = Array.from(
    new Set(topology.nodes.map(node => node.deviceType))
  ).sort();

  // Device list helper functions
  const getInternalDevicesForPage = () => {
    if (!topology.internalDevices) return [];
    
    if (showAllInternal) {
      return topology.internalDevices;
    }
    
    const startIndex = (internalDevicesPage - 1) * devicesPerPage;
    const endIndex = startIndex + devicesPerPage;
    return topology.internalDevices.slice(startIndex, endIndex);
  };

  const getExternalDevicesForPage = () => {
    if (!topology.externalDevices) return [];
    
    if (showAllExternal) {
      return topology.externalDevices;
    }
    
    const startIndex = (externalDevicesPage - 1) * devicesPerPage;
    const endIndex = startIndex + devicesPerPage;
    return topology.externalDevices.slice(startIndex, endIndex);
  };

  const getTotalInternalPages = () => {
    if (!topology.internalDevices) return 0;
    return Math.ceil(topology.internalDevices.length / devicesPerPage);
  };

  const getTotalExternalPages = () => {
    if (!topology.externalDevices) return 0;
    return Math.ceil(topology.externalDevices.length / devicesPerPage);
  };

  const getDeviceTypeIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'router/gateway':
      case 'router':
      case 'gateway':
        return <Router className="h-4 w-4 text-orange-500" />;
      case 'server':
        return <Server className="h-4 w-4 text-blue-500" />;
      case 'computer':
      case 'workstation':
        return <Laptop className="h-4 w-4 text-green-500" />;
      case 'iot device':
        return <Wifi className="h-4 w-4 text-purple-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <NetworkIcon className="h-5 w-5" />
            <CardTitle>Network Topology</CardTitle>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Node Limiting Control */}
            {topology.nodes.length > defaultNodeLimit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllNodes(!showAllNodes)}
              >
                {showAllNodes ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show More ({topology.nodes.length - maxNodesToShow}+ hidden)
                  </>
                )}
              </Button>
            )}
            
            {/* Filter Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInternalOnly(!showInternalOnly)}
            >
              {showInternalOnly ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
              {showInternalOnly ? 'Show All' : 'Internal Only'}
            </Button>
            
            <select
              value={selectedProtocol}
              onChange={(e) => setSelectedProtocol(e.target.value)}
              className="px-2 py-1 text-sm border rounded"
            >
              <option value="all">All Protocols</option>
              {uniqueProtocols.map(protocol => (
                <option key={protocol} value={protocol}>{protocol}</option>
              ))}
            </select>
            
            <select
              value={selectedDeviceType}
              onChange={(e) => setSelectedDeviceType(e.target.value)}
              className="px-2 py-1 text-sm border rounded"
            >
              <option value="all">All Devices</option>
              {uniqueDeviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Zoom Controls */}
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Network Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {!showAllNodes && topology.nodes.length > maxNodesToShow ? 
                `${maxNodesToShow}/${topology.statistics.totalNodes}` : 
                topology.statistics.totalNodes
              }
            </div>
            <div className="text-sm text-muted-foreground">
              {!showAllNodes && topology.nodes.length > maxNodesToShow ? 
                'Displayed/Total Nodes' : 
                'Nodes'
              }
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {topology.statistics.totalEdges}
            </div>
            <div className="text-sm text-muted-foreground">Connections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {topology.statistics.internalNodes}
            </div>
            <div className="text-sm text-muted-foreground">Internal</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {topology.statistics.externalNodes}
            </div>
            <div className="text-sm text-muted-foreground">External</div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Network Visualization */}
        <div className="relative">
          <div
            ref={networkRef}
            className="w-full h-[600px] border rounded-lg bg-gray-50 dark:bg-gray-900"
            style={{ cursor: 'grab' }}
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <div className="text-sm text-muted-foreground">Building network topology...</div>
              </div>
            </div>
          )}

          {/* Node Details Popup */}
          {nodeDetails.node && nodeDetails.position && (
            <div
              className="absolute bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 z-10 max-w-xs"
              style={{
                left: Math.min(nodeDetails.position.x, window.innerWidth - 300),
                top: Math.max(nodeDetails.position.y - 100, 10)
              }}
            >
              <div className="flex items-center space-x-2 mb-2">
                {getDeviceIcon(nodeDetails.node.deviceType)}
                <span className="font-semibold">{nodeDetails.node.label}</span>
                <Badge variant={nodeDetails.node.isInternal ? 'default' : 'secondary'}>
                  {nodeDetails.node.isInternal ? 'Internal' : 'External'}
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div><strong>IP:</strong> {nodeDetails.node.ip}</div>
                <div><strong>Type:</strong> {nodeDetails.node.deviceType}</div>
                <div><strong>Packets:</strong> {nodeDetails.node.packets.toLocaleString()}</div>
                <div><strong>Bytes:</strong> {formatBytes(nodeDetails.node.bytes)}</div>
                <div><strong>Connections:</strong> {nodeDetails.node.connections}</div>
                <div><strong>Protocols:</strong> {nodeDetails.node.protocols.join(', ')}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setNodeDetails({ node: null, position: null })}
              >
                Close
              </Button>
            </div>
          )}

          {/* Edge Details Popup */}
          {edgeDetails.edge && edgeDetails.position && (
            <div
              className="absolute bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 z-10 max-w-xs"
              style={{
                left: Math.min(edgeDetails.position.x, window.innerWidth - 300),
                top: Math.max(edgeDetails.position.y - 100, 10)
              }}
            >
              <div className="font-semibold mb-2">
                {edgeDetails.edge.from} → {edgeDetails.edge.to}
              </div>
              <div className="space-y-1 text-sm">
                <div><strong>Packets:</strong> {edgeDetails.edge.packets.toLocaleString()}</div>
                <div><strong>Bytes:</strong> {formatBytes(edgeDetails.edge.bytes)}</div>
                <div><strong>Protocols:</strong> {edgeDetails.edge.protocols.join(', ')}</div>
                <div><strong>Quality:</strong> 
                  <Badge className="ml-1" variant={
                    edgeDetails.edge.quality === 'excellent' ? 'default' :
                    edgeDetails.edge.quality === 'good' ? 'secondary' :
                    edgeDetails.edge.quality === 'fair' ? 'outline' : 'destructive'
                  }>
                    {edgeDetails.edge.quality}
                  </Badge>
                </div>
                {edgeDetails.edge.latency && (
                  <div><strong>Latency:</strong> {edgeDetails.edge.latency.toFixed(1)}ms</div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setEdgeDetails({ edge: null, position: null })}
              >
                Close
              </Button>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-semibold mb-3">Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Device Types</h5>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Gateway</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Router</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Server</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Client</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>DNS</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Connection Quality</h5>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-green-500"></div>
                  <span>Excellent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-blue-500"></div>
                  <span>Good</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-yellow-500"></div>
                  <span>Fair</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-red-500 border-dashed border"></div>
                  <span>Poor</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Interaction</h5>
              <div className="space-y-1 text-xs">
                <div>• Click nodes/edges for details</div>
                <div>• Drag to pan around</div>
                <div>• Scroll to zoom</div>
                <div>• Drag nodes to reposition</div>
              </div>
            </div>
          </div>
        </div>

        {/* Device Lists Section */}
        <Separator className="my-8" />
        
        <div className="space-y-8">
          {/* Internal Devices */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Wifi className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold">Internal Devices</h3>
                <Badge variant="outline">{topology.internalDevices?.length || 0} devices</Badge>
              </div>
              {topology.internalDevices && topology.internalDevices.length > devicesPerPage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllInternal(!showAllInternal)}
                >
                  {showAllInternal ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show All ({topology.internalDevices.length})
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>MAC Address</TableHead>
                      <TableHead>Hostname</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Last Seen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getInternalDevicesForPage().map((device, index) => (
                      <TableRow key={`${device.ip}-${index}`}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getDeviceTypeIcon(device.deviceType)}
                            <span className="font-mono text-sm">{device.ip}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{device.ip}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {device.mac || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {device.hostname || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {device.deviceType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {device.lastSeen}
                        </TableCell>
                      </TableRow>
                    ))}
                    {getInternalDevicesForPage().length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No internal devices found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              
              {/* Internal Devices Pagination */}
              {!showAllInternal && topology.internalDevices && topology.internalDevices.length > devicesPerPage && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {Math.min((internalDevicesPage - 1) * devicesPerPage + 1, topology.internalDevices.length)} to{' '}
                    {Math.min(internalDevicesPage * devicesPerPage, topology.internalDevices.length)} of{' '}
                    {topology.internalDevices.length} devices
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={internalDevicesPage === 1}
                      onClick={() => setInternalDevicesPage(internalDevicesPage - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {internalDevicesPage} of {getTotalInternalPages()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={internalDevicesPage === getTotalInternalPages()}
                      onClick={() => setInternalDevicesPage(internalDevicesPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* External Devices */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-semibold">External Devices</h3>
                <Badge variant="outline">{topology.externalDevices?.length || 0} devices</Badge>
              </div>
              {topology.externalDevices && topology.externalDevices.length > devicesPerPage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllExternal(!showAllExternal)}
                >
                  {showAllExternal ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show All ({topology.externalDevices.length})
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Hostname</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Last Seen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getExternalDevicesForPage().map((device, index) => (
                      <TableRow key={`${device.ip}-${index}`}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-blue-500" />
                            <span className="font-mono text-sm">{device.ip}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {device.hostname || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {device.country ? (
                            <Badge variant="outline" className="text-xs">
                              {device.country}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Unknown</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {device.lastSeen}
                        </TableCell>
                      </TableRow>
                    ))}
                    {getExternalDevicesForPage().length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No external devices found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              
              {/* External Devices Pagination */}
              {!showAllExternal && topology.externalDevices && topology.externalDevices.length > devicesPerPage && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {Math.min((externalDevicesPage - 1) * devicesPerPage + 1, topology.externalDevices.length)} to{' '}
                    {Math.min(externalDevicesPage * devicesPerPage, topology.externalDevices.length)} of{' '}
                    {topology.externalDevices.length} devices
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={externalDevicesPage === 1}
                      onClick={() => setExternalDevicesPage(externalDevicesPage - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {externalDevicesPage} of {getTotalExternalPages()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={externalDevicesPage === getTotalExternalPages()}
                      onClick={() => setExternalDevicesPage(externalDevicesPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
