"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, Mail, ExternalLink } from "lucide-react"
import Link from "next/link"
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
import { AdminService, User } from "@/lib/admin-service"

const ROLE_NAMES: Record<number, string> = {
  1: "Étudiant",
  2: "Rédacteur",
  3: "Gestionnaire de contenu",
  6: "Administrateur",
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [error, setError] = useState("")
  const [sortBy, setSortBy] = useState("alphabetical")

  // Email Dialog states
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [isEmailLoading, setIsEmailLoading] = useState(false)

  // Dialog states
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [packDialogOpen, setPackDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [isActionLoading, setIsActionLoading] = useState(false)
  
  // Pack state
  const [packs, setPacks] = useState<any[]>([])
  const [selectedPackId, setSelectedPackId] = useState<string>("")
  const [isLoadingPacks, setIsLoadingPacks] = useState(false)

  const ITEMS_PER_PAGE = 20

  // Fetch users
  useEffect(() => {
    loadUsers()
  }, [search, sortBy, currentPage])

  // Load packs when pack dialog opens
  useEffect(() => {
    if (packDialogOpen) {
      loadPacks()
    }
  }, [packDialogOpen])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await AdminService.getUsers(
        search,
        sortBy,
        currentPage * ITEMS_PER_PAGE,
        ITEMS_PER_PAGE
      )
      setUsers(response.items)
      setTotalUsers(response.total)
    } catch (err: any) {
      setError(err.message || "Échec du chargement des utilisateurs")
    } finally {
      setIsLoading(false)
    }
  }

  const loadPacks = async () => {
    try {
      setIsLoadingPacks(true)
      const data = await AdminService.getPacks()
      // Handle the case where AdminService.getPacks returns a paginated object
      setPacks(Array.isArray(data) ? data : (data as any).items || [])
    } catch (err: any) {
      setError(err.message || "Échec du chargement des packs")
    } finally {
      setIsLoadingPacks(false)
    }
  }

  // Handle role change
  const handleChangeRole = async () => {
    if (!selectedUser || !selectedRole) return

    try {
      setIsActionLoading(true)
      await AdminService.changeUserRole(selectedUser.id, parseInt(selectedRole))
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id
            ? { ...u, role: parseInt(selectedRole), role_name: ROLE_NAMES[parseInt(selectedRole)] }
            : u
        )
      )
      setRoleDialogOpen(false)
      setSelectedUser(null)
      setSelectedRole("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  // Handle block/unblock
  const handleChangeStatus = async (isBlocking: boolean) => {
    if (!selectedUser) return

    try {
      setIsActionLoading(true)
      await AdminService.changeUserStatus(selectedUser.id, isBlocking)
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, is_blocked: isBlocking } : u
        )
      )
      setStatusDialogOpen(false)
      setSelectedUser(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handlePrintPackMessage = () => {
    // TODO: Implement grant pack functionality
    // For now, show message that this requires pack selection
    alert("Fonctionnalité d'octroi de pack - sélectionnez un pack à offrir à cet utilisateur")
  }

  const handleGrantPack = async () => {
    if (!selectedUser || !selectedPackId) return

    try {
      setIsActionLoading(true)
      await AdminService.grantPackToUser(selectedUser.id, selectedPackId)
      
      // Update user packs count
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, packs: u.packs + 1 } : u
        )
      )
      
      setPackDialogOpen(false)
      setSelectedUser(null)
      setSelectedPackId("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleSendMassEmail = async () => {
    if (!emailSubject || !emailBody) return
    try {
      setIsEmailLoading(true)
      await AdminService.emailAllStudents(emailSubject, emailBody)
      setEmailDialogOpen(false)
      setEmailSubject("")
      setEmailBody("")
      alert("Email envoyé avec succès à tous les étudiants!")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsEmailLoading(false)
    }
  }

  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>
        <p className="text-muted-foreground">
          Gérer les utilisateurs de la plateforme, leurs rôles et leurs accès.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">{error}</div>
      )}

      {/* Search Bar & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full max-w-2xl">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(0)
              }}
            />
          </div>
          <Select value={sortBy} onValueChange={(val) => { setSortBy(val); setCurrentPage(0) }}>
             <SelectTrigger className="w-[180px]">
               <SelectValue placeholder="Trier par" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="alphabetical">Alphabétique</SelectItem>
               <SelectItem value="university">Université</SelectItem>
               <SelectItem value="academic_year">Année Académique</SelectItem>
             </SelectContent>
           </Select>
        </div>
        
        <Button onClick={() => setEmailDialogOpen(true)} className="w-full sm:w-auto self-start sm:self-auto">
          <Mail className="w-4 h-4 mr-2" />
          Emailer tous les étudiants
        </Button>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border bg-background overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Université</TableHead>
                <TableHead>Année Ac.</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Packs</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-sm">{user.id.slice(0, 8)}...</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.university || "-"}</TableCell>
                  <TableCell>{user.academic_year || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.role_name}</Badge>
                  </TableCell>
                  <TableCell>{user.packs}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.is_blocked ? "destructive" : "default"
                      }
                    >
                      {user.is_blocked ? "Bloqué" : "Actif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin-dashboard/users/${user.id}`}>
                      <Button size="sm" variant="secondary">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user)
                        setSelectedRole(user.role.toString())
                        setRoleDialogOpen(true)
                      }}
                    >
                      Rôle
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user)
                        setPackDialogOpen(true)
                      }}
                    >
                      Pack
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        user.is_blocked ? "default" : "destructive"
                      }
                      onClick={() => {
                        setSelectedUser(user)
                        setStatusDialogOpen(true)
                      }}
                    >
                      {user.is_blocked ? "Débloquer" : "Bloquer"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Affichage {currentPage * ITEMS_PER_PAGE + 1}-
            {Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalUsers)} sur{" "}
            {totalUsers}
          </p>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le rôle de l'utilisateur</DialogTitle>
            <DialogDescription>
              Sélectionnez le nouveau rôle pour {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

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

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleChangeRole}
              disabled={isActionLoading || !selectedRole}
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Confirmer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offer Pack Dialog */}
      <Dialog open={packDialogOpen} onOpenChange={setPackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Offrir un Pack</DialogTitle>
            <DialogDescription>
              Offrir l'accès à un pack pour {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isLoadingPacks ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : packs.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Sélectionner un pack</label>
                  <Select value={selectedPackId} onValueChange={setSelectedPackId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un pack..." />
                    </SelectTrigger>
                    <SelectContent>
                      {packs.map((pack) => (
                        <SelectItem key={pack.id} value={pack.id}>
                          {pack.name} ({pack.price} {pack.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedPackId && packs.find(p => p.id === selectedPackId) && (
                  <div className="bg-muted p-3 rounded text-sm">
                    <p><strong>Description:</strong> {packs.find(p => p.id === selectedPackId)?.description || "N/A"}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun pack disponible</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPackDialogOpen(false)
                setSelectedPackId("")
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => handleGrantPack()}
              disabled={!selectedPackId || isActionLoading}
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Offrir...
                </>
              ) : (
                "Offrir le Pack"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block/Unblock Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.is_blocked ? "Débloquer" : "Bloquer"} utilisateur
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir{" "}
              {selectedUser?.is_blocked ? "débloquer" : "bloquer"}{" "}
              {selectedUser?.name} ?
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
            {selectedUser?.is_blocked
              ? "Cet utilisateur pourra se reconnecter et accéder à la plateforme."
              : "Cet utilisateur ne pourra plus accéder à la plateforme."}
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant={selectedUser?.is_blocked ? "default" : "destructive"}
              onClick={() =>
                handleChangeStatus(!selectedUser?.is_blocked || false)
              }
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : selectedUser?.is_blocked ? (
                "Débloquer"
              ) : (
                "Bloquer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Email All Students Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Emailer Tous Les Étudiants</DialogTitle>
            <DialogDescription>
              Envoyez un e-mail groupé à tous les étudiants inscrits sur la plateforme.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sujet de l'e-mail</label>
              <Input
                placeholder="Ex: Mise à jour importante"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea
                className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Votre message ici..."
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmailDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSendMassEmail}
              disabled={isEmailLoading || !emailSubject || !emailBody}
            >
              {isEmailLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer l'e-mail"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
