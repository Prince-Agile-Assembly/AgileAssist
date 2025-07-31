import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Lumina Spark',
  description: 'A multilingual, voice-controlled academic assistant for teachers.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <script src="https://js.puter.com/v2/" async></script>
      </head>
      <body className="font-body antialiased">
        <ThemeProvider defaultTheme="system" storageKey="lumina-theme">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
