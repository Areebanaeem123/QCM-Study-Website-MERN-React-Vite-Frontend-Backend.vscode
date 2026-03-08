"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, ShieldAlert, PackagePlus, Trash2, Calendar, MapPin, Phone, Hash, Monitor, Shield } from "lucide-react"
import { AdminService, UserDetail } from "@/lib/admin-service"
import { toast } from "sonner"

const ROLE_NAMES: Record<number, string> = {
  1: "Student",
  2: "Writer",
  3: "Content Manager",
  6: "Admin",
}

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<UserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Dialog States
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  
  // Pack Dialog States
  const [packDialogOpen, setPackDialogOpen] = useState(false)
  const [packs, setPacks] = useState<any[]>([])
  const [selectedPackId, setSelectedPackId] = useState("")
  const [isLoadingPacks, setIsLoadingPacks] = useState(false)
  
  // Global Action State
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    if (userId) {
      loadUserDetails()
    }
  }, [userId])

  const loadUserDetails = async () => {
    try {
      setIsLoading(true)
      const data = await AdminService.getUserDetails(userId)
      setUser(data)
    } catch (err: any) {
      setError(err.message || "Failed to load user details")
      toast.error(err.message || "Failed to load user details")
    } finally {
      setIsLoading(false)
    }
  }

  const loadPacks = async () => {
    try {
      setIsLoadingPacks(true)
      const data = await AdminService.getPacks()
      // The backend returns an object with {items: [], total: X} or an array directly depending on the endpoint version
      setPacks(Array.isArray(data) ? data : (data as any).items || [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load packs")
    } finally {
      setIsLoadingPacks(false)
    }
  }

  const handleChangeRole = async () => {
    if (!selectedRole || !user) return
    try {
      setIsActionLoading(true)
      await AdminService.changeUserRole(user.id, parseInt(selectedRole))
      toast.success("Rôle mis à jour avec succès")
      setRoleDialogOpen(false)
      loadUserDetails()
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleChangeStatus = async () => {
    if (!user) return
    try {
      setIsActionLoading(true)
      await AdminService.changeUserStatus(user.id, !user.is_blocked)
      toast.success(user.is_blocked ? "Utilisateur débloqué" : "Utilisateur bloqué")
      setStatusDialogOpen(false)
      loadUserDetails()
    } catch (err: any) {
      toast.error(err.message || "Erreur")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleGrantPack = async () => {
    if (!user || !selectedPackId) return
    try {
      setIsActionLoading(true)
      await AdminService.grantPackToUser(user.id, selectedPackId)
      toast.success("Pack offert avec succès")
      setPackDialogOpen(false)
      setSelectedPackId("")
      loadUserDetails()
    } catch (err: any) {
      toast.error(err.message || "Erreur")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleRevokePack = async (packId: string) => {
    if (!user) return
    if (!confirm("Êtes-vous sûr de vouloir révoquer l'accès à ce pack ?")) return
    try {
      setIsActionLoading(true)
      await AdminService.revokePackFromUser(user.id, packId)
      toast.success("Accès révoqué avec succès")
      loadUserDetails()
    } catch (err: any) {
      toast.error(err.message || "Erreur")
    } finally {
      setIsActionLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user || error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 text-red-800 rounded-lg">
        <p>{error || "Utilisateur introuvable"}</p>
        <Button variant="link" onClick={() => router.push('/admin-dashboard/users')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/admin-dashboard/users')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{user.civility} {user.name}</h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
           <Badge variant={user.is_blocked ? "destructive" : "default"} className="text-sm px-3 py-1">
            {user.is_blocked ? "Bloqué" : "Actif"}
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {user.role_name}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Personal Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Détails Personnels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/> Date de naissance</span>
                <p className="font-medium">{user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4"/> Téléphone</span>
                <p className="font-medium">{user.phone_number || "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4"/> Adresse</span>
                <p className="font-medium">{user.address || "-"} {user.country ? `(${user.country})` : ""}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Monitor className="h-4 w-4"/> Dernière Connexion</span>
                <p className="font-medium">{user.last_login ? new Date(user.last_login).toLocaleString() : "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Hash className="h-4 w-4"/> IP Inscription</span>
                <p className="font-medium">{user.registration_ip || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                setSelectedRole(user.role.toString())
                setRoleDialogOpen(true)
              }}
            >
              <Shield className="h-4 w-4 mr-2" />
              Changer le Privilège
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                loadPacks()
                setPackDialogOpen(true)
              }}
            >
              <PackagePlus className="h-4 w-4 mr-2" />
              Offrir un Pack
            </Button>

            <Button 
              className="w-full justify-start" 
              variant={user.is_blocked ? "default" : "destructive"}
              onClick={() => setStatusDialogOpen(true)}
            >
              <ShieldAlert className="h-4 w-4 mr-2" />
              {user.is_blocked ? "Débloquer l'utilisateur" : "Bloquer l'accès"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Purchased Packs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Packs et Examens Blancs Achetés</CardTitle>
          <CardDescription>Liste de tous les accès actifs de l'étudiant</CardDescription>
        </CardHeader>
        <CardContent>
          {user.purchased_items && user.purchased_items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date d'achat</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.purchased_items.map((item) => (
                  <TableRow key={item.purchase_id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.type === 'pack' ? 'Pack' : 'Examen Blanc'}</Badge>
                    </TableCell>
                    <TableCell>
                      {item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      {item.gifted ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Offert (Admin)</Badge>
                      ) : (
                        <Badge variant="secondary">Achat</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRevokePack(item.pack_id)}
                        disabled={isActionLoading}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Révoquer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Cet utilisateur n'a aucun pack ou examen blanc actuellement.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le rôle</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Student</SelectItem>
                <SelectItem value="2">Writer</SelectItem>
                <SelectItem value="3">Content Manager</SelectItem>
                <SelectItem value="6">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleChangeRole} disabled={isActionLoading || !selectedRole}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={packDialogOpen} onOpenChange={setPackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Offrir un Pack / Examen Blanc</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isLoadingPacks ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
            ) : (
              <Select value={selectedPackId} onValueChange={setSelectedPackId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un pack..." />
                </SelectTrigger>
                <SelectContent>
                  {packs.map((pack) => (
                    <SelectItem key={pack.id} value={pack.id}>
                      {pack.name || pack.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPackDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleGrantPack} disabled={isActionLoading || !selectedPackId}>Offrir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{user.is_blocked ? "Débloquer l'utilisateur" : "Bloquer l'utilisateur"}</DialogTitle>
          </DialogHeader>
          <p className="py-4">{user.is_blocked ? "Confirmez-vous le déblocage ?" : "Confirmez-vous le blocage ? L'utilisateur ne pourra plus se connecter."}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Annuler</Button>
            <Button variant={user.is_blocked ? "default" : "destructive"} onClick={handleChangeStatus} disabled={isActionLoading}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
