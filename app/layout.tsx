import { Syne, Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
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

export const metadata = {
  title: "Iron Oasis | Private Access",
  description: "A private space in Windsor. Zero sharing, 24/7 access.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark bg-[#050505] text-white ${syne.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="font-sans antialiased selection:bg-white selection:text-black">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
