import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SmoothScroll } from '@/components/SmoothScroll';
import { OverlayMenu } from '@/components/OverlayMenu';
import { AgentStormWidget } from '@/components/AgentStormWidget';

const grotesk = Space_Grotesk({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-grotesk',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Iron Oasis — Private Space. Total Autonomy.',
  description:
    '1-of-1 private movement spaces in a high-end premium environment. No crowds. No wait. 24/7 access via Access Keys.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${jetbrains.variable}`}>
      <body className="bg-black text-white antialiased">
        <OverlayMenu />
        <SmoothScroll>{children}</SmoothScroll>
        <AgentStormWidget />
      </body>
    </html>
  );
}
