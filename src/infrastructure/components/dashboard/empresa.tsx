"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  List,
  Search,
  Building2,
  MailWarning,
  Plus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../..//ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "../../ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Skeleton } from "../../ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Label } from "../../ui/label";
import instance from "@/src/lib/api";
import { toast } from "sonner";


export default function CompanyTable() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientCode, setClientCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 10;

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await instance.get(`/company?size=100`);
      setTimeout(() => {
        setCompanies(response.data.data.data);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCompanies = filteredCompanies.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleCompanyClick = (company) => {
localStorage.setItem("selectedClientCode", company.clientCode);
setSelectedCompany(company);
    setIsDialogOpen(true);
  };
console.log(selectedCompany)
const handleNavigateToDetail = (type) => {
  setIsDialogOpen(false);
  if (type === "site") {
    router.push(`/dashboard/cliente/company-site`);
  } else if (type === "occurrence") {
    router.push(`/dashboard/cliente/ocorrencia`);
  }
};


  const createCompany = async () => {
    if (!clientName || !clientCode) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await instance.post(
        `/company/create`,
        {
          name: clientName,
          clientCode: clientCode,
        }
      );
      
      if (response.data.status === 200) {
        toast.success("Cliente cadastrado com sucesso");
        setIsAddClientDialogOpen(false);
        setClientName("");
        setClientCode("");
        
        // Reload companies data
        fetchCompanies();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao cadastrar cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const LoadingSkeleton = () => (
    <>
      {viewMode === "table" ? (
        Array(5)
          .fill(0)
          .map((_, index) => (
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
          {Array(6)
            .fill(0)
            .map((_, index) => (
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
  );

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
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-semibold">Clientes</h1>

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

          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
          >
            {viewMode === "table" ? (
              <List className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
          </Button>

          <Button 
            variant="default" 
            className="flex items-center gap-1"
            onClick={() => setIsAddClientDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Cliente</span>
          </Button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="rounded-md border">
          <Table>
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
                className="hover:bg-muted/50 transition-colors"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-3">
                    {renderAvatar(company)}
                    <Button
                      variant="link"
                      className="p-0 text-lg hover:underline"
                      onClick={() => handleCompanyClick(company)}
                    >
                      {company.name}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <div
                      className="text-center border py-2 px-4 rounded-xl cursor-pointer "
                      onClick={() => handleNavigateToDetail("site")}
                    >
                      <div className="text-2xl font-bold">{company.sites}</div>
                      <div className="text-sm text-muted-foreground">Sites</div>
                    </div>
                    <div
                      className="text-center border py-2 px-4 rounded-xl cursor-pointer "
                      onClick={() =>
                        handleNavigateToDetail("occurrence")
                      }
                    >
                      <div className="text-2xl font-bold">
                        {company.occurrences}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Ocorrências
                      </div>
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
        </div>
      )}

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
              onClick={() =>
                handleNavigateToDetail("site")
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Sites</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Building2 className="text-3xl font-bold text-center" />
                <div className="text-sm text-muted-foreground text-center">
                   Ver os sites
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() =>
                handleNavigateToDetail("occurrence")
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Ocorrências</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <MailWarning className="text-3xl font-bold text-center" />
                <div className="text-sm text-muted-foreground text-center">
                  Ver as ocorrências
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Adicionar Cliente</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para cadastrar um novo cliente
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col  gap-4 py-4">
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
            <Button 
              type="button" 
              onClick={createCompany}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}