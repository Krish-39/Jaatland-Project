import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DemoBanner } from "@/components/demo-banner";
import { LegalBar } from "@/components/legal-bar";
import { StoreProvider } from "@/components/store-provider";
import { isShowcaseMode } from "@/db/url";
import { paymentsEnabled } from "@/lib/payments/stripe";
import { getHomepageConfig, getProducts } from "@/lib/data/catalog";
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
  "T-shirts, hoodies, joggers and accessories from Jaatland Clothing Co., designed for comfort and a clean, modern fit. Demo store.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jaatland — Clothing & Accessories",
    template: "%s | Jaatland",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Jaatland",
    title: "Jaatland — Clothing & Accessories",
    description: SITE_DESCRIPTION,
    images: ["/products/hero.jpg"],
  },
};

// Catalog pages are rendered ahead of time and refreshed when an admin saves
// a change (revalidatePath in the admin actions). The timer is a safety net.
export const revalidate = 300;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [products, homepageConfig] = await Promise.all([
    getProducts(),
    getHomepageConfig(),
  ]);
  const showcase = isShowcaseMode();
  const payments = !showcase && paymentsEnabled();

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
        <DemoBanner showcase={showcase} />
        <StoreProvider
          products={products}
          homepageConfig={homepageConfig}
          showcase={showcase}
          payments={payments}
        >
          <div id="main-content">{children}</div>
        </StoreProvider>
        <LegalBar />
      </body>
    </html>
  );
}
