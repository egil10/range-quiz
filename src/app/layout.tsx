import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Range Quiz — metric intuition, gamified",
  description:
    "Train your gut for P/E, HHI, lab values, constants, engineering ratios, and thousands of ranges across finance, science, medicine, and more.",
  openGraph: {
    title: "Range Quiz",
    description: "A fast, gamified range quiz for metrics, multiples, and orders of magnitude.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-dvh font-sans antialiased`}>
        <div className="pointer-events-none fixed inset-0 mesh-noise opacity-[0.55]" />
        {children}
      </body>
    </html>
  );
}
