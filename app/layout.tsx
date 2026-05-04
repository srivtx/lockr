import type { Metadata } from "next";
import "./globals.css";
import WalletProvider from "./components/WalletProvider";

export const metadata: Metadata = {
  title: "LOCKR — Milestone Escrow for Indian Freelancers",
  description: "Fiat In, Trustless Out. Milestone-based escrow powered by Solana and Dodo Payments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
