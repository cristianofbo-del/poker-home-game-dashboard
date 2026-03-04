import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Poker Home Game — Dashboard",
  description: "Análise de desempenho por sessão — Cash Game 1/2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} font-sans bg-surface text-gray-100 antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
