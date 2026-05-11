import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import WalletProvider from "./components/WalletProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "LOCKR — Escrow for Indian Freelancers",
  description: "Fiat in. Trustless out. Milestone escrow powered by Solana.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} min-h-screen bg-black text-white antialiased font-sans`}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
