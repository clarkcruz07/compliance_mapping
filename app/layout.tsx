import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const displayFont = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Compliance Mapping Tool",
  description: "AI-assisted compliance mapping for Units of Competency and assessment tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {`try {
            const storedTheme = window.localStorage.getItem('compliance-theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const useDark = storedTheme ? storedTheme === 'dark' : prefersDark;
            document.documentElement.classList.toggle('dark', useDark);
          } catch (error) {
            document.documentElement.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
          }`}
        </Script>
        {children}
      </body>
    </html>
  );
}
