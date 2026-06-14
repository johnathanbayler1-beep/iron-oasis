import type { Metadata } from 'next';
import { Bebas_Neue, Space_Mono } from 'next/font/google';
import './globals.css';
import { SplashIntro } from '../components/SplashIntro';
import { Nav } from '../components/Nav';
import { SmoothScroll } from '../components/SmoothScroll';

const bebasNeue = Bebas_Neue({
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${spaceMono.variable}`}>
      <body className="antialiased overflow-x-hidden">
        <SplashIntro />
        <Nav />
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}