import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AppProvider } from "../components/providers";

export const metadata: Metadata = {
  title: {
    default: "Wagely — no thekedaar can ghost you",
    template: "%s · Wagely",
  },
  description:
    "Wagely locks a daily-wage worker's full wage in escrow before the job starts, and keeps every step from posted to released visible to both sides.",
};

export const viewport = {
  themeColor: "#141a22",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Loaded over the network so the build never depends on font fetching;
            the stack falls back to system sans if it can't reach Google. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <AppProvider>
          <Header />
          {children}
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
