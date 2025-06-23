"use client"

import Dashboard from "@/components/dashboard"
import { AuthGuard } from "@/components/auth-guard"

export function DashboardWrapper() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  )
}
