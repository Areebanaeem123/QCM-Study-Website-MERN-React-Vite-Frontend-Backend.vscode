"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SessionService, CreateSessionRequest } from "@/lib/session-service"
import { toast } from "sonner"
import { Plus, Loader2 } from "lucide-react"

interface CreateSessionDialogProps {
  onSuccess: () => void
}

export function CreateSessionDialog({ onSuccess }: CreateSessionDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [expiryDate, setExpiryDate] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !startDate || !expiryDate) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsLoading(true)
      const payload: CreateSessionRequest = {
        name,
        start_date: new Date(startDate).toISOString(),
        expiry_date: new Date(expiryDate).toISOString(),
        session_items: [] // Items can be added later via Edit
      }

      await SessionService.createSession(payload)
      toast.success("Session created successfully")
      setOpen(false)
      onSuccess()
      
      // Reset form
      setName("")
      setStartDate("")
      setExpiryDate("")
    } catch (error: any) {
      toast.error(error.message || "Failed to create session")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Session Name</Label>
            <Input
              id="name"
              placeholder="e.g. 2025-2026 Academic Year"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
