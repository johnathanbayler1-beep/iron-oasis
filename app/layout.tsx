import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SmoothScroll } from '@/components/SmoothScroll';
import { OverlayMenu } from '@/components/OverlayMenu';

// Premium sans stack. Variable name kept as --font-grotesk for compat with
// existing inline styles — all display type now renders Inter / -apple-system.
const grotesk = Inter({
  weight: ['400', '500', '600', '700', '800'],
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
  title: 'Iron Oasis — Your Private Space in Windsor',
  description:
    'A premium private space in a quiet Windsor residential setting. Park on the street, walk up, and the entire private space is yours. Access Keys, premium equipment, zero sharing, 24/7 access.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${jetbrains.variable}`}>
      <body className="bg-black text-white antialiased">
        <OverlayMenu />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
