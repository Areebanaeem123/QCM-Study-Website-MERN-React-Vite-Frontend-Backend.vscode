"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/context/AuthContext"
import { BasketProvider } from "@/lib/basket-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <BasketProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BasketProvider>
  )
}

