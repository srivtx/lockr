import type { Metadata } from "next";
import "./globals.css";
import WalletProvider from "./components/WalletProvider";

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
      <body className="min-h-screen bg-black text-white antialiased font-sans">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
