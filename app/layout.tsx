import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Geist } from 'next/font/google';
import './globals.css';
import { SmoothScroll } from '@/components/SmoothScroll';
import { OverlayMenu } from '@/components/OverlayMenu';
import { Kinetic } from '@/components/Kinetic';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


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
    'Not a gym — a premium private space in a quiet Windsor residential setting. Park on the street, walk up, and the entire space is yours. Access Keys, premium equipment, zero sharing, 24/7 access.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(grotesk.variable, jetbrains.variable, "font-sans", geist.variable)}>
      <body className="bg-black text-white antialiased">
        <OverlayMenu />
        <Kinetic />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
