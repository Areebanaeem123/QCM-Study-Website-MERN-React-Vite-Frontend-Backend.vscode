"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Upload, Loader2, X } from "lucide-react"

interface ImageUploadProps {
  onImageUrlChange: (url: string) => void
  currentImageUrl?: string
  maxSize?: number // in MB
  allowedFormats?: string[]
}

export function ImageUpload({
  onImageUrlChange,
  currentImageUrl = "",
  maxSize = 5,
  allowedFormats = ["jpg", "jpeg", "png", "gif", "webp"],
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState(currentImageUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError("")

    // Validate file type
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
      setError(`Invalid file format. Allowed formats: ${allowedFormats.join(", ")}`)
      return
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      setError(`File size exceeds ${maxSize}MB limit`)
      return
    }

    try {
      setUploading(true)
      setError("")

      // Create FormData for upload
      const formData = new FormData()
      formData.append("file", file)

      // Upload to backend
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000/api/v1"
      const response = await fetch(`${apiBaseUrl}/upload/image`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Upload failed")
      }

      const data = await response.json()

      // Set preview and callback with the URL
      const imageUrl = data.url
      setPreview(imageUrl)
      onImageUrlChange(imageUrl)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image")
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview("")
    onImageUrlChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-3">
      <Label>Image Upload</Label>

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedFormats.map((f) => `.${f}`).join(",")}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!uploading && <Upload className="h-4 w-4" />}
          <span>{uploading ? "Uploading..." : "Choose Image"}</span>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="h-32 w-32 rounded-lg border border-gray-200 object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute right-0 top-0 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="mt-2 text-sm text-muted-foreground">
            {preview === currentImageUrl ? "Current image" : "New image preview"}
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Max file size: {maxSize}MB • Formats: {allowedFormats.join(", ").toUpperCase()}
      </p>
    </div>
  )
}
