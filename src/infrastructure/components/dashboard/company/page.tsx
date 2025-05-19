"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { DataTable } from "./data-table"
import { columns, Site } from "./columns"
import { Button } from "@/src/infrastructure/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/src/infrastructure/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/infrastructure/ui/alert-dialog"
import { Input } from "@/src/infrastructure/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/src/infrastructure/ui/pagination"
import instance from "@/src/lib/api"
import { Label } from "@/src/infrastructure/ui/label"
import { getUser } from "@/src/core/auth/authApi"
import { Card } from "@/src/infrastructure/ui/card"

export default function SitesPage() {
  const router = useRouter()
  const [siteList, setSiteList] = useState<Site[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null)
  
  const [newSite, setNewSite] = useState({
    clientCode: "",
    name: "",
    address: "",
    location: {},
    mec: "",
    ctClient: "",
  })
  
  const [editingSite, setEditingSite] = useState<Site | null>(null)

  // Configurar handlers globais para os botões da tabela
  useEffect(() => {
    window.handleEditClick = (site) => {
      setEditingSite(site)
      setIsEditDialogOpen(true)
    }
    
    window.handleDeleteClick = (siteId) => {
      setSiteToDelete(siteId)
      setIsDeleteDialogOpen(true)
    }
    
    window.handleViewEquipment = (site) => {
      if (site.costCenter) {
        router.push(`/equipmentList?costCenter=${site.costCenter}`)
      } else {
        toast.error("Este site não possui um centro de custo associado.")
      }
    }
  }, [router])

  async function fetchSites() {
    try {
      setIsLoading(true)
      const clientCode = localStorage.getItem("selectedCompany")
      
      if (!clientCode) {
        toast.error("Empresa não selecionada")
        return
      }
      
      const response = await instance.get(`company?size=100`)
      
      const filteredSites = response.data.data.data.filter(
        (site: Site) => clientCode === site.clientCode
      )
      
      setSiteList(filteredSites)
      setTotalPages(Math.ceil(filteredSites.length / 10))
    } catch (error: any) {
      console.error("Error fetching sites:", error.message)
      toast.error("Erro ao carregar os sites. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSites()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isForEdit = false
  ) => {
    const { name, value } = e.target
    
    if (isForEdit && editingSite) {
      setEditingSite({
        ...editingSite,
        [name]: value,
      })
    } else {
      setNewSite({
        ...newSite,
        [name]: value,
      })
    }
  }

  const handleAddSite = async () => {
    try {
        const user = getUser();
             if (!user) {
             
               return;
             }
     
      
      const response = await instance.post(`/companySite/create/${user}/1162`,
        {
          name: newSite.name,
          address: newSite.address,
          location: newSite.location,
          mec: newSite.mec,
          ctClient: newSite.ctClient,
        }
      )
      
      setSiteList((prevList) => [...prevList, response.data.data])
      toast.success("Site adicionado com sucesso!")
      setIsAddDialogOpen(false)
      
      // Reset form
      setNewSite({
        clientCode: "",
        name: "",
        address: "",
        location: {},
        mec: "",
        ctClient: "",
      })
    } catch (error: any) {
      console.error("Error adding site:", error.message)
      toast.error("Erro ao adicionar o site. Por favor, tente novamente.")
    }
  }

  const handleEditSite = async () => {
    if (!editingSite) return
    
    try {
      const response = await instance.put(`/companySite/update${editingSite._id}`, )
      
      setSiteList((prevList) =>
        prevList.map((site) =>
          site._id === editingSite._id ? response.data.data : site
        )
      )
      
      toast.success("Site editado com sucesso!")
      setIsEditDialogOpen(false)
      setEditingSite(null)
    } catch (error: any) {
      console.error("Error editing site:", error.message)
      toast.error("Erro ao editar o site. Por favor, tente novamente.")
    }
  }

  const handleDeleteSite = async () => {
    if (!siteToDelete) return
    
    try {
      toast.error("Você não tem permissão para excluir.")
      await instance.delete( `/companySite/${siteToDelete}` )
      setSiteList((prevList) => prevList.filter((site) => site._id !== siteToDelete))
      toast.success("Site excluído com sucesso!")
     
    } catch (error: any) {
      console.error("Error deleting site:", error.message)
      toast.error("Erro ao excluir o site. Por favor, tente novamente.")
    } finally {
      setIsDeleteDialogOpen(false)
      setSiteToDelete(null)
    }
  }

  return (
    <Card className="bg-white dark:bg-gray-800 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sites da Empresa</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Site
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={siteList}
        isLoading={isLoading}
        searchKey="name"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      {/* Paginação customizada */}
      <Pagination>
        <PaginationContent>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage && page <= currentPage + 2)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      className={
                        page === currentPage ? "bg-blue-500 text-white" : ""
                      }
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }

              if (
                (page === 2 && currentPage > 1) ||
                (page === totalPages - 1 && currentPage < totalPages - 3)
              ) {
                return (
                  <PaginationItem key={`ellipsis-${page}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return null;
            }
          )}
        </PaginationContent>
      </Pagination>
      
      {/* Modal para adicionar site */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Site</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do novo site abaixo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                name="name"
                value={newSite.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Endereço
              </Label>
              <Input
                id="address"
                name="address"
                value={newSite.address}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ctClient" className="text-right">
                CT Client
              </Label>
              <Input
                id="ctClient"
                name="ctClient"
                value={newSite.ctClient}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSite}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal para editar site */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Site</DialogTitle>
            <DialogDescription>
              Atualize os detalhes do site abaixo.
            </DialogDescription>
          </DialogHeader>
          
          {editingSite && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editingSite.name}
                  onChange={(e) => handleInputChange(e, true)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-address" className="text-right">
                  Endereço
                </Label>
                <Input
                  id="edit-address"
                  name="address"
                  value={editingSite.address}
                  onChange={(e) => handleInputChange(e, true)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-mec" className="text-right">
                  MEC
                </Label>
                <Input
                  id="edit-mec"
                  name="mec"
                  value={editingSite.mec}
                  onChange={(e) => handleInputChange(e, true)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-ctClient" className="text-right">
                  CT Client
                </Label>
                <Input
                  id="edit-ctClient"
                  name="ctClient"
                  value={editingSite.ctClient}
                  onChange={(e) => handleInputChange(e, true)}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSite}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente este site
              e removerá seus dados dos nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSite} className="bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}