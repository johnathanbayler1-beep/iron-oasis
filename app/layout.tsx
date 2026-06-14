import type { Metadata } from 'next';
import { Bebas_Neue, Space_Mono } from 'next/font/google';
import './globals.css';
import { SmoothScroll } from '@/components/SmoothScroll';
import { OverlayMenu } from '@/components/OverlayMenu';

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Iron Oasis — Private Space. Total Autonomy.',
  description:
    '1-of-1 private movement spaces with top-tier tools. No crowds. No wait. 24/7 access via Access Keys.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebas.variable} ${spaceMono.variable}`}>
      <body className="bg-black text-white antialiased">
        <OverlayMenu />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
