import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/session-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { WebSocketProvider } from "@/components/providers/websocket-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  fallback: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Digital Billboard Marketplace",
  description:
    "Connect digital billboard owners with advertisers in South Africa",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${dmSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <QueryProvider>
            <WebSocketProvider>
              <div className="min-h-screen">{children}</div>
              <ToastProvider />
            </WebSocketProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
