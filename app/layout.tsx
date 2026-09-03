import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/lib/providers";
import "./globals.css";

// Peso geométrico e denso — o mesmo papel que "Cera Pro" cumpre na
// referência de estilo (headlines em 700, tracking negativo).
const displayFont = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "AreaVon",
    template: "%s · AreaVon",
  },
  description:
    "Prospecção comercial determinística: encontre empresas sem website identificado nas fontes públicas e priorize leads com um Lead Score transparente.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${displayFont.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
