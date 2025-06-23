"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"
import { AppProvider } from "@/lib/context"
import { ThemeProvider } from "@/components/theme-provider"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AppProvider>{children}</AppProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
