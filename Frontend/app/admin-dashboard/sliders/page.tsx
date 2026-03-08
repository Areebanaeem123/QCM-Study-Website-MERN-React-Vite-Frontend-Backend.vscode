"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminService, SliderOut } from "@/lib/admin-service"
import { Loader2, Plus, Trash2, Edit2, Check, X, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function AdminSlidersPage() {
  const [sliders, setSliders] = useState<SliderOut[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Form state
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [btnText, setBtnText] = useState("")
  const [btnLink, setBtnLink] = useState("")
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchSliders()
  }, [])

  const fetchSliders = async () => {
    setIsLoading(true)
    try {
      const data = await AdminService.getSliders()
      setSliders(data)
    } catch (error) {
      console.error("Failed to fetch sliders", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSlider = async () => {
    if (!title || !imageUrl) {
      toast.error("Le titre et l'URL de l'image sont requis")
      return
    }

    setIsSubmitting(true)
    try {
      await AdminService.createSlider({
        title,
        subtitle,
        image_url: imageUrl,
        button_text: btnText,
        button_link: btnLink
      })
      toast.success("Slider ajouté")
      clearForm()
      fetchSliders()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'ajout")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce slider ?")) return
    try {
      await AdminService.deleteSlider(id)
      toast.success("Slider supprimé")
      fetchSliders()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression")
    }
  }

  const handleToggleStatus = async (slider: SliderOut) => {
    try {
      await AdminService.updateSlider(slider.id, { is_active: !slider.is_active })
      toast.success(slider.is_active ? "Slider désactivé" : "Slider activé")
      fetchSliders()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la modification")
    }
  }

  const clearForm = () => {
    setTitle("")
    setSubtitle("")
    setImageUrl("")
    setBtnText("")
    setBtnLink("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Sliders de la page d'accueil</h2>
        <p className="text-muted-foreground">
          Gérez les sliders de la page d'accueil pour les promotions ou les annonces.
        </p>
      </div>

      {/* Add Slider Form */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Ajouter un nouveau slider</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Titre</label>
            <Input placeholder="Titre principal" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sous-titre</label>
            <Input placeholder="Ex: Offre limitée" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">URL de l'image</label>
            <Input placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Texte du bouton</label>
            <Input placeholder="Ex: S'inscrire" value={btnText} onChange={(e) => setBtnText(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Lien du bouton</label>
            <Input placeholder="/connexion" value={btnLink} onChange={(e) => setBtnLink(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddSlider} disabled={isSubmitting} className="w-full gap-2 font-semibold">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Ajouter le Slider
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-background relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Aperçu</TableHead>
              <TableHead>Contenu</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sliders.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="relative h-16 w-24 overflow-hidden rounded-md border bg-muted">
                    {s.image_url ? (
                      <img src={s.image_url} alt={s.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold">{s.title}</div>
                  <div className="text-sm text-muted-foreground">{s.subtitle}</div>
                  <div className="text-xs text-primary mt-1">{s.button_link}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={s.is_active ? "secondary" : "outline"} className={s.is_active ? "bg-green-50 text-green-700" : ""}>
                    {s.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2 tabular-nums">
                  <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(s)} title={s.is_active ? "Désactiver" : "Activer"}>
                    {s.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(s.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && sliders.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Aucun slider trouvé. Ajoutez-en un ci-dessus.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
