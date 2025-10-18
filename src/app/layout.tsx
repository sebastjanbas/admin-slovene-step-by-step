/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Manrope } from "next/font/google";

export const metadata: Metadata = {
  title: "Admin | Slovenščina Korak za Korakom",
  description: "Admin panel for Slovenščina Korak za Korakom",
};

const manropeFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const interFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-manrope font-medium">{children}</body>
      </html>
    </ClerkProvider>
  );
}
