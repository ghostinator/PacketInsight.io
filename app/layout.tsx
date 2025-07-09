
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
                <div class="container max-w-2xl mx-auto flex h-14 items-center justify-center text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span> © 2025 PacketInsight.io</span>
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
                  <div className="flex items-center space-x-2">
  <a
    href="https://github.com/ghostinator/PacketInsight.io"
    className="flex items-center hover:text-foreground transition-colors"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="View on GitHub"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="currentColor"
      viewBox="0 0 24 24"
      className="mr-1"
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.338 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
    </svg>
    <span>GitHub</span>
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
