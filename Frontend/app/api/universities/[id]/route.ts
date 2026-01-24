import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, getCurrentUser } from "@/lib/auth-helpers"
import { z } from "zod"

const updateUniversitySchema = z.object({
  name: z.string().min(1, "University name is required").optional(),
  isDisplayed: z.boolean().optional(),
})

// GET - Get a single university (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin()
    if (adminError) return adminError

    const { id } = await params
    const university = await prisma.university.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })

    if (!university) {
      return NextResponse.json(
        { error: "University not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(university)
  } catch (error) {
    console.error("Error fetching university:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update a university (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin()
    if (adminError) return adminError

    const { id } = await params
    const body = await request.json()
    const validatedData = updateUniversitySchema.parse(body)

    // Check if university exists
    const existingUniversity = await prisma.university.findUnique({
      where: { id }
    })

    if (!existingUniversity) {
      return NextResponse.json(
        { error: "University not found" },
        { status: 404 }
      )
    }

    // If name is being updated, check for duplicates
    if (validatedData.name && validatedData.name !== existingUniversity.name) {
      const duplicateUniversity = await prisma.university.findUnique({
        where: { name: validatedData.name }
      })

      if (duplicateUniversity) {
        return NextResponse.json(
          { error: "University with this name already exists" },
          { status: 400 }
        )
      }
    }

    const university = await prisma.university.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.isDisplayed !== undefined && { isDisplayed: validatedData.isDisplayed }),
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
      { message: "University updated successfully", university }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating university:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a university (admin only)
// This will cascade delete all related records due to Prisma schema
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminError = await requireAdmin()
    if (adminError) return adminError

    const { id } = await params
    // Check if university exists
    const existingUniversity = await prisma.university.findUnique({
      where: { id }
    })

    if (!existingUniversity) {
      return NextResponse.json(
        { error: "University not found" },
        { status: 404 }
      )
    }

    // Delete university (cascade delete will handle related records)
    await prisma.university.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: "University deleted successfully" }
    )
  } catch (error) {
    console.error("Error deleting university:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

