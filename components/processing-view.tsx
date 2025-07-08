
'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Loader2, Network, Shield, BarChart3, Search } from 'lucide-react';
import { usePacketInsight } from '@/lib/context';

const analysisStages = [
  { id: 'parsing', name: 'Parsing Packets', icon: Search, description: 'Reading and parsing PCAP file structure' },
  { id: 'protocols', name: 'Protocol Analysis', icon: Network, description: 'Analyzing TCP, UDP, DNS, HTTP, TLS, DHCP protocols' },
  { id: 'performance', name: 'Performance Metrics', icon: BarChart3, description: 'Calculating retransmissions, jitter, response times' },
  { id: 'security', name: 'Security Analysis', icon: Shield, description: 'Detecting anomalies and security issues' },
];

export function ProcessingView() {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const { uploadProgress } = usePacketInsight();

  useEffect(() => {
    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 800);

    // Advance stages
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < analysisStages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(stageInterval);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="p-8 gradient-card border-border/50 animate-fade-in">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse"></div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Analyzing Your PCAP File
            </h2>
            <p className="text-muted-foreground">
              Please wait while we perform comprehensive network analysis
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground font-medium">Overall Progress</span>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-4">
              {analysisStages.map((stage, index) => {
                const Icon = stage.icon;
                const isActive = index === currentStage;
                const isCompleted = index < currentStage;
                
                return (
                  <div 
                    key={stage.id}
                    className={`
                      flex items-center space-x-4 p-4 rounded-lg border transition-all duration-500
                      ${isActive 
                        ? 'bg-primary/10 border-primary/30' 
                        : isCompleted
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-muted/30 border-border/30'
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-colors
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        isActive ? 'text-primary' : isCompleted ? 'text-green-400' : 'text-foreground'
                      }`}>
                        {stage.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {stage.description}
                      </p>
                    </div>
                    
                    {isActive && (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    )}
                    {isCompleted && (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                This may take a few moments depending on file size
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
