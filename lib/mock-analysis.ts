
import { AnalysisResult, TcpAnalysis, UdpAnalysis, DnsAnalysis, HttpAnalysis, TlsAnalysis, DhcpAnalysis, SecurityAlert, PerformanceIssue, TopTalker, Conversation, NetworkTopology, NetworkNode, NetworkEdge, TopologyStatistics, NetworkSegment, TrafficFlow, TrafficFlowNode, TrafficFlowLink, TrafficFlowStatistics } from './types';

// DISABLED: This function should NEVER be used - only real PCAP analysis allowed
export function generateMockAnalysis(filename: string = 'sample.pcap', fileSize: number = 5242880): AnalysisResult {
  throw new Error('MOCK DATA GENERATION DISABLED: Only real PCAP file analysis is allowed. Upload a real PCAP file instead.');
  // Base metrics that influence other calculations
  const totalPackets = Math.floor(Math.random() * 50000) + 10000;
  const captureDuration = Math.floor(Math.random() * 300) + 60; // 1-6 minutes
  const totalBytes = Math.floor(totalPackets * (Math.random() * 800 + 400)); // 400-1200 bytes avg
  const avgPacketSize = totalBytes / totalPackets;
  const throughput = (totalBytes * 8) / captureDuration; // bits per second

  // Protocol distribution (should add up to 100%)
  const tcpPercent = Math.random() * 30 + 50; // 50-80%
  const udpPercent = Math.random() * 20 + 10; // 10-30%
  const remaining = 100 - tcpPercent - udpPercent;
  const dnsPercent = Math.random() * (remaining * 0.6);
  const httpPercent = Math.random() * (remaining * 0.3);
  const tlsPercent = Math.random() * (remaining * 0.2);
  const dhcpPercent = remaining - dnsPercent - httpPercent - tlsPercent;

  const protocols = {
    tcp: Number(tcpPercent.toFixed(1)),
    udp: Number(udpPercent.toFixed(1)),
    dns: Number(dnsPercent.toFixed(1)),
    http: Number(httpPercent.toFixed(1)),
    tls: Number(tlsPercent.toFixed(1)),
    dhcp: Number(dhcpPercent.toFixed(1)),
  };

  // Generate detailed protocol analysis
  const tcpAnalysis = generateTcpAnalysis(totalPackets, protocols.tcp);
  const udpAnalysis = generateUdpAnalysis(totalPackets, protocols.udp);
  const dnsAnalysis = generateDnsAnalysis(totalPackets, protocols.dns);
  const httpAnalysis = generateHttpAnalysis(totalPackets, protocols.http);
  const tlsAnalysis = generateTlsAnalysis(totalPackets, protocols.tls);
  const dhcpAnalysis = generateDhcpAnalysis(totalPackets, protocols.dhcp);

  // Generate security alerts and performance issues
  const { securityAlerts, performanceIssues } = generateAlertsAndIssues(
    tcpAnalysis, udpAnalysis, dnsAnalysis, httpAnalysis, tlsAnalysis, dhcpAnalysis
  );

  // Calculate quality score based on issues
  const qualityScore = calculateQualityScore(tcpAnalysis, udpAnalysis, dnsAnalysis, securityAlerts, performanceIssues);

  // Generate top talkers and conversations
  const topTalkers = generateTopTalkers(totalPackets, totalBytes);
  const topConversations = generateTopConversations(totalPackets);

  // Generate network topology
  const networkTopology = generateNetworkTopology(topTalkers, topConversations, totalPackets, totalBytes, protocols);

  // Generate traffic flow
  const trafficFlow = generateTrafficFlow(topTalkers, topConversations, totalPackets, totalBytes, protocols);

  return {
    id: generateId(),
    filename,
    fileSize,
    createdAt: new Date().toISOString(),
    status: 'completed',
    totalPackets,
    totalBytes: totalBytes,
    captureDuration,
    avgPacketSize,
    throughput,
    qualityScore,
    protocols,
    tcpAnalysis,
    udpAnalysis,
    dnsAnalysis,
    httpAnalysis,
    tlsAnalysis,
    dhcpAnalysis,
    securityAlerts,
    performanceIssues,
    topTalkers,
    topConversations,
    networkTopology,
    trafficFlow,
  };
}

function generateTcpAnalysis(totalPackets: number, tcpPercent: number): TcpAnalysis {
  const tcpPackets = Math.floor((totalPackets * tcpPercent) / 100);
  const connections = Math.floor(tcpPackets / (Math.random() * 50 + 20)); // 20-70 packets per connection
  const retransmissions = Math.floor(tcpPackets * (Math.random() * 0.08)); // 0-8% retransmission rate
  const retransmissionRate = (retransmissions / tcpPackets) * 100;
  const connectionResets = Math.floor(connections * (Math.random() * 0.05)); // 0-5% reset rate
  const synDelayAvg = Math.random() * 500 + 10; // 10-510ms
  const synDelayMax = synDelayAvg + Math.random() * 1000; // up to 1s more than avg

  return {
    retransmissions,
    retransmissionRate,
    connectionResets,
    synDelayAvg,
    synDelayMax,
    connections,
  };
}

function generateUdpAnalysis(totalPackets: number, udpPercent: number): UdpAnalysis {
  const udpPackets = Math.floor((totalPackets * udpPercent) / 100);
  const flows = Math.floor(udpPackets / (Math.random() * 30 + 10)); // 10-40 packets per flow
  const jitterAvg = Math.random() * 150 + 5; // 5-155ms
  const jitterMax = jitterAvg + Math.random() * 300; // up to 300ms more than avg
  const packetLoss = Math.random() * 3; // 0-3% packet loss

  return {
    flows,
    jitterAvg,
    jitterMax,
    packetLoss,
  };
}

function generateDnsAnalysis(totalPackets: number, dnsPercent: number): DnsAnalysis {
  const dnsPackets = Math.floor((totalPackets * dnsPercent) / 100);
  const queries = Math.floor(dnsPackets / 2); // roughly half queries, half responses
  const responses = Math.floor(queries * (0.95 + Math.random() * 0.05)); // 95-100% response rate
  const timeouts = queries - responses;
  const responseTimeAvg = Math.random() * 200 + 20; // 20-220ms
  const responseTimeMax = responseTimeAvg + Math.random() * 2000; // up to 2s more

  const queryTypes = {
    A: Math.floor(Math.random() * 40) + 40, // 40-80%
    AAAA: Math.floor(Math.random() * 20) + 5, // 5-25%
    CNAME: Math.floor(Math.random() * 15) + 2, // 2-17%
    MX: Math.floor(Math.random() * 8) + 1, // 1-9%
    TXT: Math.floor(Math.random() * 5) + 1, // 1-6%
    PTR: Math.floor(Math.random() * 3) + 1, // 1-4%
  };

  const topDomains = [
    { domain: 'google.com', count: Math.floor(Math.random() * 50) + 20 },
    { domain: 'facebook.com', count: Math.floor(Math.random() * 30) + 15 },
    { domain: 'cloudflare.com', count: Math.floor(Math.random() * 25) + 10 },
    { domain: 'amazonaws.com', count: Math.floor(Math.random() * 20) + 8 },
    { domain: 'microsoft.com', count: Math.floor(Math.random() * 15) + 5 },
  ];

  return {
    queries,
    responses,
    timeouts,
    responseTimeAvg,
    responseTimeMax,
    queryTypes,
    topDomains,
  };
}

function generateHttpAnalysis(totalPackets: number, httpPercent: number): HttpAnalysis {
  const httpPackets = Math.floor((totalPackets * httpPercent) / 100);
  const requests = Math.floor(httpPackets / 3); // roughly 1/3 requests
  const responses = Math.floor(requests * (0.95 + Math.random() * 0.05)); // 95-100% response rate
  const errors4xx = Math.floor(responses * (Math.random() * 0.1)); // 0-10% 4xx errors
  const errors5xx = Math.floor(responses * (Math.random() * 0.03)); // 0-3% 5xx errors

  const statusCodes = {
    200: responses - errors4xx - errors5xx,
    404: Math.floor(errors4xx * 0.7),
    403: Math.floor(errors4xx * 0.2),
    401: errors4xx - Math.floor(errors4xx * 0.9),
    500: Math.floor(errors5xx * 0.6),
    502: Math.floor(errors5xx * 0.3),
    503: errors5xx - Math.floor(errors5xx * 0.9),
  };

  return {
    requests,
    responses,
    errors4xx,
    errors5xx,
    statusCodes,
  };
}

function generateTlsAnalysis(totalPackets: number, tlsPercent: number): TlsAnalysis {
  const tlsPackets = Math.floor((totalPackets * tlsPercent) / 100);
  const handshakes = Math.floor(tlsPackets / (Math.random() * 20 + 10)); // 10-30 packets per handshake
  const alerts = Math.floor(handshakes * (Math.random() * 0.05)); // 0-5% alert rate
  const certIssues = Math.floor(handshakes * (Math.random() * 0.02)); // 0-2% cert issues

  const versions = {
    'TLS 1.2': Math.floor(Math.random() * 40) + 50, // 50-90%
    'TLS 1.3': Math.floor(Math.random() * 30) + 10, // 10-40%
    'TLS 1.1': Math.floor(Math.random() * 5), // 0-5%
    'TLS 1.0': Math.floor(Math.random() * 3), // 0-3%
  };

  const cipherSuites = {
    'AES-256-GCM': Math.floor(Math.random() * 30) + 40, // 40-70%
    'ChaCha20-Poly1305': Math.floor(Math.random() * 25) + 15, // 15-40%
    'AES-128-GCM': Math.floor(Math.random() * 20) + 10, // 10-30%
    'ECDHE-RSA-AES256': Math.floor(Math.random() * 15) + 5, // 5-20%
  };

  return {
    handshakes,
    alerts,
    versions,
    cipherSuites,
    certIssues,
  };
}

function generateDhcpAnalysis(totalPackets: number, dhcpPercent: number): DhcpAnalysis {
  const dhcpPackets = Math.floor((totalPackets * dhcpPercent) / 100);
  const discoveries = Math.floor(dhcpPackets / 4); // DHCP has 4-message exchange
  const offers = Math.floor(discoveries * (0.95 + Math.random() * 0.05)); // 95-100% offer rate
  const requests = Math.floor(offers * (0.98 + Math.random() * 0.02)); // 98-100% request rate
  const acks = Math.floor(requests * (0.95 + Math.random() * 0.05)); // 95-100% ack rate
  const naks = requests - acks;
  const successRate = (acks / discoveries) * 100;

  const servers = Math.random() > 0.7 ? ['192.168.1.1', '192.168.1.2'] : ['192.168.1.1'];

  return {
    discoveries,
    offers,
    requests,
    acks,
    naks,
    successRate,
    servers,
  };
}

function generateAlertsAndIssues(
  tcpAnalysis: TcpAnalysis,
  udpAnalysis: UdpAnalysis,
  dnsAnalysis: DnsAnalysis,
  httpAnalysis: HttpAnalysis,
  tlsAnalysis: TlsAnalysis,
  dhcpAnalysis: DhcpAnalysis
): { securityAlerts: SecurityAlert[]; performanceIssues: PerformanceIssue[] } {
  const securityAlerts: SecurityAlert[] = [];
  const performanceIssues: PerformanceIssue[] = [];

  // TCP-related issues
  if (tcpAnalysis.retransmissionRate > 5) {
    performanceIssues.push({
      id: generateId(),
      severity: tcpAnalysis.retransmissionRate > 10 ? 'CRITICAL' : 'WARNING',
      type: 'HIGH_RETRANSMISSION',
      title: 'High TCP Retransmission Rate',
      description: `TCP retransmission rate of ${tcpAnalysis.retransmissionRate.toFixed(1)}% exceeds recommended threshold of 5%`,
      value: tcpAnalysis.retransmissionRate,
      threshold: 5,
      timestamp: new Date().toISOString(),
    });
  }

  if (tcpAnalysis.synDelayAvg > 500) {
    performanceIssues.push({
      id: generateId(),
      severity: tcpAnalysis.synDelayAvg > 1000 ? 'CRITICAL' : 'WARNING',
      type: 'SLOW_CONNECTION',
      title: 'Slow TCP Connection Establishment',
      description: `Average SYN delay of ${tcpAnalysis.synDelayAvg.toFixed(1)}ms exceeds recommended threshold of 500ms`,
      value: tcpAnalysis.synDelayAvg,
      threshold: 500,
      timestamp: new Date().toISOString(),
    });
  }

  // UDP-related issues
  if (udpAnalysis.jitterAvg > 100) {
    performanceIssues.push({
      id: generateId(),
      severity: udpAnalysis.jitterAvg > 200 ? 'CRITICAL' : 'WARNING',
      type: 'HIGH_JITTER',
      title: 'High UDP Jitter',
      description: `Average UDP jitter of ${udpAnalysis.jitterAvg.toFixed(1)}ms exceeds recommended threshold of 100ms`,
      value: udpAnalysis.jitterAvg,
      threshold: 100,
      timestamp: new Date().toISOString(),
    });
  }

  // DNS-related issues
  if (dnsAnalysis.responseTimeAvg > 1000) {
    performanceIssues.push({
      id: generateId(),
      severity: dnsAnalysis.responseTimeAvg > 2000 ? 'CRITICAL' : 'WARNING',
      type: 'SLOW_DNS',
      title: 'Slow DNS Resolution',
      description: `Average DNS response time of ${dnsAnalysis.responseTimeAvg.toFixed(1)}ms exceeds recommended threshold of 1000ms`,
      value: dnsAnalysis.responseTimeAvg,
      threshold: 1000,
      timestamp: new Date().toISOString(),
    });
  }

  if (dnsAnalysis.timeouts > 0) {
    securityAlerts.push({
      id: generateId(),
      severity: dnsAnalysis.timeouts > 10 ? 'CRITICAL' : 'WARNING',
      type: 'DNS_TIMEOUT',
      title: 'DNS Query Timeouts',
      description: `${dnsAnalysis.timeouts} DNS queries timed out, which may indicate network issues or DNS server problems`,
      count: dnsAnalysis.timeouts,
      timestamp: new Date().toISOString(),
    });
  }

  // TLS-related issues
  if (tlsAnalysis.alerts > 0) {
    securityAlerts.push({
      id: generateId(),
      severity: tlsAnalysis.alerts > 5 ? 'CRITICAL' : 'WARNING',
      type: 'TLS_ALERT',
      title: 'TLS/SSL Alerts Detected',
      description: `${tlsAnalysis.alerts} TLS alerts detected, which may indicate certificate or configuration issues`,
      count: tlsAnalysis.alerts,
      timestamp: new Date().toISOString(),
    });
  }

  if (tlsAnalysis.certIssues > 0) {
    securityAlerts.push({
      id: generateId(),
      severity: 'CRITICAL',
      type: 'CERT_ISSUES',
      title: 'Certificate Issues Detected',
      description: `${tlsAnalysis.certIssues} certificate issues detected, including expired or self-signed certificates`,
      count: tlsAnalysis.certIssues,
      timestamp: new Date().toISOString(),
    });
  }

  // Check for weak TLS versions
  const weakTlsUsage = (tlsAnalysis.versions['TLS 1.0'] || 0) + (tlsAnalysis.versions['TLS 1.1'] || 0);
  if (weakTlsUsage > 5) {
    securityAlerts.push({
      id: generateId(),
      severity: 'WARNING',
      type: 'WEAK_TLS',
      title: 'Weak TLS Versions Detected',
      description: `${weakTlsUsage}% of TLS connections using deprecated TLS 1.0/1.1 versions`,
      count: weakTlsUsage,
      timestamp: new Date().toISOString(),
    });
  }

  // HTTP-related issues
  if (httpAnalysis.errors5xx > 0) {
    securityAlerts.push({
      id: generateId(),
      severity: httpAnalysis.errors5xx > 10 ? 'CRITICAL' : 'WARNING',
      type: 'HTTP_5XX',
      title: 'HTTP Server Errors',
      description: `${httpAnalysis.errors5xx} HTTP 5xx server errors detected, indicating server-side issues`,
      count: httpAnalysis.errors5xx,
      timestamp: new Date().toISOString(),
    });
  }

  // DHCP-related issues
  if (dhcpAnalysis.successRate < 95) {
    performanceIssues.push({
      id: generateId(),
      severity: dhcpAnalysis.successRate < 90 ? 'CRITICAL' : 'WARNING',
      type: 'DHCP_FAILURE',
      title: 'Low DHCP Success Rate',
      description: `DHCP success rate of ${dhcpAnalysis.successRate.toFixed(1)}% is below recommended 95%`,
      value: dhcpAnalysis.successRate,
      threshold: 95,
      timestamp: new Date().toISOString(),
    });
  }

  if (dhcpAnalysis.servers.length > 1) {
    securityAlerts.push({
      id: generateId(),
      severity: 'WARNING',
      type: 'MULTIPLE_DHCP',
      title: 'Multiple DHCP Servers Detected',
      description: `Multiple DHCP servers detected: ${dhcpAnalysis.servers.join(', ')}. This may cause IP conflicts`,
      count: dhcpAnalysis.servers.length,
      timestamp: new Date().toISOString(),
    });
  }

  return { securityAlerts, performanceIssues };
}

function calculateQualityScore(
  tcpAnalysis: TcpAnalysis,
  udpAnalysis: UdpAnalysis,
  dnsAnalysis: DnsAnalysis,
  securityAlerts: SecurityAlert[],
  performanceIssues: PerformanceIssue[]
): number {
  let score = 100;

  // Deduct points for TCP issues
  if (tcpAnalysis.retransmissionRate > 5) score -= 15;
  if (tcpAnalysis.synDelayAvg > 500) score -= 10;

  // Deduct points for UDP issues
  if (udpAnalysis.jitterAvg > 100) score -= 10;
  if (udpAnalysis.packetLoss > 1) score -= 15;

  // Deduct points for DNS issues
  if (dnsAnalysis.responseTimeAvg > 1000) score -= 10;
  if (dnsAnalysis.timeouts > 0) score -= 5;

  // Deduct points for security alerts
  const criticalAlerts = securityAlerts.filter(a => a.severity === 'CRITICAL').length;
  const warningAlerts = securityAlerts.filter(a => a.severity === 'WARNING').length;
  score -= criticalAlerts * 10;
  score -= warningAlerts * 5;

  // Deduct points for performance issues
  const criticalIssues = performanceIssues.filter(i => i.severity === 'CRITICAL').length;
  const warningIssues = performanceIssues.filter(i => i.severity === 'WARNING').length;
  score -= criticalIssues * 8;
  score -= warningIssues * 4;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function generateTopTalkers(totalPackets: number, totalBytes: number): TopTalker[] {
  const ips = [
    '192.168.1.100', '192.168.1.101', '8.8.8.8', '1.1.1.1', '192.168.1.1',
    '10.0.0.50', '172.16.1.10', '203.0.113.1', '198.51.100.1', '192.0.2.1'
  ];

  return ips.slice(0, 5).map((ip, index) => {
    const packetPercent = Math.random() * (30 - index * 5) + (index === 0 ? 15 : 5);
    const packets = Math.floor((totalPackets * packetPercent) / 100);
    const bytes = Math.floor((totalBytes * packetPercent) / 100);
    
    return {
      ip,
      packets,
      bytes,
      percentage: Number(packetPercent.toFixed(1)),
    };
  });
}

function generateTopConversations(totalPackets: number): Conversation[] {
  const conversations = [
    { src: '192.168.1.100', dst: '8.8.8.8', protocol: 'DNS' },
    { src: '192.168.1.101', dst: '1.1.1.1', protocol: 'HTTPS' },
    { src: '192.168.1.100', dst: '172.217.14.142', protocol: 'HTTPS' },
    { src: '10.0.0.50', dst: '192.168.1.1', protocol: 'TCP' },
    { src: '192.168.1.101', dst: '151.101.193.140', protocol: 'HTTPS' },
  ];

  return conversations.map((conv, index) => {
    const packetPercent = Math.random() * (20 - index * 3) + 5;
    const packets = Math.floor((totalPackets * packetPercent) / 100);
    const bytes = Math.floor(packets * (Math.random() * 800 + 400));
    
    return {
      ...conv,
      packets,
      bytes,
    };
  });
}

function generateNetworkTopology(
  topTalkers: TopTalker[],
  topConversations: Conversation[],
  totalPackets: number,
  totalBytes: number,
  protocols: Record<string, number>
): NetworkTopology {
  // Generate nodes based on unique IPs from conversations and top talkers
  const uniqueIPs = new Set<string>();
  
  // Add IPs from top talkers
  topTalkers.forEach(talker => uniqueIPs.add(talker.ip));
  
  // Add IPs from conversations
  topConversations.forEach(conv => {
    uniqueIPs.add(conv.src);
    uniqueIPs.add(conv.dst);
  });

  // Add some additional realistic IPs for a more complete topology
  const additionalIPs = [
    '192.168.1.1', '192.168.1.2', '10.0.0.1', '172.16.1.1',
    '8.8.8.8', '1.1.1.1', '208.67.222.222', '9.9.9.9'
  ];
  additionalIPs.forEach(ip => uniqueIPs.add(ip));

  const nodes: NetworkNode[] = Array.from(uniqueIPs).map(ip => {
    const talker = topTalkers.find(t => t.ip === ip);
    const isInternal = isInternalIP(ip);
    const deviceType = determineDeviceType(ip, topConversations);
    const connections = topConversations.filter(c => c.src === ip || c.dst === ip).length;
    
    // Calculate node statistics
    const nodePackets = talker?.packets || Math.floor(Math.random() * 1000) + 100;
    const nodeBytes = talker?.bytes || Math.floor(nodePackets * (Math.random() * 800 + 400));
    
    // Determine node protocols based on conversations
    const nodeProtocols = getNodeProtocols(ip, topConversations);
    
    // Generate hostname for some internal devices
    const hostname = isInternal ? generateHostname(ip, deviceType) : undefined;
    
    return {
      id: ip,
      label: hostname || ip,
      ip,
      hostname,
      deviceType,
      packets: nodePackets,
      bytes: nodeBytes,
      connections,
      protocols: nodeProtocols,
      isInternal,
      firstSeen: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Random time in last hour
      lastSeen: new Date().toISOString(),
      // Visual properties will be set by the visualization component
      size: Math.max(10, Math.min(50, Math.log(nodePackets) * 5)),
      color: getNodeColor(deviceType, isInternal)
    };
  });

  // Generate edges based on conversations
  const edges: NetworkEdge[] = topConversations.map((conv, index) => {
    const quality = determineConnectionQuality(conv.packets, conv.bytes);
    const protocols = [conv.protocol];
    
    // Add additional protocols based on conversation characteristics
    if (conv.protocol === 'TCP') {
      if (Math.random() > 0.7) protocols.push('HTTPS');
      if (Math.random() > 0.8) protocols.push('SSH');
    }
    if (conv.protocol === 'UDP') {
      if (Math.random() > 0.6) protocols.push('DNS');
      if (Math.random() > 0.9) protocols.push('DHCP');
    }

    return {
      id: `${conv.src}-${conv.dst}-${index}`,
      from: conv.src,
      to: conv.dst,
      label: `${formatBytes(conv.bytes)}`,
      packets: conv.packets,
      bytes: conv.bytes,
      protocols,
      direction: 'bidirectional', // Most network connections are bidirectional
      quality,
      latency: Math.random() * 100 + 10, // 10-110ms
      // Visual properties
      width: Math.max(1, Math.min(8, Math.log(conv.packets) * 2)),
      color: getEdgeColor(quality),
      dashes: quality === 'poor'
    };
  });

  // Generate additional edges for more realistic topology
  const additionalEdges = generateAdditionalEdges(nodes, topConversations.length);
  edges.push(...additionalEdges);

  // Calculate topology statistics
  const statistics = calculateTopologyStatistics(nodes, edges, protocols);

  return {
    nodes,
    edges,
    statistics,
    segments: [],
    internalDevices: [],
    externalDevices: []
  };
}

function isInternalIP(ip: string): boolean {
  // RFC 1918 Private IP ranges:
  // 10.0.0.0/8 (10.0.0.0 to 10.255.255.255)
  // 172.16.0.0/12 (172.16.0.0 to 172.31.255.255) 
  // 192.168.0.0/16 (192.168.0.0 to 192.168.255.255)
  // Link-local: 169.254.0.0/16
  
  if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('169.254.')) {
    return true;
  }
  
  // Check 172.16.0.0/12 range (172.16.0.0 to 172.31.255.255)
  if (ip.startsWith('172.')) {
    const parts = ip.split('.');
    if (parts.length >= 2) {
      const secondOctet = parseInt(parts[1], 10);
      return secondOctet >= 16 && secondOctet <= 31;
    }
  }
  
  return false;
}

function determineDeviceType(ip: string, conversations: Conversation[]): NetworkNode['deviceType'] {
  // Gateway/Router detection
  if (ip.endsWith('.1') || ip.endsWith('.254')) {
    return 'gateway';
  }
  
  // DNS server detection
  if (['8.8.8.8', '1.1.1.1', '208.67.222.222', '9.9.9.9'].includes(ip)) {
    return 'dns';
  }
  
  // Server detection (high incoming connections)
  const incomingConnections = conversations.filter(c => c.dst === ip).length;
  const outgoingConnections = conversations.filter(c => c.src === ip).length;
  
  if (incomingConnections > outgoingConnections * 2) {
    return 'server';
  }
  
  // Router detection (high total connections)
  const totalConnections = incomingConnections + outgoingConnections;
  if (totalConnections > 5 && isInternalIP(ip)) {
    return 'router';
  }
  
  // Default to client for internal IPs, unknown for external
  return isInternalIP(ip) ? 'client' : 'unknown';
}

function getNodeProtocols(ip: string, conversations: Conversation[]): string[] {
  const protocols = new Set<string>();
  conversations.forEach(conv => {
    if (conv.src === ip || conv.dst === ip) {
      protocols.add(conv.protocol);
    }
  });
  return Array.from(protocols);
}

function generateHostname(ip: string, deviceType: NetworkNode['deviceType']): string | undefined {
  const lastOctet = ip.split('.').pop();
  
  switch (deviceType) {
    case 'gateway':
      return `gateway-${lastOctet}`;
    case 'router':
      return `router-${lastOctet}`;
    case 'server':
      return `server-${lastOctet}`;
    case 'client':
      return Math.random() > 0.5 ? `workstation-${lastOctet}` : undefined;
    default:
      return undefined;
  }
}

function getNodeColor(deviceType: NetworkNode['deviceType'], isInternal: boolean): string {
  if (!isInternal) {
    return '#94a3b8'; // Gray for external nodes
  }
  
  switch (deviceType) {
    case 'gateway':
      return '#ef4444'; // Red for gateways
    case 'router':
      return '#f97316'; // Orange for routers
    case 'server':
      return '#3b82f6'; // Blue for servers
    case 'dns':
      return '#8b5cf6'; // Purple for DNS
    case 'client':
      return '#10b981'; // Green for clients
    default:
      return '#6b7280'; // Gray for unknown
  }
}

function determineConnectionQuality(packets: number, bytes: number): NetworkEdge['quality'] {
  const avgPacketSize = bytes / packets;
  
  // Quality based on packet count and average packet size
  if (packets > 1000 && avgPacketSize > 500) {
    return 'excellent';
  } else if (packets > 500 && avgPacketSize > 300) {
    return 'good';
  } else if (packets > 100) {
    return 'fair';
  } else {
    return 'poor';
  }
}

function getEdgeColor(quality: NetworkEdge['quality']): string {
  switch (quality) {
    case 'excellent':
      return '#10b981'; // Green
    case 'good':
      return '#3b82f6'; // Blue
    case 'fair':
      return '#f59e0b'; // Yellow/Orange
    case 'poor':
      return '#ef4444'; // Red
    default:
      return '#6b7280'; // Gray
  }
}

function generateAdditionalEdges(nodes: NetworkNode[], existingEdgeCount: number): NetworkEdge[] {
  const edges: NetworkEdge[] = [];
  const internalNodes = nodes.filter(n => n.isInternal);
  const gatewayNodes = nodes.filter(n => n.deviceType === 'gateway');
  
  // Connect internal clients to gateways
  internalNodes.forEach(node => {
    if (node.deviceType === 'client' && gatewayNodes.length > 0) {
      const gateway = gatewayNodes[0];
      if (!edges.some(e => (e.from === node.id && e.to === gateway.id) || (e.from === gateway.id && e.to === node.id))) {
        edges.push({
          id: `${node.id}-${gateway.id}-additional`,
          from: node.id,
          to: gateway.id,
          packets: Math.floor(Math.random() * 500) + 50,
          bytes: Math.floor(Math.random() * 50000) + 5000,
          protocols: ['TCP', 'UDP'],
          direction: 'bidirectional',
          quality: 'good',
          latency: Math.random() * 50 + 5,
          width: 2,
          color: '#3b82f6'
        });
      }
    }
  });
  
  return edges;
}

function calculateTopologyStatistics(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  protocols: Record<string, number>
): TopologyStatistics {
  const internalNodes = nodes.filter(n => n.isInternal).length;
  const externalNodes = nodes.length - internalNodes;
  const totalTraffic = edges.reduce((sum, edge) => sum + edge.bytes, 0);
  
  // Calculate protocol distribution from edges
  const protocolDistribution: Record<string, number> = {};
  edges.forEach(edge => {
    edge.protocols.forEach(protocol => {
      protocolDistribution[protocol] = (protocolDistribution[protocol] || 0) + edge.bytes;
    });
  });
  
  // Generate network segments
  const networkSegments: NetworkSegment[] = [
    {
      subnet: '192.168.1.0/24',
      nodeCount: nodes.filter(n => n.ip.startsWith('192.168.1.')).length,
      trafficVolume: Math.floor(totalTraffic * 0.6)
    },
    {
      subnet: '10.0.0.0/24',
      nodeCount: nodes.filter(n => n.ip.startsWith('10.0.0.')).length,
      trafficVolume: Math.floor(totalTraffic * 0.3)
    },
    {
      subnet: '172.16.0.0/24',
      nodeCount: nodes.filter(n => n.ip.startsWith('172.16.')).length,
      trafficVolume: Math.floor(totalTraffic * 0.1)
    }
  ].filter(segment => segment.nodeCount > 0);

  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    internalNodes,
    externalNodes,
    totalTraffic,
    protocolDistribution,
    networkSegments
  };
}

export function generateTrafficFlow(
  topTalkers: TopTalker[],
  topConversations: Conversation[],
  totalPackets: number,
  totalBytes: number,
  protocols: Record<string, number>
): TrafficFlow {
  // Generate flow nodes based on unique IPs from conversations and top talkers
  const uniqueIPs = new Set<string>();
  
  // Add IPs from top talkers
  topTalkers.forEach(talker => uniqueIPs.add(talker.ip));
  
  // Add IPs from conversations
  topConversations.forEach(conv => {
    uniqueIPs.add(conv.src);
    uniqueIPs.add(conv.dst);
  });

  // Add some additional realistic IPs for a more complete flow
  const additionalIPs = [
    '192.168.1.1', '8.8.8.8', '1.1.1.1', '172.217.14.142', '151.101.193.140'
  ];
  additionalIPs.forEach(ip => uniqueIPs.add(ip));

  const flows: TrafficFlowNode[] = Array.from(uniqueIPs).map(ip => {
    const talker = topTalkers.find(t => t.ip === ip);
    const isInternal = isInternalIP(ip);
    const deviceType = determineDeviceType(ip, topConversations);
    
    // Calculate incoming/outgoing traffic
    const incomingConversations = topConversations.filter(c => c.dst === ip);
    const outgoingConversations = topConversations.filter(c => c.src === ip);
    
    const incomingBytes = incomingConversations.reduce((sum, c) => sum + c.bytes, 0);
    const outgoingBytes = outgoingConversations.reduce((sum, c) => sum + c.bytes, 0);
    const totalNodeBytes = talker?.bytes || Math.max(incomingBytes + outgoingBytes, Math.floor(Math.random() * 10000) + 1000);
    const totalNodePackets = talker?.packets || Math.floor(totalNodeBytes / 600);
    
    // Generate protocol breakdown
    const nodeProtocols = getNodeProtocols(ip, topConversations);
    const protocolBreakdown: Record<string, number> = {};
    nodeProtocols.forEach((protocol, index) => {
      const percentage = Math.random() * (50 - index * 10) + 10;
      protocolBreakdown[protocol.toLowerCase()] = Math.floor((totalNodeBytes * percentage) / 100);
    });
    
    // Generate hostname for some internal devices
    const hostname = isInternal ? generateHostname(ip, deviceType) : undefined;
    
    return {
      id: ip,
      name: hostname || ip,
      ip,
      hostname,
      type: isInternal ? 'internal' : 'external',
      deviceType,
      totalBytes: totalNodeBytes,
      totalPackets: totalNodePackets,
      incomingBytes: incomingBytes || Math.floor(totalNodeBytes * 0.4),
      outgoingBytes: outgoingBytes || Math.floor(totalNodeBytes * 0.6),
      protocolBreakdown
    };
  });

  // Generate flow links based on conversations
  const links: TrafficFlowLink[] = topConversations.map((conv, index) => {
    const quality = determineConnectionQuality(conv.packets, conv.bytes);
    const protocols = [conv.protocol];
    
    // Add additional protocols based on conversation characteristics
    if (conv.protocol === 'TCP') {
      if (Math.random() > 0.7) protocols.push('HTTPS');
      if (Math.random() > 0.8) protocols.push('SSH');
    }
    if (conv.protocol === 'UDP') {
      if (Math.random() > 0.6) protocols.push('DNS');
      if (Math.random() > 0.9) protocols.push('DHCP');
    }

    const bandwidth = (conv.bytes * 8) / 60; // bits per second assuming 1 minute
    const latency = Math.random() * 100 + 10; // 10-110ms

    return {
      id: `${conv.src}-${conv.dst}-${index}`,
      source: conv.src,
      target: conv.dst,
      bytes: conv.bytes,
      packets: conv.packets,
      protocols,
      direction: 'bidirectional',
      quality,
      latency,
      bandwidth
    };
  });

  // Add some additional links for more realistic flow
  const additionalLinks = generateAdditionalFlowLinks(flows);
  links.push(...additionalLinks);

  // Calculate flow statistics
  const statistics = calculateTrafficFlowStatistics(flows, links, protocols, totalBytes);

  return {
    flows,
    links,
    statistics
  };
}

function generateAdditionalFlowLinks(flows: TrafficFlowNode[]): TrafficFlowLink[] {
  const links: TrafficFlowLink[] = [];
  const internalFlows = flows.filter(f => f.type === 'internal');
  const gatewayFlows = flows.filter(f => f.deviceType === 'gateway');
  
  // Connect internal clients to gateways
  internalFlows.forEach((flow, index) => {
    if (flow.deviceType === 'client' && gatewayFlows.length > 0 && index < 3) {
      const gateway = gatewayFlows[0];
      const bytes = Math.floor(Math.random() * 5000) + 1000;
      const packets = Math.floor(bytes / 600);
      
      links.push({
        id: `${flow.id}-${gateway.id}-additional`,
        source: flow.id,
        target: gateway.id,
        bytes,
        packets,
        protocols: ['TCP', 'UDP'],
        direction: 'bidirectional',
        quality: 'good',
        latency: Math.random() * 20 + 5,
        bandwidth: (bytes * 8) / 60
      });
    }
  });
  
  return links;
}

function calculateTrafficFlowStatistics(
  flows: TrafficFlowNode[],
  links: TrafficFlowLink[],
  protocols: Record<string, number>,
  totalBytes: number
): TrafficFlowStatistics {
  const totalFlow = links.reduce((sum, link) => sum + link.bytes, 0);
  const bandwidths = links.map(link => link.bandwidth || 0);
  const peakBandwidth = Math.max(...bandwidths);
  const averageBandwidth = bandwidths.reduce((sum, bw) => sum + bw, 0) / bandwidths.length;

  // Calculate protocol statistics
  const protocolBytes: Record<string, number> = {};
  links.forEach(link => {
    link.protocols.forEach(protocol => {
      const protocolLower = protocol.toLowerCase();
      protocolBytes[protocolLower] = (protocolBytes[protocolLower] || 0) + (link.bytes / link.protocols.length);
    });
  });

  const topProtocols = Object.entries(protocolBytes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([protocol, bytes]) => ({
      protocol,
      bytes,
      percentage: Number(((bytes / totalFlow) * 100).toFixed(1))
    }));

  // Calculate top sources and destinations
  const sourceBytes: Record<string, number> = {};
  const destBytes: Record<string, number> = {};
  
  links.forEach(link => {
    sourceBytes[link.source] = (sourceBytes[link.source] || 0) + link.bytes;
    destBytes[link.target] = (destBytes[link.target] || 0) + link.bytes;
  });

  const topSources = Object.entries(sourceBytes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([ip, bytes]) => ({
      ip,
      bytes,
      percentage: Number(((bytes / totalFlow) * 100).toFixed(1))
    }));

  const topDestinations = Object.entries(destBytes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([ip, bytes]) => ({
      ip,
      bytes,
      percentage: Number(((bytes / totalFlow) * 100).toFixed(1))
    }));

  // Calculate internal vs external traffic
  const internalTraffic = links
    .filter(link => isInternalIP(link.source) && isInternalIP(link.target))
    .reduce((sum, link) => sum + link.bytes, 0);
  
  const externalTraffic = links
    .filter(link => !isInternalIP(link.source) || !isInternalIP(link.target))
    .reduce((sum, link) => sum + link.bytes, 0);

  const crossSegmentTraffic = links
    .filter(link => {
      const srcSegment = getSubnet(link.source);
      const dstSegment = getSubnet(link.target);
      return srcSegment !== dstSegment && isInternalIP(link.source) && isInternalIP(link.target);
    })
    .reduce((sum, link) => sum + link.bytes, 0);

  return {
    totalFlow,
    peakBandwidth,
    averageBandwidth,
    topProtocols,
    topSources,
    topDestinations,
    internalTraffic,
    externalTraffic,
    crossSegmentTraffic
  };
}

function getSubnet(ip: string): string {
  const parts = ip.split('.');
  if (parts.length >= 3) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  }
  return 'unknown';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
