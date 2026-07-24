import { Providers } from "./providers";
import "@/app/globals.css";

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
    <html lang="en" className="dark bg-[#050505] text-white">
      <body className="font-syne antialiased selection:bg-white selection:text-black">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
