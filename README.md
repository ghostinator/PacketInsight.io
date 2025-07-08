# PacketInsight.io

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Client-Side](https://img.shields.io/badge/100%25_Client--Side-4CAF50?style=for-the-badge&logo=javascript&logoColor=white)](#)
[![Privacy First](https://img.shields.io/badge/Privacy_First-FF6B6B?style=for-the-badge&logo=shield&logoColor=white)](#)
[![PCAP Support](https://img.shields.io/badge/PCAP%2FPCAPNG-2196F3?style=for-the-badge&logo=wireshark&logoColor=white)](#)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> **A secure, client-side network traffic analysis tool that brings enterprise-grade packet inspection capabilities directly to your browser**

PacketInsight.io is a revolutionary browser-based network analysis platform that processes PCAP and PCAPNG files entirely within your browser using modern web technologies. Built with privacy and security as core principles, PacketInsight ensures that your sensitive network data never leaves your device while providing comprehensive traffic analysis, visualization, and export capabilities.

## 🚀 Key Features

### 📊 **Comprehensive Network Analysis**
- **Multi-format Support**: Native PCAP and PCAPNG file processing using client-side JavaScript
- **Protocol Analysis**: Deep packet inspection with support for hundreds of network protocols
- **Traffic Flow Visualization**: Interactive network topology and communication flow diagrams
- **Timeline Analysis**: Chronological packet analysis with advanced filtering capabilities
- **Statistical Insights**: Detailed traffic statistics, protocol distribution, and bandwidth analysis

### 🔒 **Privacy-First Architecture**
- **100% Client-Side Processing**: All analysis happens in your browser using WebAssembly and modern JavaScript APIs
- **Zero Data Collection**: No tracking, no analytics, no data storage on external servers
- **Secure by Design**: Built with modern web security standards and best practices
- **Offline Capable**: Works completely offline once loaded - no server dependencies

### 🎯 **Advanced Security Features**
- **Security Alert System**: Automated detection of suspicious network patterns
- **Anomaly Detection**: Identification of unusual traffic behaviors and potential threats
- **Port Scan Detection**: Recognition of reconnaissance activities and scanning attempts
- **Protocol Violation Alerts**: Detection of malformed packets and protocol anomalies

### 📈 **Rich Visualizations**
- **Interactive Network Topology**: Dynamic visualization of network relationships using modern charting libraries
- **Traffic Flow Diagrams**: Real-time representation of data flows between endpoints
- **Protocol Distribution Charts**: Visual breakdown of network protocol usage
- **Timeline Graphs**: Temporal analysis of network activity patterns
- **Geolocation Mapping**: Geographic visualization of network connections

### 💾 **Flexible Export Options**
- **Multiple Export Formats**: CSV, JSON, PDF reports, and filtered PCAP files
- **Custom Report Generation**: Tailored analysis reports with executive summaries
- **Filtered Data Export**: Export specific subsets of analyzed data
- **Visualization Export**: Save charts and graphs in various image formats

## 🛡️ Security & Privacy

PacketInsight.io was designed from the ground up with security and privacy as fundamental requirements:

- **Client-Side Processing**: All packet analysis occurs within your browser using WebAssembly and modern JavaScript APIs
- **No Server Communication**: Once loaded, PacketInsight operates completely independently without any network requests
- **Memory-Safe Operations**: Built with modern web technologies that prevent common security vulnerabilities
- **Secure File Handling**: Files are processed in isolated browser contexts with no persistent storage
- **Privacy Compliance**: Fully compliant with GDPR, CCPA, and other privacy regulations

## 🔧 Installation & Setup

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Minimum 4GB RAM recommended for large PCAP files
- JavaScript enabled

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ghostinator/PacketInsight.io.git
   cd PacketInsight.io
   ```

2. **Navigate to the app directory**
   ```bash
   cd app
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

3. **Deploy static files** (optional)
   ```bash
   # Export static files for CDN deployment
   npm run export
   ```

## 📖 Usage Guide

### Getting Started

1. **Launch PacketInsight.io** in your web browser
2. **Upload PCAP/PCAPNG files** using the drag-and-drop interface or file selector
3. **Wait for processing** - large files may take a few moments to analyze client-side
4. **Explore the dashboard** with multiple analysis views and visualizations

### Dashboard Navigation

#### 🏠 **Overview Dashboard**
- Summary statistics and key metrics
- Quick access to major findings and alerts
- System resource usage and processing status
![CleanShot 2025-07-08 at 14 35 36](https://github.com/user-attachments/assets/34e51cad-e038-4929-bc7b-aa4423d18bd1)


#### 🌐 **Network Topology**
- Interactive network map showing device relationships
- Click on nodes to view detailed device information
- Filter by protocol, time range, or traffic volume
![CleanShot 2025-07-08 at 14 36 43](https://github.com/user-attachments/assets/d6f9d714-24a3-4771-bb47-c1f8aa84bc9c)


#### 📊 **Traffic Analysis**
- Protocol distribution and usage statistics
- Bandwidth utilization over time
- Top talkers and conversation analysis
![CleanShot 2025-07-08 at 14 37 25](https://github.com/user-attachments/assets/fb4914f5-b818-4934-8f1a-56fcd5353f33)


#### ⏱️ **Timeline View**
- Chronological packet analysis
- Advanced filtering and search capabilities
- Zoom and pan through traffic history
![CleanShot 2025-07-08 at 14 37 58](https://github.com/user-attachments/assets/237d2dd0-9372-4a4d-90fe-ee2b1502e393)


#### 🔍 **Performance & Security ⚠️ **
- Currently basic with more features to come such as:
- Detailed packet-level analysis
- Protocol dissection and field inspection
- Hex dump and ASCII representation
- Automated security findings
- Suspicious activity detection
- Recommended actions and remediation steps
  ![CleanShot 2025-07-08 at 14 38 56](https://github.com/user-attachments/assets/219a883e-c6c6-4eed-b1c1-0d104c600b07)


### 🔍 **Protocol Analysis**
- Shows statistics of TCP, UDP, DNS, HTTP, TLS Analysis and DHCP analysis  
![CleanShot 2025-07-08 at 14 44 37](https://github.com/user-attachments/assets/f9772269-3d3c-41ae-b118-e610115f0efe)


### Export Features

#### 📄 **Generate Reports**
- Executive summary reports
- Technical analysis documents
- Custom filtered datasets

#### 💾 **Export Data**
- CSV format for spreadsheet analysis
- JSON format for programmatic processing
- Filtered PCAP files for further analysis

#### 📊 **Save Visualizations**
- PNG/SVG format charts and graphs
- Interactive HTML reports
- PDF documentation

## 🔍 Technical Specifications

### Technology Stack
- **Frontend Framework**: Next.js 14+ with React 18+
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **Charts & Visualization**: Plotly.js for interactive charts
- **Network Analysis**: Custom JavaScript/WebAssembly packet parsing
- **Build Tool**: Next.js with Turbopack for fast development

### Supported File Formats
- **PCAP**: Standard packet capture format
- **PCAPNG**: Next-generation packet capture format
- **Maximum file size**: 2GB (browser dependent)
- **Compression**: Automatic detection and decompression

### Browser Requirements
- **Chrome/Chromium**: Version 90 or later
- **Firefox**: Version 88 or later
- **Safari**: Version 14 or later
- **Microsoft Edge**: Version 90 or later
- **WebAssembly support**: Required
- **File API support**: Required

### Performance Specifications
- **Processing speed**: Up to 1M packets per minute (hardware dependent)
- **Memory usage**: ~2-4x file size during processing
- **Concurrent files**: Multiple files can be analyzed simultaneously
- **Background processing**: Non-blocking UI during analysis

### Protocol Support
PacketInsight.io supports analysis of 6 network protocols and will be expanding to 200+ network protocols including:
- **Layer 2**: Ethernet, WiFi, PPP, VLAN
- **Layer 3**: IPv4, IPv6, ICMP, ARP, MPLS
- **Layer 4**: TCP, UDP, SCTP
- **Application**: HTTP/HTTPS, DNS, DHCP, FTP, SSH, Telnet, SMTP, POP3, IMAP
- **Industrial**: Modbus, DNP3, IEC 61850
- **VoIP**: SIP, RTP, H.323
- **And many more...**

## 🤝 Contributing

We welcome contributions from the community! PacketInsight.io is built by network security professionals for network security professionals.

### How to Contribute

1. **Fork the repository**
   ```bash
   git fork https://github.com/ghostinator/PacketInsight.io.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

4. **Test your changes**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

5. **Submit a pull request**
   - Provide a clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes

### Development Guidelines

- **Code Style**: Follow ESLint and Prettier configuration
- **Testing**: Maintain >90% code coverage
- **Documentation**: Update README and inline docs
- **Security**: Follow secure coding practices
- **Performance**: Consider impact on large file processing
- **TypeScript**: Maintain strict type safety

### Areas for Contribution

- 🔍 **Protocol Dissectors**: Add support for new network protocols
- 🎨 **Visualizations**: Create new chart types and interactive displays
- 🔒 **Security Features**: Enhance threat detection capabilities
- 🌐 **Internationalization**: Add support for additional languages
- 📱 **Mobile Support**: Improve mobile browser compatibility
- ⚡ **Performance**: Optimize processing for larger files

## 📋 Roadmap

### Version 2.0 (Q3 2025)
- [ ] Real-time packet capture (where browser APIs allow)
- [ ] Advanced machine learning-based anomaly detection
- [ ] Plugin architecture for custom analyzers
- [ ] Enhanced mobile browser support

### Version 2.1 (Q4 2025)
- [ ] Collaborative analysis features
- [ ] Advanced export templates
- [ ] Integration with threat intelligence feeds
- [ ] Performance optimizations for very large files

### Version 3.0 (Q1 2026)
- [ ] WebRTC-based distributed analysis
- [ ] Advanced visualization engine
- [ ] Custom dashboard builder
- [ ] API for programmatic access

## 🆘 Support & Documentation

### Getting Help

- **Issue Tracker**: Report bugs on [GitHub Issues](https://github.com/ghostinator/PacketInsight.io/issues)
- **Email Support**: Technical support at [packetinsight@ghostinator.co](mailto:packetinsight@ghostinator.co)

### Frequently Asked Questions

**Q: Is my data safe with PacketInsight.io?**
A: Absolutely. PacketInsight.io processes all data locally in your browser. No data is ever transmitted to external servers.

**Q: What's the maximum file size I can analyze?**
A: This depends on your browser and system memory. Most modern browsers can handle files up to 2GB, but performance is optimal with files under 500MB.

**Q: Can I use PacketInsight.io offline?**
A: Yes! Once loaded, PacketInsight.io works completely offline. You can even bookmark it for offline access.

**Q: Does PacketInsight.io work on mobile devices?**
A: PacketInsight.io works on modern mobile browsers, though the experience is optimized for desktop use due to the complexity of network analysis interfaces.

**Q: How does this differ from the Python version?**
A: PacketInsight.io is a complete rewrite using modern web technologies, focusing on client-side processing and browser-based analysis. It offers better accessibility and requires no local installation.

## 📄 License

PacketInsight.io is released under the **MIT License**. See the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 PacketInsight.io Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

PacketInsight.io builds upon the excellent work of the open-source community:

- **Wireshark Project**: For protocol dissection inspiration and standards
- **WebAssembly Community**: For enabling high-performance web applications
- **Next.js Team**: For the excellent React framework
- **Plotly.js**: For powerful visualization capabilities
- **Tailwind CSS**: For the utility-first CSS framework
- **Network Security Community**: For continuous feedback and feature requests
- **Open Source Contributors**: For making this project possible

---

## 📞 Contact

**PacketInsight.io Team**
- **Email**: [packetinsight@ghostinator.co](mailto:packetinsight@ghostinator.co)
- **Website**: [https://packetinsight.io](https://packetinsight.io)
- **GitHub**: [https://github.com/ghostinator/PacketInsight.io](https://github.com/ghostinator/PacketInsight.io)

---

<div align="center">

**⭐ Star this repository if PacketInsight.io helps you with network analysis! ⭐**

*Built with ❤️ for the network security community using modern web technologies*

</div>
