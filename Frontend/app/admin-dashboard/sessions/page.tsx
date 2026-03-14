"use client"

import { useEffect, useState } from "react"
import { Plus, Loader2, Edit, Trash2 } from "lucide-react"
import { SessionService, SessionResponse } from "@/lib/session-service"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CreateSessionDialog } from "./create-dialog"
import { EditSessionDialog } from "./edit-dialog"

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [editSession, setEditSession] = useState<SessionResponse | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      const data = await SessionService.getSessions()
      setSessions(data)
    } catch (error: any) {
      toast.error(error.message || "Échec du chargement des sessions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la session "${name}" ?`)) {
      try {
        await SessionService.deleteSession(id)
        toast.success("Session supprimée avec succès")
        loadSessions()
      } catch (error: any) {
        toast.error(error.message || "Échec de la suppression de la session")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground">
            Gérez les sessions d'accès pour les packs, les examens blancs et les banques de questions.
          </p>
        </div>
        <CreateSessionDialog onSuccess={loadSessions} />
      </div>

      <div className="rounded-md border bg-card">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-medium">Aucune session trouvée</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Créez une session pour commencer à regrouper vos éléments.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Nom</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Date de Début</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Date d'Expiration</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Éléments</th>
                  <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{session.name}</td>
                    <td className="p-4 align-middle">{new Date(session.start_date).toLocaleDateString()}</td>
                    <td className="p-4 align-middle">{new Date(session.expiry_date).toLocaleDateString()}</td>
                    <td className="p-4 align-middle">
                      {session.session_items?.length || 0} éléments
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => { setEditSession(session); setIsEditDialogOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(session.id, session.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <EditSessionDialog 
        session={editSession} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        onSuccess={loadSessions} 
      />
    </div>
  )
}
