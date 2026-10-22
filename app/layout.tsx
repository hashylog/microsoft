import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Microsoft",
  description:
    "Apresentação Microsoft Tech Camps 2026.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${hanken.variable} ${jetbrains.variable} antialiased`}>
      <link rel="icon" href="https://www.microsoft.com/favicon.ico?v2" type="image/x-icon"></link>
      <body>{children}</body>
    </html>
  );
}
