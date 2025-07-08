

'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileType, AlertCircle, Shield, Lock, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePacketInsight } from '@/lib/context';
import { toast } from '@/hooks/use-toast';
import { clientPcapAnalyzer } from '@/lib/client-pcap-analyzer';

export function UploadView() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { setState, setAnalysis, setAnalysisId } = usePacketInsight();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    console.log('Files dropped:', acceptedFiles);
    console.log('Processing file:', file.name, file.size);

    // Validate file type
    if (!file.name.toLowerCase().match(/\.(pcap|pcapng)$/)) {
      setError('Invalid file type. Please upload a .pcap or .pcapng file.');
      toast({
        title: "Invalid File Type",
        description: "Please upload a .pcap or .pcapng file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 500MB - INCREASED from 100MB)
    if (file.size > 500 * 1024 * 1024) {
      setError('File too large. Maximum size is 500MB.');
      toast({
        title: "File Too Large",
        description: "Maximum file size is 500MB",
        variant: "destructive",
      });
      return;
    }

    setError(null);
    setIsProcessing(true);
    setProcessProgress(0);
    
    try {
      // Stage 1: Reading file
      setProcessingStage('Reading file...');
      setProcessProgress(10);
      
      // Stage 2: Parsing packets
      setProcessingStage('Parsing packets...');
      setProcessProgress(30);
      
      // Perform client-side analysis
      const analysisResult = await clientPcapAnalyzer.analyze(file);
      
      // Stage 3: Analyzing protocols
      setProcessingStage('Analyzing protocols...');
      setProcessProgress(60);
      
      // Stage 4: Generating insights
      setProcessingStage('Generating insights...');
      setProcessProgress(80);
      
      // Stage 5: Finalizing results
      setProcessingStage('Finalizing results...');
      setProcessProgress(90);

      // Store analysis results in browser storage for security (no server storage)
      try {
        localStorage.setItem(`analysis_${analysisResult.id}`, JSON.stringify(analysisResult));
        console.log('Analysis results stored securely in browser storage');
      } catch (storageError) {
        console.warn('LocalStorage full, using session storage:', storageError);
        sessionStorage.setItem(`analysis_${analysisResult.id}`, JSON.stringify(analysisResult));
      }

      // Stage 6: Complete
      setProcessProgress(100);
      setProcessingStage('Analysis complete!');
      
      // Update context with analysis results
      setAnalysisId(analysisResult.id);
      setAnalysis(analysisResult);
      setState('dashboard');

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${analysisResult.totalPackets} packets`,
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessProgress(0);
      setProcessingStage('');
    }
  }, [setState, setAnalysis, setAnalysisId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.pcap', '.pcapng'],
      'application/vnd.tcpdump.pcap': ['.pcap'],
    },
    multiple: false,
    disabled: isProcessing,
  });

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Processing PCAP File</h2>
            <p className="text-muted-foreground">{processingStage}</p>
          </div>

          <div className="space-y-2">
            <Progress value={processProgress} className="w-full" />
            <p className="text-sm text-muted-foreground">{processProgress}% complete</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Client-side processing</span>
            </div>
            <div className="flex items-center justify-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <Lock className="w-4 h-4 text-blue-500" />
              <span>Data stays local</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <FileType className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            PacketInsight
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            100% client-side processed advanced PCAP analysis and network diagnostics  
          </p>
        </div>

        {/* Upload Area */}
        <Card className="p-8">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 hover:bg-primary/5'}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            
            <h3 className="text-2xl font-semibold mb-2">
              {isDragActive ? 'Drop your PCAP file here' : 'Upload PCAP File'}
            </h3>
            
            <p className="text-muted-foreground mb-6">
              Drag and drop your .pcap or .pcapng file here, or click to browse
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge variant="outline">PCAP</Badge>
              <Badge variant="outline">PCAPNG</Badge>
              <Badge variant="outline">Max 500MB</Badge>
            </div>
            
            <Button size="lg" disabled={isProcessing}>
              <UploadCloud className="w-5 h-5 mr-2" />
              Choose File
            </Button>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure Processing</h3>
            <p className="text-sm text-muted-foreground">
              All analysis happens in your browser. Your data never leaves your device.
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Deep Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive protocol analysis, network topology, and security insights.
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
              <FileType className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Multiple Formats</h3>
            <p className="text-sm text-muted-foreground">
              Support for both classic PCAP and modern PCAPNG file formats.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

