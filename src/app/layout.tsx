import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Auth from "./_lib/auth";
import Headers from "./_component/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yet Another Url Shortener V2",
  description: "This guy is learning Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen items-center">
        <Auth>
          <Headers />
          <main className={inter.className}>{children}</main>
        </Auth>
      </body>
    </html>
  );
}
