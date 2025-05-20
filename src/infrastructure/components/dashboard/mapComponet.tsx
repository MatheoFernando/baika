"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MapPin, Calendar, Search, Users, Map, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import instance from "@/src/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Input } from "../../ui/input";
import { ScrollArea } from "../../ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import { Label } from "../../ui/label";
import { BreadcrumbRoutas } from "../ulils/breadcrumbRoutas";

const MapComponent = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRouteAvailable, setIsRouteAvailable] = useState(false);
  const [date, setDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Initialize map
  useEffect(() => {
    if (typeof window !== "undefined" && window.google) {
      const luandaCoords = { lat: -8.8368, lng: 13.2343 }; 
      
      const mapOptions = {
        center: luandaCoords,
        zoom: 14,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      };
      
      const googleMap = new window.google.maps.Map(mapContainerRef.current, mapOptions);
      
      setMap(googleMap);
      
      // Add custom map control for centering
      const centerControlDiv = document.createElement("div");
      const centerControl = createCenterControl(googleMap, luandaCoords);
      centerControlDiv.appendChild(centerControl);
      googleMap.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);
      
      fetchUsers();
    }
  }, []);

  // Custom map control function
  function createCenterControl(map, luandaCoords) {
    const controlButton = document.createElement("button");
    controlButton.classList.add("bg-white", "p-2", "rounded-full", "shadow-md", "m-2");
    controlButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>';
    controlButton.title = "Centralizar mapa";
    
    controlButton.addEventListener("click", () => {
      map.setCenter(luandaCoords);
      map.setZoom(14);
    });
    
    return controlButton;
  }

  // Fetch users data
  async function fetchUsers() {
    try {
      setIsLoading(true);
      const response = await instance.get(`/user?size=500`);
      
      if (response.data && Array.isArray(response.data.data.data)) {
        setUsers(response.data.data.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Erro:", error.message);
      toast.info("Não foi possível obter a lista de supervisores.");
      setIsLoading(false);
    }
  }

  // Fetch geo data for selected user
  async function fetchGeo(id) {
    try {
      setIsLoading(true);
      const formattedDate = date;
      
      const response = await instance.get(`/geoLocation/findUserGeo/${id}?day=${formattedDate.getDate()}&month=${
          formattedDate.getMonth() + 1
        }&year=${formattedDate.getFullYear()}`
      );

      if (response.data.data.length === 0) {
        toast( "Não há dados de geolocalização disponíveis para este usuário na data selecionada.");
        setIsRouteAvailable(false);
        setIsLoading(false);
        return;
      }

      // Clear existing markers
      markers.forEach(marker => {
        if (marker && marker.marker) {
          marker.marker.setMap(null);
        }
      });

      // Add new markers
      const newMarkers = [];
      response.data.data.forEach((markerData) => {
        if (markerData.route && typeof markerData.route === "object") {
          Object.values(markerData.route).forEach((location) => {
            if (location.lat && location.lng) {
              const marker = addMarker(
                location.lat,
                location.lng,
                markerData.name,
                markerData.userId
              );
              if (marker) newMarkers.push(marker);
            }
          });
        }
      });

      toast({
        title: "Dados encontrados",
        description: "Dados de localização carregados com sucesso."
      });

      setMarkers(newMarkers);
      setIsRouteAvailable(newMarkers.length > 0);
      
      // Fit bounds to markers
      if (newMarkers.length > 0 && map) {
        const bounds = new window.google.maps.LatLngBounds();
        
        newMarkers.forEach(markerObj => {
          bounds.extend(markerObj.marker.getPosition());
        });
        
        map.fitBounds(bounds);
        
        // If only one marker, zoom in more
        if (newMarkers.length === 1) {
          map.setZoom(15);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao buscar dados de localização:", error.message);
      toast.info("Erro ao buscar dados de localização.");
      setIsLoading(false);
    }
  }

  // Add marker to map
  function addMarker(locationLat, locationLng, title, employeeId) {
    if (!map) return null;
    
    const position = { lat: locationLat, lng: locationLng };
    
    // Custom marker icon
    const markerIcon = {
      url: '/assets/map-pin.svg', // Use a custom pin icon
      scaledSize: new window.google.maps.Size(30, 30),
      origin: new window.google.maps.Point(0, 0),
      anchor: new window.google.maps.Point(15, 30)
    };
    
    const marker = new window.google.maps.Marker({
      position: position,
      map: map,
      title: title,
      icon: markerIcon
    });

    const infoWindowContent = `
      <div class="p-2">
        <h3 class="font-bold text-base">${title}</h3>
        <p class="text-sm text-gray-600">Posição registrada</p>
        <p class="text-xs text-gray-500">Lat: ${locationLat.toFixed(6)}, Lng: ${locationLng.toFixed(6)}</p>
      </div>
    `;
    
    const infoWindow = new window.google.maps.InfoWindow({
      content: infoWindowContent,
      maxWidth: 250
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    return { marker, employeeId };
  }

  // Show route on map
  async function showRoute() {
    clearRoute();
    
    if (!selectedUser) {
      toast({
        variant: "destructive",
        title: "Nenhum supervisor selecionado",
        description: "Selecione um supervisor para mostrar a rota."
      });
      return;
    }
    
    if (!map || !markers.length) {
      toast({
        variant: "destructive",
        title: "Sem dados de rota",
        description: "Nenhuma rota está disponível para este supervisor na data selecionada."
      });
      return;
    }
    
    const userMarkers = markers.filter(
      (marker) => marker && marker.employeeId === selectedUser.employeeId
    );
    
    if (userMarkers.length === 0) {
      toast({
        variant: "destructive",
        title: "Sem rota",
        description: "Não há rota disponível para este supervisor."
      });
      return;
    }
    
    // Create waypoints for directions
    const waypoints = userMarkers.map((marker) => ({
      location: marker.marker.getPosition(),
    }));

    const directionsService = new window.google.maps.DirectionsService();
    
    const request = {
      origin: waypoints[0].location,
      destination: waypoints[waypoints.length - 1].location,
      waypoints: waypoints.slice(1, -1),
      travelMode: window.google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true
    };

    try {
      directionsService.route(request, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          const rendererOptions = {
            directions: result,
            map: map,
            suppressMarkers: true, // Use custom markers instead
            polylineOptions: {
              strokeColor: "#3b82f6", // Tailwind blue-500
              strokeWeight: 5,
              strokeOpacity: 0.7
            }
          };
          
          const route = new window.google.maps.DirectionsRenderer(rendererOptions);
          setDirectionsRenderer(route);
          
          toast({
            title: "Rota exibida",
            description: "A rota foi calculada e exibida no mapa."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro ao calcular rota",
            description: "Não foi possível calcular a rota entre os pontos."
          });
        }
      });
    } catch (error) {
      console.error("Erro ao calcular a rota:", error);
      toast({
        variant: "destructive",
        title: "Erro ao calcular rota",
        description: "Ocorreu um erro ao tentar calcular a rota."
      });
    }
  }

  // Clear route from map
  function clearRoute() {
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
      setDirectionsRenderer(null);
    }
  }

  // Handle user selection
  function handleUserSelection(user) {
    setSelectedUser(user);
    clearRoute();
    fetchGeo(user.employeeId);
  }

  // Update route
  function handleUpdateRoute() {
    if (!selectedUser) {
      toast({
        variant: "destructive",
        title: "Selecione um supervisor",
        description: "Selecione um supervisor antes de atualizar a rota."
      });
      return;
    }
    
    clearRoute();
    fetchGeo(selectedUser.employeeId);
  }

  // Handle date change
  function handleDateChange(newDate) {
    setDate(newDate);
    if (selectedUser) {
      clearRoute();
      fetchGeo(selectedUser.employeeId);
    }
  }

  // Navigate to online users map
  const openOnlineUsersMap = () => {
    router.push("/mapOnline");
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="p-8">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
    <BreadcrumbRoutas showBackButton productName="Mapas" title="Mapas"/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <Tabs defaultValue="supervisors">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="supervisors">Supervisores</TabsTrigger>
                <TabsTrigger value="options">Opções</TabsTrigger>
              </TabsList>
              
              <TabsContent value="supervisors" className="space-y-4 w-full">
                <CardAction>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex  gap-2">
                      <Users size={18} />
                      Supervisores
                    </CardTitle>
                    <CardDescription>
                      Selecione um supervisor para ver sua rota
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Buscar supervisores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    
                    {isLoading && (
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                      </div>
                    )}
                    
                    {!isLoading && users.length === 0 && (
                      <div className="text-center text-gray-500 p-4">
                        Nenhum supervisor disponível
                      </div>
                    )}
                    
                    {!isLoading && users.length > 0 && (
                      <ScrollArea className="h-[200px] rounded-md border p-2">
                        <RadioGroup 
                          value={selectedUser?.employeeId} 
                          onValueChange={(value) => {
                            const user = users.find(u => u.employeeId === value);
                            if (user) handleUserSelection(user);
                          }}
                        >
                          {filteredUsers.map((user) => (
                            <div key={user.employeeId} className="flex items-center space-x-2 py-2">
                              <RadioGroupItem 
                                value={user.employeeId} 
                                id={`user-${user.employeeId}`} 
                              />
                              <Label htmlFor={`user-${user.employeeId}`} className="w-full cursor-pointer">
                                {user.name}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </ScrollArea>
                    )}
                  </CardContent>
                </CardAction>
              </TabsContent>
              
              <TabsContent value="options" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar size={18} />
                      Data
                    </CardTitle>
                    <CardDescription>
                      Selecione uma data para visualizar a rota
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={handleDateChange}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <Card>
              <CardContent className="pt-6 space-y-2">
                <Button 
                  variant="default" 
                  className="w-full" 
                  onClick={handleUpdateRoute}
                  disabled={!selectedUser}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar Rota
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={showRoute}
                  disabled={!isRouteAvailable}
                >
                  <Map className="mr-2 h-4 w-4" />
                  Mostrar Rota
                </Button>
                
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  onClick={openOnlineUsersMap}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Supervisores Online
                </Button>
              </CardContent>
            </Card>
            
            {selectedUser && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Detalhes do Supervisor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Nome:</span> {selectedUser.name}
                    </div>
                    <div>
                      <span className="font-medium">ID:</span> {selectedUser.employeeId}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      <Badge variant={isRouteAvailable ? "success" : "destructive"}>
                        {isRouteAvailable ? "Rota disponível" : "Sem rota"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-8rem)]">
              <CardContent className="p-0">
                <div 
                  ref={mapContainerRef} 
                  className="w-full h-full rounded-md overflow-hidden"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MapComponent;