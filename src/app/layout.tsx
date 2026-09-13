import type { Metadata, Viewport } from "next";
import { Cinzel, Montserrat } from "next/font/google";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Olivapel | Orçamentos",
  description: "Ferramenta interna para representantes montarem orçamentos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Olivapel",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#2E3526",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${montserrat.variable}`}>
      <body className="font-sans antialiased">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
