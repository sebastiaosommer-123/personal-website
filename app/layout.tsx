import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Sebastião Sommer",
  description: "Founding Product Designer",
  icons: {
    icon: [
      { url: "/favicon-light.svg", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.svg", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} font-sans antialiased`}
        style={{
          fontFamily: "var(--font-geist), system-ui, sans-serif",
          backgroundColor: "var(--color-bg)",
        }}
      >
        <ThemeProvider>
          {children}
          <div className="fixed top-4 right-4 z-50" data-surf-ignore>
            <AnimatedThemeToggler className="text-[var(--color-fg)]" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
