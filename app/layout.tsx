import { Syne, Inter, JetBrains_Mono } from "next/font/google";
import { Metadata } from "next";
import { Providers } from "./providers";
import { organizationSchema } from "@/lib/structured-data";
import "@/app/globals.css";

// Display / body / metadata. These define the CSS vars the whole app already
// references (--font-syne, --font-grotesk, --font-jetbrains) but never loaded.
const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  // -face suffix: @theme owns the --font-syne token that generates `font-syne`.
  variable: "--font-syne-face",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Iron Oasis | Premium Private Fitness Experience",
  description: "Premium private fitness facility in Windsor with 24/7 access, zero sharing, and immersive 3D training experience. Join the elite community.",
  keywords: ["fitness", "gym", "private training", "Windsor", "24/7 fitness", "premium fitness"],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ironnedoasis.com",
    siteName: "Iron Oasis",
    title: "Iron Oasis | Premium Private Fitness Experience",
    description: "Premium private fitness facility in Windsor with 24/7 access, zero sharing, and immersive 3D training experience.",
    images: [
      {
        url: "https://ironnedoasis.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Iron Oasis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Iron Oasis | Premium Private Fitness Experience",
    description: "Premium private fitness facility in Windsor with 24/7 access and immersive training.",
    creator: "@ironoasis",
    images: ["https://ironnedoasis.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  alternates: {
    canonical: "https://ironnedoasis.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark bg-[#07080b] text-white ${syne.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema()),
          }}
        />
      </head>
      <body className="font-sans antialiased selection:bg-white selection:text-black">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
