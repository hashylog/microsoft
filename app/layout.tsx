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
  title: "Microsoft, em quatro cores",
  description:
    "Wireframe interativo de um projeto acadêmico sobre a Microsoft. Sem vínculo ou afiliação oficial com a empresa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${hanken.variable} ${jetbrains.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
