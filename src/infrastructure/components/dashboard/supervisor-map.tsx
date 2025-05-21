"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { format, isToday, isYesterday, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { APIProvider, Map, useMap, useMapsLibrary, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps"
import {
  Calendar,
  CalendarIcon,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  MapPin,
  RefreshCw,
  Route,
  Search,
  User,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react"
import { cn } from "@/src/lib/utils"
import { Button } from "../../ui/button"
import { Label } from "../../ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Input } from "../../ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { ScrollArea } from "../../ui/scroll-area"
import { Separator } from "../../ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../../ui/sheet"
import instance from "@/src/lib/api"
import { toast } from "sonner"
import { Switch } from "../../ui/switch"

interface Supervisor {
  employeeId: string
  userId: string
  name: string
  lat?: number
  lng?: number
  time?: string
  route?: Record<string, { lat: number; lng: number }>
}

interface MarkerWithInfo {
  marker: google.maps.Marker
  employeeId: string
}


const LUANDA_COORDS = { lat: -8.8368, lng: 13.2343 }
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
const ONLINE_THRESHOLD_MINUTES = 15

// Helper Components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-40">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
)

const MapDirectionsRenderer = ({
  origin,
  destination,
  waypoints,
}: {
  origin: google.maps.LatLng
  destination: google.maps.LatLng
  waypoints: google.maps.DirectionsWaypoint[]
}) => {
  const map = useMap()
  const routesLibrary = useMapsLibrary("routes")
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null)

  useEffect(() => {
    if (!routesLibrary || !map) return

    const renderer = new routesLibrary.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#3b82f6",
        strokeWeight: 5,
        strokeOpacity: 0.7,
      },
    })

    setDirectionsRenderer(renderer)

    return () => {
      if (renderer) renderer.setMap(null)
    }
  }, [routesLibrary, map])

  useEffect(() => {
    if (!routesLibrary || !directionsRenderer || !origin || !destination) return

    const directionsService = new routesLibrary.DirectionsService()

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result)
        }
      },
    )

    return () => {
      if (directionsRenderer) directionsRenderer.setMap(null)
    }
  }, [routesLibrary, directionsRenderer, origin, destination, waypoints])

  return null
}

const SupervisorMarker = ({
  user,
  isSelected,
  onClick,
}: {
  user: Supervisor
  isSelected: boolean
  onClick: () => void
}) => {
  const [showInfo, setShowInfo] = useState(false)
  const isOnline = useMemo(() => isUserOnline(user), [user])

  if (!user.lat || !user.lng) return null

  return (
    <AdvancedMarker
      position={{ lat: user.lat, lng: user.lng }}
      onClick={() => {
        setShowInfo(true)
        onClick()
      }}
      zIndex={isSelected ? 999 : isOnline ? 100 : 10}
    >
      <div className={cn("relative flex items-center justify-center", isSelected && "scale-125 z-50")}>
        <div className={cn("rounded-full p-2 shadow-md", isOnline ? "bg-green-500" : "bg-red-500")}>
          <MapPin className="h-5 w-5 text-white" />
        </div>
        {isOnline && (
          <span className="absolute -top-1 -right-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </span>
        )}
      </div>

      {showInfo && (
        <InfoWindow position={{ lat: user.lat, lng: user.lng }} onCloseClick={() => setShowInfo(false)}>
          <div className="p-2 max-w-[200px]">
            <h3 className="font-medium text-sm">{user.name}</h3>
            <div className="flex items-center mt-1 text-xs">
              {isOnline ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  <span>Online</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Visto: {formatLastSeen(user.time)}</span>
                </div>
              )}
            </div>
          </div>
        </InfoWindow>
      )}
    </AdvancedMarker>
  )
}

// Helper Functions
const isUserOnline = (user: Supervisor): boolean => {
  if (!user?.time) return false

  const userTime = new Date(user.time)
  const currentTime = new Date()
  const diffInMinutes = (currentTime.getTime() - userTime.getTime()) / (1000 * 60)

  return diffInMinutes <= ONLINE_THRESHOLD_MINUTES
}

const formatLastSeen = (timeString?: string): string => {
  if (!timeString) return "Desconhecido"

  const date = new Date(timeString)

  if (isToday(date)) {
    return `Hoje às ${format(date, "HH:mm")}`
  } else if (isYesterday(date)) {
    return `Ontem às ${format(date, "HH:mm")}`
  } else {
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }
}

const wasUserOnlineOnDate = (user: Supervisor, date: Date): boolean => {
  if (!user?.time) return false

  const userTime = new Date(user.time)

  return (
    userTime.getDate() === date.getDate() &&
    userTime.getMonth() === date.getMonth() &&
    userTime.getFullYear() === date.getFullYear()
  )
}

// Main Component
export default function SupervisorMap() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"routes" | "online">("routes")
  const [users, setUsers] = useState<Supervisor[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Supervisor[]>([])
  const [selectedUser, setSelectedUser] = useState<Supervisor | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showRouteButton, setShowRouteButton] = useState(false)
  const [showRoute, setShowRoute] = useState(false)
  const [markers, setMarkers] = useState<{ lat: number; lng: number }[]>([])
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const [showOfflineOnly, setShowOfflineOnly] = useState(false)
  const [showInfoCards, setShowInfoCards] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Fetch users data
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await instance.get(`/user?size=500`)

      if (response.data && Array.isArray(response.data.data.data)) {
        setUsers(response.data.data.data)
        setFilteredUsers(response.data.data.data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast()
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Fetch geolocation data for a specific user
  const fetchGeoLocation = useCallback(
    async (user: Supervisor) => {
      if (!user) return

      try {
        setIsLoading(true)
        const response = await axios.get( `/geoLocation/findUserGeo/${user.employeeId}?day=${selectedDate.getDate()}&month=${
            selectedDate.getMonth() + 1
          }&year=${selectedDate.getFullYear()}`,
        )

        if (response.data.data.length === 0) {
          toast.info()
          return
        }

        const routePoints: { lat: number; lng: number }[] = []

        response.data.data.forEach((markerData: any) => {
          if (markerData.route && typeof markerData.route === "object") {
            Object.values(markerData.route).forEach((location: any) => {
              if (location.lat && location.lng) {
                routePoints.push({ lat: location.lat, lng: location.lng })
              }
            })
          }
        })

        if (routePoints.length > 0) {
          setMarkers(routePoints)
          setShowRouteButton(true)
          toast()
        } else {
          toast()
        }
      } catch (error) {
        console.error("Error fetching geolocation:", error)
        toast.info()
      } finally {
        setIsLoading(false)
      }
    },
    [selectedDate, toast],
  )

  // Fetch all users' last positions
  const fetchAllUsersPositions = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await instance.get(`/geolocation/findAllUserLastPosition`)

      if (response.data && Array.isArray(response.data.data)) {
        setUsers(response.data.data)
        applyFilters(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching all users positions:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as posições dos supervisores",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Apply filters to users
  const applyFilters = useCallback(
    (usersToFilter: Supervisor[]) => {
      if (!usersToFilter || !Array.isArray(usersToFilter)) return

      let result = [...usersToFilter]

      // Search term filter
      if (searchTerm && searchTerm.trim().length >= 2) {
        result = result.filter((user) => user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
      }

      // Online/offline filter
      if (showOnlineOnly) {
        result = result.filter((user) => isUserOnline(user))
      } else if (showOfflineOnly) {
        result = result.filter((user) => !isUserOnline(user))
      }

      // Date filter (for online tab)
      if (activeTab === "online" && selectedDate) {
        result = result.filter((user) => wasUserOnlineOnDate(user, selectedDate))
      }

      setFilteredUsers(result)
    },
    [searchTerm, showOnlineOnly, showOfflineOnly, activeTab, selectedDate],
  )

  // Initial data loading
  useEffect(() => {
    if (activeTab === "routes") {
      fetchUsers()
    } else {
      fetchAllUsersPositions()
    }
  }, [activeTab, fetchUsers, fetchAllUsersPositions])

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters(users)
  }, [users, applyFilters])

  // Handle user selection
  useEffect(() => {
    if (selectedUser && activeTab === "routes") {
      fetchGeoLocation(selectedUser)
    }
  }, [selectedUser, selectedDate, activeTab, fetchGeoLocation])

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as "routes" | "online")
    setSelectedUser(null)
    setShowRoute(false)
    setMarkers([])
    setShowRouteButton(false)
  }

  // Handle user selection
  const handleUserSelection = (user: Supervisor) => {
    setSelectedUser(user)
    setShowRoute(false)
  }

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      if (selectedUser && activeTab === "routes") {
        setShowRoute(false)
        fetchGeoLocation(selectedUser)
      } else if (activeTab === "online") {
        applyFilters(users)
      }
    }
  }

  // Toggle route display
  const toggleRoute = () => {
    setShowRoute(!showRoute)
  }

  // Refresh data
  const refreshData = () => {
    if (activeTab === "routes") {
      if (selectedUser) {
        fetchGeoLocation(selectedUser)
      } else {
        fetchUsers()
      }
    } else {
      fetchAllUsersPositions()
    }
  }

  // Toggle online filter
  const toggleOnlineFilter = () => {
    setShowOnlineOnly(true)
    setShowOfflineOnly(false)
  }

  // Toggle offline filter
  const toggleOfflineFilter = () => {
    setShowOfflineOnly(true)
    setShowOnlineOnly(false)
  }

  // Show all users
  const showAllUsers = () => {
    setShowOnlineOnly(false)
    setShowOfflineOnly(false)
  }

  // Toggle info cards
  const toggleInfoCards = () => {
    setShowInfoCards(!showInfoCards)
  }

  // Set today's date
  const setToday = () => {
    setSelectedDate(new Date())
  }

  // Set yesterday's date
  const setYesterday = () => {
    setSelectedDate(subDays(new Date(), 1))
  }

  // Count online users
  const onlineUsersCount = useMemo(() => filteredUsers.filter((user) => isUserOnline(user)).length, [filteredUsers])

  // Count offline users
  const offlineUsersCount = useMemo(() => filteredUsers.filter((user) => !isUserOnline(user)).length, [filteredUsers])

  // Prepare waypoints for route
  const routeWaypoints = useMemo(() => {
    if (!markers.length || markers.length < 2) return null

    const origin = new google.maps.LatLng(markers[0].lat, markers[0].lng)
    const destination = new google.maps.LatLng(markers[markers.length - 1].lat, markers[markers.length - 1].lng)

    const waypoints = markers.slice(1, -1).map((point) => ({
      location: new google.maps.LatLng(point.lat, point.lng),
      stopover: true,
    }))

    return { origin, destination, waypoints }
  }, [markers])

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-background z-10">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Filtros e Opções</SheetTitle>
                  <SheetDescription>Selecione supervisores e visualize suas rotas</SheetDescription>
                </SheetHeader>
                <div className="p-4">{renderSidebar()}</div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold">
              {activeTab === "routes" ? "Rotas dos Supervisores" : "Supervisores Online"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshData} className="gap-1">
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex md:w-[300px] lg:w-[350px] flex-col border-r bg-background">
          {renderSidebar()}
        </div>

        <div className="flex-1 relative">
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              defaultCenter={LUANDA_COORDS}
              defaultZoom={13}
              gestureHandling="greedy"
              mapId="supervisor-map"
              className="w-full h-full"
            >
              {/* Render markers for online tab */}
              {activeTab === "online" &&
                filteredUsers.map((user) => (
                  <SupervisorMarker
                    key={user.userId}
                    user={user}
                    isSelected={selectedUser?.userId === user.userId}
                    onClick={() => handleUserSelection(user)}
                  />
                ))}

              {/* Render markers for routes tab */}
              {activeTab === "routes" &&
                markers.map((marker, index) => (
                  <AdvancedMarker
                    key={`route-${index}`}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    zIndex={index === 0 ? 999 : index === markers.length - 1 ? 998 : 10}
                  >
                    <div
                      className={cn(
                        "rounded-full p-1.5 shadow-md",
                        index === 0 ? "bg-green-500" : index === markers.length - 1 ? "bg-red-500" : "bg-blue-500",
                      )}
                    >
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                  </AdvancedMarker>
                ))}

              {/* Render route */}
              {showRoute && routeWaypoints && (
                <MapDirectionsRenderer
                  origin={routeWaypoints.origin}
                  destination={routeWaypoints.destination}
                  waypoints={routeWaypoints.waypoints}
                />
              )}
            </Map>
          </APIProvider>

          {/* Mobile action buttons */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 md:hidden">
            {activeTab === "routes" && showRouteButton && (
              <Button
                onClick={toggleRoute}
                className="rounded-full shadow-lg"
                variant={showRoute ? "default" : "outline"}
              >
                <Route className="h-4 w-4 mr-2" />
                {showRoute ? "Ocultar Rota" : "Mostrar Rota"}
              </Button>
            )}

            {activeTab === "online" && (
              <Button
                onClick={toggleInfoCards}
                className="rounded-full shadow-lg"
                variant={showInfoCards ? "default" : "outline"}
              >
                {showInfoCards ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Ocultar Cards
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Mostrar Cards
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Render sidebar content
  function renderSidebar() {
    return (
      <div className="flex flex-col h-full">
        <Tabs defaultValue="routes" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="routes" className="flex-1">
                <Route className="h-4 w-4 mr-2" />
                Rotas
              </TabsTrigger>
              <TabsTrigger value="online" className="flex-1">
                <UserCheck className="h-4 w-4 mr-2" />
                Online
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="routes" className="flex-1 flex flex-col p-0">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-supervisor">Buscar supervisor</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-supervisor"
                    placeholder="Nome do supervisor..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Selecionar data</Label>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={setToday} className="h-7 text-xs">
                      Hoje
                    </Button>
                    <Button variant="outline" size="sm" onClick={setYesterday} className="h-7 text-xs">
                      Ontem
                    </Button>
                  </div>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, "PPP", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={selectedDate} onSelect={handleDateChange} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Supervisores ({filteredUsers.length})</Label>
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <ScrollArea className="h-[250px] rounded-md border">
                    <div className="p-4 space-y-2">
                      {filteredUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhum supervisor encontrado</p>
                      ) : (
                        filteredUsers.map((user) => (
                          <div
                            key={user.employeeId}
                            className={cn(
                              "flex items-center space-x-2 rounded-md p-2 cursor-pointer hover:bg-muted",
                              selectedUser?.employeeId === user.employeeId && "bg-muted",
                            )}
                            onClick={() => handleUserSelection(user)}
                          >
                            <div
                              className={cn(
                                "rounded-full p-1",
                                selectedUser?.employeeId === user.employeeId ? "bg-primary" : "bg-muted-foreground/20",
                              )}
                            >
                              <User
                                className={cn(
                                  "h-4 w-4",
                                  selectedUser?.employeeId === user.employeeId
                                    ? "text-primary-foreground"
                                    : "text-muted-foreground",
                                )}
                              />
                            </div>
                            <span className="text-sm">{user.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {showRouteButton && (
                <Button onClick={toggleRoute} className="w-full" variant={showRoute ? "default" : "outline"}>
                  <Route className="h-4 w-4 mr-2" />
                  {showRoute ? "Ocultar Rota" : "Mostrar Rota"}
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="online" className="flex-1 flex flex-col p-0">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-online">Buscar supervisor</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-online"
                    placeholder="Nome do supervisor..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Filtros</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={showOnlineOnly ? "default" : "outline"}
                    onClick={toggleOnlineFilter}
                    className="gap-1"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Online
                  </Button>
                  <Button
                    size="sm"
                    variant={showOfflineOnly ? "default" : "outline"}
                    onClick={toggleOfflineFilter}
                    className="gap-1"
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                    Offline
                  </Button>
                  <Button
                    size="sm"
                    variant={!showOnlineOnly && !showOfflineOnly ? "default" : "outline"}
                    onClick={showAllUsers}
                    className="gap-1"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Todos
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-cards">Mostrar cards</Label>
                  <Switch id="show-cards" checked={showInfoCards} onCheckedChange={toggleInfoCards} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Filtrar por data</Label>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={setToday} className="h-7 text-xs">
                      Hoje
                    </Button>
                    <Button variant="outline" size="sm" onClick={setYesterday} className="h-7 text-xs">
                      Ontem
                    </Button>
                  </div>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, "PPP", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={selectedDate} onSelect={handleDateChange} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <Badge variant="outline">{filteredUsers.length}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Online:</span>
                      <Badge variant="success" className="bg-green-500">
                        {onlineUsersCount}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Offline:</span>
                      <Badge variant="destructive">{offlineUsersCount}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }
}
