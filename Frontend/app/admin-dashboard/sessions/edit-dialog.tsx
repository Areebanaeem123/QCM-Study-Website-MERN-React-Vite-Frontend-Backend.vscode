"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SessionService, SessionResponse, UpdateSessionRequest, SessionItem } from "@/lib/session-service"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface EditSessionDialogProps {
  session: SessionResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditSessionDialog({ session, open, onOpenChange, onSuccess }: EditSessionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  
  // Future iteration: Actual Select components to fetch and link Packs, Mock Exams, and Question Banks
  const [items, setItems] = useState<SessionItem[]>([])

  useEffect(() => {
    if (session && open) {
      setName(session.name)
      // Format datetime strings to YYYY-MM-DD for date input
      setStartDate(new Date(session.start_date).toISOString().split('T')[0])
      setExpiryDate(new Date(session.expiry_date).toISOString().split('T')[0])
      setItems(session.session_items || [])
    }
  }, [session, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return
    
    if (!name || !startDate || !expiryDate) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsLoading(true)
      const payload: UpdateSessionRequest = {
        name,
        start_date: new Date(startDate).toISOString(),
        expiry_date: new Date(expiryDate).toISOString(),
        session_items: items
      }

      await SessionService.updateSession(session.id, payload)
      toast.success("Session updated successfully")
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || "Failed to update session")
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Session: {session.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Session Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Start Date</Label>
              <Input
                id="edit-startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expiryDate">Expiry Date</Label>
              <Input
                id="edit-expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Label>Linked Items ({items.length})</Label>
            <p className="text-sm text-muted-foreground mb-2">Item assignment UI pending...</p>
            {/* TODO: Add multi-select dropdowns for Packs, Mock Exams, and Question Banks */}
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
