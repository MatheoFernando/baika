"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash, Plus } from "lucide-react"
import instance from "@/src/lib/api"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/src/infrastructure/ui/alert-dialog"
import { Input } from "@/src/infrastructure/ui/input"
import { DataTable } from "@/src/infrastructure/components/dashboard/data-table"
import { Button } from "@/src/infrastructure/ui/button"
import { BreadcrumbRoutas } from "@/src/infrastructure/components/ulils/breadcrumbRoutas"


interface Site {
  _id: string
  name: string
  address?: string
  ctClient?: string
  clientCode: string
}

// Define form data type
interface FormData {
  name: string
  address: string
  ctClient: string
}

export default function CompanySites() {
  const searchParams = useSearchParams()
  const clientCode = searchParams.get('clientCode')
  const companyName = searchParams.get('companyName')
  
  const [data, setData] = useState<Site[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [date, setDate] = useState<[Date | undefined, Date | undefined]>([undefined, undefined])
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    ctClient: "",
  })

  const columns: ColumnDef<Site>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <span className="cursor-pointer hover:text-blue-600 transition-colors">
          {row.original.name}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const site = row.original
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => handleEditClick(site)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="cursor-pointer text-red-600" onClick={() => handleDeleteSite(site._id)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  useEffect(() => {
    const fetchSites = async () => {
      if (!clientCode) {
        toast.error("Código do cliente não encontrado")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await instance.get(`/companySite?size=500`)
        const fetchedSites = response.data.data.data.filter((site: Site) => site.clientCode === clientCode)
        setData(fetchedSites)
      } catch (error) {
        console.error("Error fetching sites:", error)
        toast.error("Failed to load sites")
      } finally {
        setIsLoading(false)
      }
    }
    fetchSites()
  }, [clientCode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddSite = async () => {
    if (!clientCode) {
      toast.error("Código do cliente não encontrado")
      return
    }

    try {
      const response = await instance.post(`/companySite/create/${clientCode}/1162`, {
        name: formData.name,
        address: formData.address,
        location: {},
        ctClient: formData.ctClient,
      })

      setData((prevList) => [...prevList, response.data.data])
      toast.success("Site added successfully!")
      setFormData({
        name: "",
        address: "",
        ctClient: "",
      })
      setIsAddModalOpen(false)
    } catch (error) {
      console.error("Error adding site:", error)
      toast.error("Failed to add site. Please try again.")
    }
  }

  const handleEditClick = (site: Site) => {
    setSelectedSite(site)
    setFormData({
      name: site.name,
      address: site.address || "",
      ctClient: site.ctClient || "",
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateSite = async () => {
    if (!selectedSite || !clientCode) return

    try {
      await instance.put(`/companySite/update/${selectedSite._id}/${clientCode}`, {
        name: formData.name,
        address: formData.address,
        ctClient: formData.ctClient,
      })

      setData((prevList) =>
        prevList.map((site) =>
          site._id === selectedSite._id
            ? {
                ...site,
                name: formData.name,
                address: formData.address,
                ctClient: formData.ctClient,
              }
            : site,
        ),
      )

      toast.success("Site updated successfully!")
      setIsEditModalOpen(false)
    } catch (error) {
      console.error("Error updating site:", error)
      toast.error("Failed to update site. Please try again.")
    }
  }

  const handleDeleteSite = async (siteId: string) => {
    if (!clientCode) {
      toast.error("Código do cliente não encontrado")
      return
    }

    try {
      await instance.delete(`/companySite/delete/${siteId}/${clientCode}`)

      setData((prevList) => prevList.filter((site) => site._id !== siteId))
      toast.success("Site deleted successfully!")
    } catch (error) {
      console.error("Error deleting site:", error)
      toast.error("Failed to delete site. Please try again.")
    }
  }

  return (
    <div className="container p-8">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <BreadcrumbRoutas 
          title={companyName ? `Sites - ${companyName}` : "Sites"} 
          showBackButton 
        />
        <div>
          <AlertDialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <AlertDialogTrigger asChild>
              <Button className="bg-blue-600 text-white cursor-pointer">
                <Plus className="h-4 w-4" />
                Adicionar Site
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Adicionar Site</AlertDialogTitle>
                <AlertDialogDescription>Insira os detalhes do site abaixo</AlertDialogDescription>
              </AlertDialogHeader>

              <div className="flex flex-col gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="name">Nome:</label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="address">Endereço:</label>
                  <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="ctClient">CT Cliente:</label>
                  <Input id="ctClient" name="ctClient" value={formData.ctClient} onChange={handleInputChange} />
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleAddSite}>Adicionar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div>
        <DataTable
          columns={columns}
          data={data}
          loading={isLoading}
          title="Lista dos sites"
          filterOptions={{
            enableSiteFilter: true,
          }}
          initialColumnVisibility={{
            details: false,
          }}
        />
        
        <AlertDialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Editar Site</AlertDialogTitle>
              <AlertDialogDescription>Atualize os detalhes do site abaixo</AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex flex-col gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name">Nome:</label>
                <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-address">Endereço:</label>
                <Input id="edit-address" name="address" value={formData.address} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-ctClient">CT Client:</label>
                <Input id="edit-ctClient" name="ctClient" value={formData.ctClient} onChange={handleInputChange} />
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleUpdateSite}>Salvar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}