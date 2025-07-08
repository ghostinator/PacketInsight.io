
'use client';

import { usePacketInsight } from '@/lib/context';
import { UploadView } from '@/components/upload-view';
import { ProcessingView } from '@/components/processing-view';
import { DashboardView } from '@/components/dashboard-view';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RotateCcw, FileType } from 'lucide-react';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function HomePageContent() {
  const { state, setState, analysis, setAnalysis, setAnalysisId } = usePacketInsight();
  const searchParams = useSearchParams();

  // Check for analysis parameter in URL and load the analysis from client-side storage
  useEffect(() => {
    const analysisParam = searchParams?.get('analysis');
    if (analysisParam && !analysis) {
      // Load the analysis data from client-side storage (localStorage/sessionStorage)
      console.log('Loading analysis from client-side storage for ID:', analysisParam);
      
      // Try localStorage first, then sessionStorage
      let analysisDataString = localStorage.getItem(`analysis_${analysisParam}`);
      if (!analysisDataString) {
        analysisDataString = sessionStorage.getItem(`analysis_${analysisParam}`);
      }
      
      if (analysisDataString) {
        try {
          const analysisData = JSON.parse(analysisDataString);
          console.log('Analysis data loaded successfully from client storage');
          setAnalysis(analysisData);
          setAnalysisId(analysisParam);
          setState('dashboard');
        } catch (error) {
          console.error('Error parsing analysis data:', error);
          setState('upload');
        }
      } else {
        console.log('Analysis data not found in client storage');
        setState('upload');
      }
    }
  }, [searchParams, analysis, setAnalysis, setAnalysisId, setState]);

  const showBackButton = state !== 'upload';

  return (
    <main className="min-h-screen">
      {/* Header with theme switcher */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FileType className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                PacketInsight.io
              </span>
            </div>
            {state === 'dashboard' && analysis?.filename && (
              <>
                <Separator orientation="vertical" className="h-6" />
                <span className="text-sm text-muted-foreground">
                  {analysis.filename}
                </span>
              </>
            )}
            {showBackButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState('upload')}
                className="ml-4"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {state === 'upload' && 'Upload PCAP File'}
              {state === 'processing' && 'Processing...'}
              {state === 'dashboard' && 'Analysis Results'}
            </span>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-0">
        {state === 'upload' && <UploadView />}
        {state === 'processing' && <ProcessingView />}
        {state === 'dashboard' && <DashboardView />}
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
