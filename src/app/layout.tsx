import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/session-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { WebSocketProvider } from "@/components/providers/websocket-provider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Digital Billboard Marketplace",
  description:
    "Connect digital billboard owners with advertisers in South Africa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <WebSocketProvider>
            <div className="min-h-screen">{children}</div>
            <ToastProvider />
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
