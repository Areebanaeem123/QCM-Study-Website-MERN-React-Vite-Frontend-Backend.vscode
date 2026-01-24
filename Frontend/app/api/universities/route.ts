import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, getCurrentUser } from "@/lib/auth-helpers"
import { z } from "zod"

const universitySchema = z.object({
  name: z.string().min(1, "University name is required"),
  isDisplayed: z.boolean().default(true),
})

// GET - List all universities (admin only)
export async function GET(request: NextRequest) {
  try {
    const adminError = await requireAdmin()
    if (adminError) return adminError

    const universities = await prisma.university.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(universities)
  } catch (error) {
    console.error("Error fetching universities:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create a new university (admin only)
export async function POST(request: NextRequest) {
  try {
    const adminError = await requireAdmin()
    if (adminError) return adminError

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = universitySchema.parse(body)

    // Check if university already exists
    const existingUniversity = await prisma.university.findUnique({
      where: { name: validatedData.name }
    })

    if (existingUniversity) {
      return NextResponse.json(
        { error: "University with this name already exists" },
        { status: 400 }
      )
    }

    // Get user details for creator name
    const creator = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true }
    })

    const university = await prisma.university.create({
      data: {
        name: validatedData.name,
        isDisplayed: validatedData.isDisplayed,
        createdBy: user.id,
        creatorName: creator?.name || user.email || "Unknown",
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(
      { message: "University created successfully", university },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating university:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}



