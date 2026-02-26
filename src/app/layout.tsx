import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutContent } from "@/components/LayoutContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SSF Division Attendance",
  description: "Admin Portal for SSF Pulikkal Division",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#f8fafc] text-[#0f172a] antialiased`}>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
