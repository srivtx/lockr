import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import WalletProvider from "./components/WalletProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "LOCKR — Escrow for Indian Freelancers",
  description: "Fiat in. Trustless out. Milestone escrow powered by Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} min-h-screen bg-black text-white antialiased font-sans`}>
        <a
          href="https://dodopayments.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-1.5 text-[11px] font-medium tracking-wide uppercase bg-white/[0.02] border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors"
          style={{ color: '#C6FC1E' }}
        >
          Powered by Dodo Payments
        </a>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
