import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { config } from "@/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: config.app.name,
  description: config.app.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div suppressHydrationWarning>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
