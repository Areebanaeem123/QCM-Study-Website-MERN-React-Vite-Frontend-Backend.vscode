"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SessionService, CreateSessionRequest, SessionItem } from "@/lib/session-service"
import { DashboardService, StorePack, StoreMockExam, StoreQuestionBank } from "@/lib/dashboard-service"
import { toast } from "sonner"
import { Plus, Loader2, Package, Play, Book } from "lucide-react"
import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

interface CreateSessionDialogProps {
  onSuccess: () => void
}

export function CreateSessionDialog({ onSuccess }: CreateSessionDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  
  const [items, setItems] = useState<SessionItem[]>([])
  const [availablePacks, setAvailablePacks] = useState<StorePack[]>([])
  const [availableExams, setAvailableExams] = useState<StoreMockExam[]>([])
  const [availableBanks, setAvailableBanks] = useState<StoreQuestionBank[]>([])

  useEffect(() => {
    if (open) {
      loadAvailableItems()
    }
  }, [open])

  const loadAvailableItems = async () => {
    try {
      const [packs, exams, banks] = await Promise.all([
        DashboardService.getAvailablePacks(),
        DashboardService.getAvailableMockExams(),
        DashboardService.getAvailableQuestionBanks()
      ])
      setAvailablePacks(packs)
      setAvailableExams(exams)
      setAvailableBanks(banks)
    } catch (err) {
      console.error("Failed to load available items", err)
    }
  }

  const toggleItem = (type: 'pack_id' | 'mock_exam_id' | 'question_bank_id', id: string) => {
    setItems(prev => {
      const exists = prev.some(item => item[type] === id)
      if (exists) {
        return prev.filter(item => item[type] !== id)
      } else {
        return [...prev, { [type]: id }]
      }
    })
  }

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
        session_items: items
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
          
          <div className="pt-2 border-t">
            <Label className="text-base font-semibold">Assign Items ({items.length})</Label>
            
            <Tabs defaultValue="packs" className="mt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="packs" className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" /> Packs
                </TabsTrigger>
                <TabsTrigger value="exams" className="flex items-center gap-1">
                  <Play className="h-3.5 w-3.5" /> Exams
                </TabsTrigger>
                <TabsTrigger value="banks" className="flex items-center gap-1">
                  <Book className="h-3.5 w-3.5" /> Banks
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-2 border rounded-md p-1">
                <TabsContent value="packs" className="m-0">
                  <ScrollArea className="h-[150px] p-2">
                    {availablePacks.length === 0 ? (
                      <p className="text-sm text-center text-muted-foreground py-4">No packs available</p>
                    ) : (
                      <div className="space-y-2">
                        {availablePacks.map(pack => (
                          <div key={pack.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`pack-${pack.id}`} 
                              checked={items.some(i => i.pack_id === pack.id)}
                              onCheckedChange={() => toggleItem('pack_id', pack.id)}
                            />
                            <Label htmlFor={`pack-${pack.id}`} className="text-sm cursor-pointer truncate">
                              {pack.title}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="exams" className="m-0">
                  <ScrollArea className="h-[150px] p-2">
                    {availableExams.length === 0 ? (
                      <p className="text-sm text-center text-muted-foreground py-4">No exams available</p>
                    ) : (
                      <div className="space-y-2">
                        {availableExams.map(exam => (
                          <div key={exam.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`exam-${exam.id}`} 
                              checked={items.some(i => i.pack_id === exam.id)}
                              onCheckedChange={() => toggleItem('pack_id', exam.id)}
                            />
                            <Label htmlFor={`exam-${exam.id}`} className="text-sm cursor-pointer truncate">
                              {exam.title}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="banks" className="m-0">
                  <ScrollArea className="h-[150px] p-2">
                    {availableBanks.length === 0 ? (
                      <p className="text-sm text-center text-muted-foreground py-4">No banks available</p>
                    ) : (
                      <div className="space-y-2">
                        {availableBanks.map(bank => (
                          <div key={bank.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`bank-${bank.id}`} 
                              checked={items.some(i => i.question_bank_id === bank.id)}
                              onCheckedChange={() => toggleItem('question_bank_id', bank.id)}
                            />
                            <Label htmlFor={`bank-${bank.id}`} className="text-sm cursor-pointer truncate">
                              {bank.title}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
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
