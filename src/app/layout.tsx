import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DemoBanner } from "@/components/demo-banner";
import { LegalBar } from "@/components/legal-bar";
import { StoreProvider } from "@/components/store-provider";
import { SITE_URL } from "@/lib/legal-config";
import "./globals.css";

const THEME_SCRIPT = `try {
  if (localStorage.getItem("jaatland_theme") === "dark") {
    document.documentElement.classList.add("dark");
  }
} catch {}`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_DESCRIPTION =
  "Everyday basics and statement pieces built for comfort. Tees, hoodies, joggers and accessories from Jaatland Clothing Co. Demo store.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jaatland — Premium Clothing Co.",
    template: "%s | Jaatland",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Jaatland",
    title: "Jaatland — Premium Clothing Co.",
    description: SITE_DESCRIPTION,
    images: ["/products/hero.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900 focus:shadow-lg"
        >
          Skip to content
        </a>
        <DemoBanner />
        <StoreProvider>
          <div id="main-content">{children}</div>
        </StoreProvider>
        <LegalBar />
      </body>
    </html>
  );
}
