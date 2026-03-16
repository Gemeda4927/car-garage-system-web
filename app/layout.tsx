import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Premium Car Park & Services | Final Year Project",
  description:
    "A comprehensive car park management and service booking platform for the African elite. Final year project showcasing modern web development with Next.js.",
  keywords: [
    "car park", 
    "garage services", 
    "vehicle booking", 
    "African elite", 
    "final year project", 
    "Next.js", 
    "TypeScript",
    "premium car care"
  ],
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
  publisher: "Final Year Project",
  openGraph: {
    title: "Premium Car Park & Services Platform",
    description: "Final year project - A comprehensive car park management and service booking platform",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Car Park & Services",
    description: "Final year project - Car park management platform",
  },
  robots: "index, follow",
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
        <Footer />
      </body>
    </html>
  );
}