import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export const ADMIN_RANK = 6
export const STUDENT_RANK = 1

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  
  return null
}

export async function requireAdmin() {
  const authError = await requireAuth()
  if (authError) return authError

  const user = await getCurrentUser()
  
  if (!user || user.rank !== ADMIN_RANK) {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    )
  }
  
  return null
}

