import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/lib/context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
/* import "react-day-picker/style.css"; */

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Rotina+",
  description: "Plataforma de Registro e Monitoramento Pessoal",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body  className={inter.className}>
        <ThemeProvider  attribute="class" defaultTheme="system" enableSystem>
          <AppProvider>{children}</AppProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

