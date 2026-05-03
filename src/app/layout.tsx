import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TallerTec | TecNM Campus Matehuala",
  description: "Sistema Integral de Gestión de Talleres Deportivos y Culturales del Instituto Tecnológico de Matehuala.",
  keywords: ["talleres", "deportes", "cultura", "TecNM", "Matehuala", "constancias"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
