import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talento Humano CRM | Gestión Global",
  description: "Plataforma multiorganización para gestión de talento humano, nómina y cumplimiento legal.",
};

import { OrganizationProvider } from "@/contexts/OrganizationContext";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-gray-50/50 min-h-screen font-outfit antialiased">
        <OrganizationProvider>
          <main className="app-container">
            {children}
          </main>
        </OrganizationProvider>
      </body>
    </html>
  );
}
