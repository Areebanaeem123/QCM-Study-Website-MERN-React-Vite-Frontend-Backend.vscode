"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminService, PageOut } from "@/lib/admin-service"
import { Loader2, Plus, Save } from "lucide-react"
import { toast } from "sonner"

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageOut[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("")

  const [editTitle, setEditTitle] = useState("")
  const [editSlug, setEditSlug] = useState("")
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    setIsLoading(true)
    try {
      const data = await AdminService.getPages()
      setPages(data)
      if (data.length > 0 && !activeTab) {
        setActiveTab(data[0].slug)
        loadPageData(data[0])
      }
    } catch (error) {
      console.error("Failed to fetch pages", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPageData = (page: PageOut) => {
    setEditTitle(page.title)
    setEditSlug(page.slug)
    setEditContent(page.content)
  }

  const handleSave = async () => {
    try {
      await AdminService.updatePage(editSlug, { title: editTitle, content: editContent })
      toast.success("Page mise à jour avec succès")
      fetchPages()
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour")
    }
  }

  const handleCreateNew = async () => {
    const title = prompt("Titre de la nouvelle page :")
    const slug = prompt("Slug de la nouvelle page (ex: nouvelle-page) :")
    if (title && slug) {
      try {
        await AdminService.createPage({ title, slug, content: "Nouveau contenu..." })
        toast.success("Page créée")
        fetchPages()
      } catch (error: any) {
        toast.error(error.message || "Erreur lors de la création")
      }
    }
  }

  if (isLoading && pages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pages CMS</h2>
          <p className="text-muted-foreground">
            Modifiez les pages statiques comme À propos et Concept.
          </p>
        </div>
        <Button onClick={handleCreateNew} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> Nouvelle Page
        </Button>
      </div>

      <div className="rounded-lg border bg-background p-6">
        <Tabs value={activeTab} onValueChange={(val) => {
          setActiveTab(val)
          const p = pages.find(pg => pg.slug === val)
          if (p) loadPageData(p)
        }} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent">
            {pages.map(page => (
              <TabsTrigger key={page.slug} value={page.slug} className="border border-input data-[state=active]:bg-muted">
                {page.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {pages.map(page => (
            <TabsContent key={page.slug} value={page.slug} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Titre de la page</label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Contenu de la page (HTML supporté)</label>
                <Textarea
                  className="w-full h-80 font-mono text-sm"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" /> Sauvegarder les modifications
                </Button>
              </div>
            </TabsContent>
          ))}
          {pages.length === 0 && (
             <div className="text-center py-10 text-muted-foreground">
               Aucune page trouvée. Cliquez sur "Nouvelle Page" pour commencer.
             </div>
          )}
        </Tabs>
      </div>
    </div>
  )
}
