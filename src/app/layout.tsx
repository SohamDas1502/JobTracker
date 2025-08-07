import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from '@/components/providers/NextAuthProvider'
import { UserProvider } from '@/contexts/UserContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobTracker - Track Your Job Applications",
  description: "Keep track of your job applications and internship opportunities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 dark:bg-gray-900`}>
        <NextAuthProvider>
          <UserProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </UserProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
