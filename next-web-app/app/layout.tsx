import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationBanner from "./customComponents/NotificationBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InspectEase",
  description: "Fillout inspection plans with you voice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="p-4 max-w-[1200px] m-auto">
          <NotificationProvider>
            <Link href="/">Back to Home</Link>
            <NotificationBanner />

            {children}
          </NotificationProvider>
        </div>
      </body>
    </html>
  );
}
