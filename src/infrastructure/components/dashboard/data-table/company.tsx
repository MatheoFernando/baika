"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, BarChart2, ClipboardMinus } from "lucide-react"
import instance from "@/src/lib/api"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/infrastructure/ui/card"
import { Input } from "@/src/infrastructure/ui/input"
import { Button } from "@/src/infrastructure/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/infrastructure/ui/dialog"
import { Label } from "@/src/infrastructure/ui/label"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../data-table"

interface Company {
  id: string
  name: string
  logo?: string
  clientCode: string
  sites: number
  occurrences: number
  createdAt: string
}

interface ApiResponse<T> {
  data: {
    data: T
    total?: number
    page?: number
    size?: number
  }
  status: number
  message: string
}

type SecondaryField = { key: keyof Company; label: string; onClick?: (company: Company) => void }

export default function CompanyTable() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState<boolean>(false)
  const [clientName, setClientName] = useState<string>("")
  const [clientCode, setClientCode] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const columns: ColumnDef<Company>[] = React.useMemo(
    () => [
      {
        accessorKey: "clientCode",
        header: "Código do Cliente",
        cell: ({ row }) => <span>{row.original.clientCode}</span>,
      },
      {
        accessorKey: "name",
        header: "Nome",
        cell: ({ row }) => (
          <div className="flex items-center space-x-4">
            <Button
              variant="link"
              className="p-0 text-sm cursor-pointer"
              onClick={() => {
                if (viewMode === "table") {
                  handleCompanyClick(row.original)
                }
              }}
            >
              {row.original.name}
            </Button>
          </div>
        ),
      },
    ],
    [viewMode],
  )

  const fetchCompanies = async (): Promise<void> => {
    setLoading(true)
    try {
      const response = await instance.get<ApiResponse<Company[]>>(`/company?size=100`)
      setTimeout(() => {
        setCompanies(response.data.data.data)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Erro ao buscar empresas:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const sortedCompanies = [...companies].sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const handleCompanyClick = (company: Company): void => {
    setSelectedCompany(company)
    setIsDialogOpen(true)
  }

  const handleNavigateToDetail = (type: "site" | "occurrence" | "supervisao"): void => {
    setIsDialogOpen(false)
    if (selectedCompany) {
      const params = new URLSearchParams({
        clientCode: selectedCompany.clientCode,
        companyName: selectedCompany.name
      })
      
      if (type === "site") {
        router.push(`/dashboard/cliente/site/?${params.toString()}`)
      } else if (type === "occurrence") {
        router.push(`/dashboard/cliente/ocorrencia?${params.toString()}`)
      } else if (type === "supervisao") {
        router.push(`/dashboard/cliente/supervisao?${params.toString()}`)
      }
    }
  }

  const createCompany = async (): Promise<void> => {
    if (!clientName || !clientCode) {
      toast.error("Preencha todos os campos")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await instance.post<ApiResponse<Company>>(`/company/create`, {
        name: clientName,
        clientCode: clientCode,
      })

      if (response.data.status === 200) {
        toast.success("Cliente cadastrado com sucesso")
        setIsAddClientDialogOpen(false)
        setClientName("")
        setClientCode("")
        fetchCompanies()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao cadastrar cliente")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div >
      <DataTable
        columns={columns}
        data={sortedCompanies}
        loading={loading}
        title="Clientes"
        filterOptions={{
          enableNameFilter: true,
          enableViewModeToggle: true,
          enableAddButton: true,
          addButtonLabel: "Adicionar Cliente",
        }}
        onAddClick={() => setIsAddClientDialogOpen(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        cardOptions={{
          primaryField: "name",
          secondaryFields: [
            { 
              key: "sites", 
              label: "Sites",
              onClick: (company: Company) => {
                const params = new URLSearchParams({
                  clientCode: company.clientCode,
                  companyName: company.name
                })
                router.push(`/dashboard/cliente/site/?${params.toString()}`)
              }
            } as { key: keyof Company; label: string; onClick?: (company: Company) => void },
            { key: "occurrences", label: "Ocorrências"} as { key: keyof Company; label: string; onClick?: (company: Company) => void },
          ],
          onCardClick: (company) => {
            const params = new URLSearchParams({
              clientCode: company.clientCode,
              companyName: company.name
            })
            router.push(`/dashboard/cliente/site/?${params.toString()}`)
          },
        }}
   
        emptyMessage="Nenhuma empresa encontrada."
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md lg:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">
              <span>{selectedCompany?.clientCode} - </span>
              {selectedCompany?.name}
            </DialogTitle>
            <DialogDescription>Selecione uma opção para ver mais detalhes</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <Card
              className="cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleNavigateToDetail("site")}
            >
              <CardHeader className="pb-2 justify-center items-center">
                <CardTitle className="text-lg">Sites</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 justify-center items-center">
                <Building2 className="text-blue-400" size={32} />
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleNavigateToDetail("occurrence")}
            >
              <CardHeader className="pb-2 justify-center items-center">
                <CardTitle className="text-lg">Ocorrências</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 justify-center items-center">
                <ClipboardMinus className="text-red-400" size={32} />
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleNavigateToDetail("supervisao")}
            >
              <CardHeader className="pb-2 justify-center items-center">
                <CardTitle className="text-lg">Supervisão</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 justify-center items-center">
                <BarChart2 className="text-red-400" size={32} />
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Adicionar Cliente</DialogTitle>
            <DialogDescription>Preencha os campos abaixo para cadastrar um novo cliente</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-4">
              <Label htmlFor="clientCode" className="text-right">
                Código do Cliente:
              </Label>
              <Input
                id="clientCode"
                value={clientCode}
                onChange={(e) => setClientCode(e.target.value)}
                placeholder="Código do Cliente"
                className="col-span-3"
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="name" className="text-right">
                Nome:
              </Label>
              <Input
                id="name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome do Cliente"
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddClientDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={createCompany} disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}