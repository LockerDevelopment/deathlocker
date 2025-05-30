import type { Metadata } from "next";
import { SolanaProvider } from "@/components/SolanaProvider";
import Header from "@/components/ui/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeathLocker",
  description: "A secure vault for storing critical digital information—private keys, passwords, messages—accessible only after the user's death.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SolanaProvider>
          <Header />
          {children}
        </SolanaProvider>
      </body>
    </html>
  );
}
