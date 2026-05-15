import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://quadrembranco.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "quadrembranco — cole qualquer coisa",
    template: "%s · quadrembranco",
  },
  description:
    "Vídeo, link, YouTube, imagem, texto. Um quadro em branco visual que vai além do Instagram.",
  keywords: [
    "feed visual",
    "rede social",
    "quadro em branco",
    "compartilhar vídeo",
    "youtube embed",
    "alternativa instagram",
    "mood board",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "quadrembranco — cole qualquer coisa",
    description: "Cole qualquer coisa. O feed visual sem fronteiras.",
    url: SITE_URL,
    siteName: "quadrembranco",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "quadrembranco",
    description: "Cole qualquer coisa. O feed visual sem fronteiras.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
