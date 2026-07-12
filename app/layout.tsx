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
  title: 'Iron Oasis — Private 24/7 Gym in Windsor',
  description:
    'A private, 24/7 gym in Windsor. Book your session and train alone with high-end equipment — no crowds, no waiting.',
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
