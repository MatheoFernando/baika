"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LayoutGrid, List, ChevronDown, Search, Building2, MailWarning } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../..//ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog"
import { Input } from "../../ui/input"
import { Button } from "../../ui/button"
import { Skeleton } from "../../ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import instance from "@/src/lib/api"

export default function CompanyTable() {
  const router = useRouter()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("table")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const itemsPerPage = 5
  
  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const response = await instance.get(`/company`);
      setTimeout(() => {
        setCompanies(response.data.data.data);
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

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentCompanies = filteredCompanies.slice(startIndex, startIndex + itemsPerPage)

  const handleCompanyClick = (company) => {
    setSelectedCompany(company)
    setIsDialogOpen(true)
  }
  
  const handleNavigateToDetail = (type, id) => {
    setIsDialogOpen(false)
    if (type === 'site') {
      router.push(`/site/${id}`)
    } else if (type === 'occurrence') {
      router.push(`/occurrence/${id}`)
    }
  }

  // Componente de carregamento
  const LoadingSkeleton = () => (
    <>
      {viewMode === "table" ? (
        Array(5).fill(0).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-full rounded-2xl" />
              </div>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, index) => (
            <Card key={index} className="cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <Skeleton className="h-16 w-24" />
                  <Skeleton className="h-16 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )

  const renderAvatar = (company) => (
    <Avatar className="h-8 w-8 rounded-lg">
      <AvatarImage src={company.logo} alt={company.name} />
      {!company.logo && (
        <AvatarFallback className="flex items-center justify-center bg-gray-400 text-white rounded-full font-semibold">
          {company.name.split(" ").slice(0, 1).join("")[0]?.toUpperCase()}
          {company.name.split(" ").length > 1 && 
            company.name.split(" ").slice(-1).join("")[0]?.toUpperCase()}
        </AvatarFallback>
      )}
    </Avatar>
  )

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-semibold">Empresas</h1>
        
        <div className="flex items-center w-full md:w-auto gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                {viewMode === "table" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewMode("table")}>
                <List className="mr-2 h-4 w-4" />
                <span>Visualizar em tabela</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("card")}>
                <LayoutGrid className="mr-2 h-4 w-4" />
                <span>Visualizar em cards</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <LoadingSkeleton />
              ) : currentCompanies.length > 0 ? (
                currentCompanies.map((company) => (
                  <TableRow 
                    key={company.id} 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleCompanyClick(company)}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {renderAvatar(company)}
                        <div className="font-medium">{company.name}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={1} className="h-24 text-center">
                    Nenhuma empresa encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <LoadingSkeleton />
          ) : currentCompanies.length > 0 ? (
            currentCompanies.map((company) => (
              <Card 
                key={company.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleCompanyClick(company)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-3">
                    {renderAvatar(company)}
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <div 
                      className="text-center cursor-pointer hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToDetail('site', company.id);
                      }}
                    >
                      <div className="text-2xl font-bold">{company.sites}</div>
                      <div className="text-sm text-muted-foreground">Sites</div>
                    </div>
                    <div 
                      className="text-center cursor-pointer hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToDetail('occurrence', company.id);
                      }}
                    >
                      <div className="text-2xl font-bold">{company.occurrences}</div>
                      <div className="text-sm text-muted-foreground">Ocorrências</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              Nenhuma empresa encontrada.
            </div>
          )}
        </div>
      )}

      {filteredCompanies.length > 0 && (
        <div className="flex justify-center mt-4">
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
                            page === currentPage
                              ? "bg-blue-500 text-white"
                              : ""
                          }
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }

                  if (
                    (page === 2 && currentPage > 1) ||
                    (page === totalPages - 1 &&
                      currentPage < totalPages - 3)
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
        </div>
      )}

      {/* Modal de detalhes */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedCompany?.name}
            </DialogTitle>
            <DialogDescription>
              Selecione uma opção para ver mais detalhes
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Card 
              className="cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleNavigateToDetail('site', selectedCompany?.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Sites</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Building2 className="text-3xl font-bold text-center" />
                <div className="text-sm text-muted-foreground text-center">Clique para ver os sites</div>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleNavigateToDetail('occurrence', selectedCompany?.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Ocorrências</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                 <MailWarning className="text-3xl font-bold text-center" />
                <div className="text-sm text-muted-foreground text-center">Ver as ocorrências</div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}