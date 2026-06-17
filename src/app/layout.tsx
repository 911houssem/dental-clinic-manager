import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal", // keep var name for backward compat
  display: "swap",
});

export const metadata: Metadata = {
  title: "عيادة - نظام إدارة العيادات",
  description: "نظام متكامل لإدارة العيادات والمواعيد والمرضى والفواتير",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "عيادة - نظام إدارة العيادات",
    description: "نظام متكامل لإدارة العيادات والمواعيد والمرضى والفواتير",
    type: "website",
    locale: "ar_SA",
    siteName: "عيادة",
  },
  twitter: {
    card: "summary_large_image",
    title: "عيادة - نظام إدارة العيادات",
    description: "نظام متكامل لإدارة العيادات والمواعيد والمرضى والفواتير",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className={`${cairo.variable} antialiased bg-background text-foreground font-sans`}>
        {children}
      </body>
    </html>
  );
}
