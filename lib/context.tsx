
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { AppContext, AppState, AnalysisResult, UploadProgress } from './types';

const PacketInsightContext = createContext<AppContext | undefined>(undefined);

export function PacketInsightProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>('upload');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  return (
    <PacketInsightContext.Provider
      value={{
        state,
        setState,
        analysis,
        setAnalysis,
        uploadProgress,
        setUploadProgress,
        analysisId,
        setAnalysisId,
      }}
    >
      {children}
    </PacketInsightContext.Provider>
  );
}

export function usePacketInsight() {
  const context = useContext(PacketInsightContext);
  if (context === undefined) {
    throw new Error('usePacketInsight must be used within a PacketInsightProvider');
  }
  return context;
}
