"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/infrastructure/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/infrastructure/ui/card";
import { Skeleton } from "@/src/infrastructure/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/infrastructure/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/infrastructure/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/src/infrastructure/ui/pagination";
import { Search, MoreHorizontal, Plus, Edit, Trash, List } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/src/infrastructure/ui/input";
import { Button } from "@/src/infrastructure/ui/button";
import instance from "@/src/lib/api";

export default function CompanySiteDataTable() {
  const router = useRouter();
  const [siteList, setSiteList] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [isEditSiteModalOpen, setIsEditSiteModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Form state
  const [newSite, setNewSite] = useState({
    clientCode: "",
    name: "",
    address: "",
    mec: "",
    ctClient: "",
  });

  // Fetch sites data
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setLoading(true);
        const response = await instance.get(`/companySite?size=500`);
        const clientCode = localStorage.getItem("selectedClientCode");
        const fetchedSites = response.data.data.data.filter(
          (site) => site.clientCode === clientCode
        );
        setSiteList(fetchedSites);
        setFilteredSites(fetchedSites);
        setTotalPages(Math.ceil(fetchedSites.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching sites:", error);
        toast.error("Failed to load sites");
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, [itemsPerPage]);

  // Filter sites based on search term
  useEffect(() => {
    const filtered = siteList.filter(
      (site) =>
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (site.address && site.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredSites(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [searchTerm, siteList, itemsPerPage]);

  // Get paginated data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSites.slice(startIndex, endIndex);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSite((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle adding a new site
  const handleAddSite = async () => {
    try {
      const clientCode = localStorage.getItem("selectedClientCode");
      newSite.clientCode = clientCode;
      
      const response = await instance.post(
        `/companySite/create/${clientCode}/1162`,
        {
          name: newSite.name,
          address: newSite.address,
          location: {},
          mec: newSite.mec,
          ctClient: newSite.ctClient,
        }
      );
      
      setSiteList((prevList) => [...prevList, response.data.data]);
      toast.success("Site added successfully!");
      setIsAddSiteModalOpen(false);
      
      // Reset form
      setNewSite({
        clientCode: "",
        name: "",
        address: "",
        mec: "",
        ctClient: "",
      });
    } catch (error) {
      console.error("Error adding site:", error);
      toast.error("Failed to add site. Please try again.");
    }
  };

  // Handle editing a site
  const handleEditSite = (site) => {
    setSelectedSite(site);
    setNewSite({
      clientCode: site.clientCode,
      name: site.name,
      address: site.address || "",
      mec: site.mec || "",
      ctClient: site.ctClient || "",
    });
    setIsEditSiteModalOpen(true);
  };

  // Handle updating a site
  const handleUpdateSite = async () => {
    try {
      const clientCode = localStorage.getItem("selectedClientCode");
      const response = await instance.put(
        `/companySite/update/${selectedSite._id}/${clientCode}`,
        {
          name: newSite.name,
          address: newSite.address,
          mec: newSite.mec,
          ctClient: newSite.ctClient,
        }
      );
      
      setSiteList((prevList) =>
        prevList.map((site) =>
          site._id === selectedSite._id ? { ...site, ...newSite } : site
        )
      );
      
      toast.success("Site updated successfully!");
      setIsEditSiteModalOpen(false);
    } catch (error) {
      console.error("Error updating site:", error);
      toast.error("Failed to update site. Please try again.");
    }
  };

  // Handle deleting a site
  const handleDeleteSite = async (siteId) => {
    try {
      const clientCode = localStorage.getItem("selectedClientCode");
      await axios.delete(`/companySite/delete/${siteId}/${clientCode}`);
      
      setSiteList((prevList) => prevList.filter((site) => site._id !== siteId));
      toast.success("Site deleted successfully!");
    } catch (error) {
      console.error("Error deleting site:", error);
      toast.error("Failed to delete site. Please try again.");
    }
  };

  // Navigate to equipment list for a site
  const navigateToEquipment = (siteId) => {
    router.push(`/equipmentList?costCenter=${siteId}`);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="container py-6 mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full mb-4" />
        <div className="rounded-md border">
          <div className="h-[400px] relative">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex p-4 border-b">
                <Skeleton className="h-6 w-1/4 mr-4" />
                <Skeleton className="h-6 w-1/4 mr-4" />
                <Skeleton className="h-6 w-1/4 mr-4" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="h-10 w-full mt-4" />
      </div>
    );
  }

  return (
    <div className="container py-6 mx-auto max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Lista dos sites</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
             Adicionar Site
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Adicionar Site</AlertDialogTitle>
              <AlertDialogDescription>
                Enter site details below
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="flex flex-col gap-6 py-4">
              <div className="space-y-6">
                <label htmlFor="name" className="text-right">
                  Name:
                </label>
                <Input
                  id="name"
                  name="name"
                  value={newSite.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
                          <div className="space-y-6">

                <label htmlFor="address" className="text-right">
                  Address:
                </label>
                <Input
                  id="address"
                  name="address"
                  value={newSite.address}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="space-y-6">
                <label htmlFor="ctClient" className="text-right">
                  CT Client:
                </label>
                <Input
                  id="ctClient"
                  name="ctClient"
                  value={newSite.ctClient}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleAddSite}>Adicionar site</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Search */}
      <div className="flex items-center py-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="pesquisar por site..."
            className="pl-8 max-w-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getCurrentPageData().length > 0 ? (
              getCurrentPageData().map((site) => (
                <TableRow key={site._id}>
                  <TableCell className="font-medium">{site.numberOfWorkers}</TableCell>
                  <TableCell>{site.name}</TableCell>
                  <TableCell className="text-right">
                 
                     
                       <div className="flex gap-2">
                         <Button 
                         variant={"default"}
                         onClick={() => handleEditSite(site)}>
                          <Edit />
                        </Button>
                        <Button 
                         variant={"default"}
                          className="text-red-600"

                          onClick={() => handleDeleteSite(site._id)}
                        >
                          <Trash />
                        </Button>
                       </div>
                    
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No sites found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {filteredSites.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
          {Math.min(currentPage * itemsPerPage, filteredSites.length)} of {filteredSites.length} sites
        </div>
        <Pagination>
          <PaginationContent>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
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
                  (page === 2 && currentPage > 3) ||
                  (page === totalPages - 1 && currentPage < totalPages - 2)
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

      {/* Edit Site Modal */}
      <AlertDialog open={isEditSiteModalOpen} onOpenChange={setIsEditSiteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Site</AlertDialogTitle>
            <AlertDialogDescription>
              Update site details below
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-name" className="text-right">
                Name:
              </label>
              <Input
                id="edit-name"
                name="name"
                value={newSite.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-address" className="text-right">
                Address:
              </label>
              <Input
                id="edit-address"
                name="address"
                value={newSite.address}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-mec" className="text-right">
                MEC:
              </label>
              <Input
                id="edit-mec"
                name="mec"
                value={newSite.mec}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-ctClient" className="text-right">
                CT Client:
              </label>
              <Input
                id="edit-ctClient"
                name="ctClient"
                value={newSite.ctClient}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateSite}>Save Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}