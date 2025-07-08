
export interface AnalysisResult {
  id: string;
  filename: string;
  fileSize: number;
  createdAt: string;
  status: 'processing' | 'completed' | 'failed';
  
  // Basic metrics
  totalPackets: number;
  totalBytes: number;
  captureDuration: number;
  avgPacketSize: number;
  throughput: number;
  qualityScore: number;
  
  // Protocol distribution
  protocols: Record<string, number>;
  
  // Analysis results
  tcpAnalysis?: TcpAnalysis;
  udpAnalysis?: UdpAnalysis;
  dnsAnalysis?: DnsAnalysis;
  httpAnalysis?: HttpAnalysis;
  tlsAnalysis?: TlsAnalysis;
  dhcpAnalysis?: DhcpAnalysis;
  
  // Issues and alerts
  securityAlerts: SecurityAlert[];
  performanceIssues: PerformanceIssue[];
  
  // Top talkers and conversations
  topTalkers: TopTalker[];
  topConversations: Conversation[];
  
  // Network topology data
  networkTopology?: NetworkTopology;
  
  // Traffic flow data
  trafficFlow?: TrafficFlow;
  
  // Timeline analysis data
  timelineAnalysis?: TimelineAnalysis;
}

export interface TcpAnalysis {
  retransmissions: number;
  retransmissionRate: number;
  connectionResets: number;
  synDelayAvg: number;
  synDelayMax: number;
  connections: number;
}

export interface UdpAnalysis {
  flows: number;
  jitterAvg: number;
  jitterMax: number;
  packetLoss: number;
}

export interface DnsAnalysis {
  queries: number;
  responses: number;
  timeouts: number;
  responseTimeAvg: number;
  responseTimeMax: number;
  queryTypes: Record<string, number>;
  topDomains: DomainStat[];
}

export interface HttpAnalysis {
  requests: number;
  responses: number;
  errors4xx: number;
  errors5xx: number;
  statusCodes: Record<string, number>;
}

export interface TlsAnalysis {
  handshakes: number;
  alerts: number;
  versions: Record<string, number>;
  cipherSuites: Record<string, number>;
  certIssues: number;
}

export interface DhcpAnalysis {
  discoveries: number;
  offers: number;
  requests: number;
  acks: number;
  naks: number;
  successRate: number;
  servers: string[];
}

export interface SecurityAlert {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  type: string;
  title: string;
  description: string;
  count: number;
  timestamp: string;
}

export interface PerformanceIssue {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  type: string;
  title: string;
  description: string;
  value: number;
  threshold: number;
  timestamp: string;
}

export interface TopTalker {
  ip: string;
  packets: number;
  bytes: number;
  percentage: number;
}

export interface Conversation {
  src: string;
  dst: string;
  packets: number;
  bytes: number;
  protocol: string;
}

export interface DomainStat {
  domain: string;
  count: number;
}

export interface UploadProgress {
  stage: string;
  progress: number;
  message: string;
}

export type AppState = 'upload' | 'processing' | 'dashboard';

export interface AppContext {
  state: AppState;
  setState: (state: AppState) => void;
  analysis: AnalysisResult | null;
  setAnalysis: (analysis: AnalysisResult | null) => void;
  uploadProgress: UploadProgress | null;
  setUploadProgress: (progress: UploadProgress | null) => void;
  analysisId: string | null;
  setAnalysisId: (id: string | null) => void;
}

// Network Topology Interfaces
export interface NetworkTopology {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  statistics: TopologyStatistics;
  segments: NetworkSegment[];
  internalDevices: Array<{
    ip: string;
    mac?: string;
    hostname?: string;
    deviceType: string;
    lastSeen: string;
  }>;
  externalDevices: Array<{
    ip: string;
    hostname?: string;
    country?: string;
    lastSeen: string;
  }>;
}

export interface NetworkNode {
  id: string;
  label: string;
  ip: string;
  hostname?: string;
  deviceType: 'client' | 'server' | 'router' | 'gateway' | 'dns' | 'unknown';
  packets: number;
  bytes: number;
  connections: number;
  protocols: string[];
  isInternal: boolean;
  firstSeen: string;
  lastSeen: string;
  // Visual properties
  size?: number;
  color?: string;
  x?: number;
  y?: number;
}

export interface NetworkEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  packets: number;
  bytes: number;
  protocols: string[];
  direction: 'bidirectional' | 'unidirectional';
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  latency?: number;
  // Visual properties
  width?: number;
  color?: string;
  dashes?: boolean;
}

export interface TopologyStatistics {
  totalNodes: number;
  totalEdges: number;
  internalNodes: number;
  externalNodes: number;
  totalTraffic: number;
  protocolDistribution: Record<string, number>;
  networkSegments: NetworkSegment[];
}

export interface NetworkSegment {
  subnet: string;
  nodeCount: number;
  trafficVolume: number;
}

// Traffic Flow Interfaces
export interface TrafficFlow {
  flows: TrafficFlowNode[];
  links: TrafficFlowLink[];
  statistics: TrafficFlowStatistics;
}

export interface TrafficFlowNode {
  id: string;
  name: string;
  ip: string;
  hostname?: string;
  type: 'internal' | 'external';
  deviceType: 'client' | 'server' | 'router' | 'gateway' | 'dns' | 'unknown';
  totalBytes: number;
  totalPackets: number;
  incomingBytes: number;
  outgoingBytes: number;
  protocolBreakdown: Record<string, number>;
}

export interface TrafficFlowLink {
  id: string;
  source: string;
  target: string;
  bytes: number;
  packets: number;
  protocols: string[];
  direction: 'bidirectional' | 'source-to-target' | 'target-to-source';
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  latency?: number;
  bandwidth?: number;
}

export interface TrafficFlowStatistics {
  totalFlow: number;
  peakBandwidth: number;
  averageBandwidth: number;
  topProtocols: Array<{ protocol: string; bytes: number; percentage: number }>;
  topSources: Array<{ ip: string; bytes: number; percentage: number }>;
  topDestinations: Array<{ ip: string; bytes: number; percentage: number }>;
  internalTraffic: number;
  externalTraffic: number;
  crossSegmentTraffic: number;
}

// Timeline Analysis Interfaces
export interface TimelineAnalysis {
  timelineData: TimelineDataPoint[];
  statistics: TimelineStatistics;
  eventMarkers: TimelineEvent[];
  protocolTimelines: ProtocolTimeline[];
}

export interface TimelineDataPoint {
  timestamp: number; // Unix timestamp in milliseconds
  packetCount: number;
  bytes: number;
  protocols: Record<string, number>; // Protocol counts for this time interval
  latency?: number;
  throughput: number; // bits per second
}

export interface TimelineStatistics {
  totalDuration: number; // seconds
  peakActivity: {
    timestamp: number;
    packetCount: number;
    bytes: number;
  };
  averagePacketsPerSecond: number;
  averageBytesPerSecond: number;
  quietPeriods: Array<{ start: number; end: number; duration: number }>;
  busyPeriods: Array<{ start: number; end: number; duration: number; intensity: number }>;
}

export interface TimelineEvent {
  id: string;
  timestamp: number;
  type: 'connection_start' | 'connection_end' | 'error' | 'spike' | 'anomaly' | 'security_event';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  protocol?: string;
  source?: string;
  destination?: string;
  details?: Record<string, any>;
}

export interface ProtocolTimeline {
  protocol: string;
  dataPoints: Array<{
    timestamp: number;
    packets: number;
    bytes: number;
  }>;
  color: string;
  totalPackets: number;
  totalBytes: number;
}

// Raw Packet Interface for PCAP parsing
export interface RawPacket {
  timestamp: number; // Unix timestamp in milliseconds
  length: number;
  capturedLength: number;
  data: Buffer;
  // Parsed fields
  ethernet?: EthernetHeader;
  ip?: IPHeader;
  tcp?: TCPHeader;
  udp?: UDPHeader;
  dns?: DNSHeader;
  http?: HTTPHeader;
}

export interface EthernetHeader {
  destinationMac: string;
  sourceMac: string;
  etherType: number;
  protocol: string;
}

export interface IPHeader {
  version: number;
  headerLength: number;
  typeOfService: number;
  totalLength: number;
  identification: number;
  flags: number;
  fragmentOffset: number;
  timeToLive: number;
  protocol: number;
  headerChecksum: number;
  sourceIP: string;
  destinationIP: string;
  protocolName: string;
}

export interface TCPHeader {
  sourcePort: number;
  destinationPort: number;
  sequenceNumber: number;
  acknowledgmentNumber: number;
  headerLength: number;
  flags: {
    fin: boolean;
    syn: boolean;
    rst: boolean;
    psh: boolean;
    ack: boolean;
    urg: boolean;
  };
  windowSize: number;
  checksum: number;
  urgentPointer: number;
}

export interface UDPHeader {
  sourcePort: number;
  destinationPort: number;
  length: number;
  checksum: number;
}

export interface DNSHeader {
  transactionId: number;
  flags: number;
  questions: number;
  answerRRs: number;
  authorityRRs: number;
  additionalRRs: number;
  queries?: DNSQuery[];
  answers?: DNSAnswer[];
}

export interface DNSQuery {
  name: string;
  type: number;
  class: number;
}

export interface DNSAnswer {
  name: string;
  type: number;
  class: number;
  ttl: number;
  data: string;
}

export interface HTTPHeader {
  method?: string;
  url?: string;
  version?: string;
  statusCode?: number;
  statusMessage?: string;
  headers: Record<string, string>;
  contentLength?: number;
}
