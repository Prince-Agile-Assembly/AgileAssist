"use client";

import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Lumina Spark</title>
        <meta name="description" content="A multilingual, voice-controlled academic assistant for teachers." />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <Script
          src="https://js.puter.com/v2/"
          strategy="beforeInteractive"
          onLoad={() => {
            window.dispatchEvent(new Event('puter-loaded'));
          }}
        />
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
