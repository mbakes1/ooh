import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/session-provider";
import { Header, Footer } from "@/components/navigation";
import { ToastProvider } from "@/components/ui/toast-provider";
import { WebSocketProvider } from "@/components/providers/websocket-provider";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          <WebSocketProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <ToastProvider />
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
