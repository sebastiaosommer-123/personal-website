import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Sebastião Sommer",
  description: "Founding Product Designer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} font-sans antialiased bg-white`}
        style={{ fontFamily: "var(--font-geist), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
