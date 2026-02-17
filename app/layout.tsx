import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Premium Garaging for the African Elite",
  description:
    "World-class car park and services for the African elite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-white text-gray-900 min-h-screen flex flex-col`}
      >
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 pt-20 min-h-screen w-full flex items-center justify-center">
          <div className="w-full px-6">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-gray-200 bg-white/90 backdrop-blur-md py-10 mt-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-gray-500">
            <p>
              © {new Date().getFullYear()}{" "}
              EliteVault. All rights reserved.
            </p>
            <p className="mt-2">
              Designed with ❤️ for a premium
              African garaging experience
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
