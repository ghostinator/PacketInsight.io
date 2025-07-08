
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PacketInsightProvider } from '@/lib/context';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PacketInsight.io',
  description: 'Advanced PCAP analysis and network diagnostics in your browser',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <PacketInsightProvider>
            <div className="min-h-screen bg-background flex flex-col">
              <div className="flex-1">
                {children}
              </div>
              <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span>© 2025 PacketInsight.io</span>
                    <span>•</span>
                    <span>100% Client-side PCAP analysis</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>Contact: Brandon Cook</span>
                    <span>•</span>
                    <a 
                      href="mailto:packetinsight@ghostinator.co" 
                      className="hover:text-foreground transition-colors"
                    >
                      packetinsight@ghostinator.co
                    </a>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>Github</span>
                    <span>:</span>
                    <a 
                      href="https://github.com/ghostinator/PacketInsight.io" 
                      className="hover:text-foreground transition-colors"
                    >
                     github.com/ghostinator/PacketInsight.io
                    </a>
                  </div>
                </div>
              </footer>
            </div>
            <Toaster />
          </PacketInsightProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
