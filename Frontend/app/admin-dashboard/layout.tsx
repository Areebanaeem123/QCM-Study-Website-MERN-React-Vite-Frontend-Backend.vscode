"use client"

import type React from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/30" suppressHydrationWarning>
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-end border-b border-border bg-background px-4 md:px-6" suppressHydrationWarning>
          <div className="flex items-center gap-3">
            <span className="font-medium" suppressHydrationWarning>Admin Erick</span>
            <img src="/student-avatar.png" alt="Admin Avatar" className="h-8 w-8 rounded-full" />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
