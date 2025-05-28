"use client"

import { useCallback, useEffect, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { TrendingUp } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Bar, BarChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../ui/chart"
import instance from "@/src/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs"
import { Skeleton } from "../../ui/skeleton"


function OccurrencesChart({ data }: { data: any[] }) {
  const chartConfig = {
    occurrences: {
      label: "Ocorrências",
      color: "hsl(var(--chart-1))",
    },
  }

  const filteredData = data.filter((item) => item.occurrences > 0)

  if (filteredData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        Nenhuma ocorrência registrada neste período
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart accessibilityLayer data={filteredData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="hour" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
          <Bar dataKey="occurrences" fill="var(--color-occurrences)" radius={4} name="Ocorrências" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

// Componente do gráfico de supervisões
function SupervisionsChart({ data }: { data: any[] }) {
  const chartConfig = {
    supervisions: {
      label: "Supervisões",
      color: "hsl(var(--chart-2))",
    },
  }

  const filteredData = data.filter((item) => item.supervisions > 0)

  if (filteredData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        Nenhuma supervisão registrada neste período
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          accessibilityLayer
          data={filteredData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
          <Area
            dataKey="supervisions"
            type="natural"
            fill="var(--color-supervisions)"
            fillOpacity={0.4}
            stroke="var(--color-supervisions)"
            name="Supervisões"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export default function AnalyticsView() {
  const [occurrencesTimeFilter, setOccurrencesTimeFilter] = useState("day")
  const [supervisionsTimeFilter, setSupervisionsTimeFilter] = useState("day")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [occurrences, setOccurrences] = useState<any[]>([])
  const [supervisions, setSupervisions] = useState<any[]>([])
  const [occurrencesHourlyData, setOccurrencesHourlyData] = useState<any[]>([])
  const [supervisionsHourlyData, setSupervisionsHourlyData] = useState<any[]>([])

  // Função para buscar ocorrências
  const fetchOccurrences = useCallback(async () => {
    try {
      setLoading(true)
      const response = await instance.get(`/occurrence?size=10000`)
      const formattedOccurrences = response.data.data.data.map((occurrence: any) => {
        const createdAtDate = new Date(occurrence.createdAt)
        return {
          ...occurrence,
          createdAt: format(createdAtDate, "dd/MM/yyyy"),
          createdAtTime: format(createdAtDate, "HH:mm"),
          createdAtDate: createdAtDate,
          supervisorName: occurrence.supervisorName || "Carregando...",
          siteName: occurrence.name || "Carregando...",
        }
      })
      setOccurrences(formattedOccurrences)

      // Processar dados por hora para o gráfico
      processHourlyData(formattedOccurrences, "occurrences", occurrencesTimeFilter)
    } catch (error: any) {
      console.error("Error fetching occurrences:", error.message)
      toast.error("Erro ao carregar ocorrências")
    } finally {
      setLoading(false)
    }
  }, [occurrencesTimeFilter])

  // Função para buscar supervisões
  const fetchSupervisions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await instance.get(`/supervision?size=10000`)

      const formattedSupervisions = response.data.data.data.map((supervision: any) => {
        const createdAtDate = new Date(supervision.createdAt)
        return {
          ...supervision,
          createdAt: format(createdAtDate, "dd/MM/yyyy"),
          createdAtTime: format(createdAtDate, "HH:mm"),
          createdAtDate: createdAtDate,
          supervisorName: supervision.supervisorName || "Carregando...",
          siteName: supervision.name || "Carregando...",
        }
      })

      setSupervisions(formattedSupervisions)

      // Processar dados por hora para o gráfico
      processHourlyData(formattedSupervisions, "supervisions", supervisionsTimeFilter)
    } catch (error: any) {
      console.error("Error fetching supervisions:", error.message)
      toast.error("Erro ao carregar supervisões")
    } finally {
      setLoading(false)
    }
  }, [supervisionsTimeFilter])

  // Função para processar dados por hora
  const processHourlyData = (data: any[], type: string, timeFilter: string) => {
    // Filtrar dados com base no timeFilter
    const filteredData = filterDataByTime(data, timeFilter)

    // Agrupar por hora
    const hourlyGroups: Record<string, number> = {}

    // Inicializar todas as horas com 0
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, "0")
      hourlyGroups[hour] = 0
    }

    // Contar ocorrências/supervisões por hora
    filteredData.forEach((item) => {
      const hour = format(new Date(item.createdAtDate), "HH")
      hourlyGroups[hour] = (hourlyGroups[hour] || 0) + 1
    })

    // Converter para formato de array para o gráfico
    const hourlyArray = Object.entries(hourlyGroups).map(([hour, count]) => ({
      hour: `${hour}:00`,
      [type]: count,
    }))

    if (type === "occurrences") {
      setOccurrencesHourlyData(hourlyArray)
    } else {
      setSupervisionsHourlyData(hourlyArray)
    }
  }

  // Função para filtrar dados com base no timeFilter
  const filterDataByTime = (data: any[], timeFilter: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    switch (timeFilter) {
      case "day":
        return data.filter((item) => {
          const date = new Date(item.createdAtDate)
          return date >= today
        })
      case "yesterday":
        return data.filter((item) => {
          const date = new Date(item.createdAtDate)
          return date >= yesterday && date < today
        })
      case "week":
        return data.filter((item) => {
          const date = new Date(item.createdAtDate)
          return date >= weekAgo
        })
      case "month":
        return data.filter((item) => {
          const date = new Date(item.createdAtDate)
          return date >= monthAgo
        })
      default:
        return data
    }
  }

  // Efeito para carregar dados iniciais
  useEffect(() => {
    fetchOccurrences()
    fetchSupervisions()
  }, [fetchOccurrences, fetchSupervisions])

  // Efeito para atualizar dados de ocorrências quando o filtro mudar
  useEffect(() => {
    if (occurrences.length > 0) {
      processHourlyData(occurrences, "occurrences", occurrencesTimeFilter)
    }
  }, [occurrencesTimeFilter, occurrences])

  // Efeito para atualizar dados de supervisões quando o filtro mudar
  useEffect(() => {
    if (supervisions.length > 0) {
      processHourlyData(supervisions, "supervisions", supervisionsTimeFilter)
    }
  }, [supervisionsTimeFilter, supervisions])

  // Função para obter o título do período
  const getPeriodTitle = (timeFilter: string) => {
    switch (timeFilter) {
      case "day":
        return format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
      case "yesterday":
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return format(yesterday, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
      case "week":
        return `Últimos 7 dias`
      case "month":
        return `Últimos 30 dias`
      default:
        return format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    }
  }

  return (
    <div className="flex flex-col gap-4 ">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
     
        {/* Card de Supervisões */}
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Supervisões</CardTitle>
              <CardDescription>{getPeriodTitle(supervisionsTimeFilter)}</CardDescription>
            </div>
            <Tabs value={supervisionsTimeFilter} onValueChange={setSupervisionsTimeFilter}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="day">Hoje</TabsTrigger>
                <TabsTrigger value="yesterday">Ontem</TabsTrigger>
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="month">Mês</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[300px] w-full" /> : <SupervisionsChart data={supervisionsHourlyData} />}
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Total: {filterDataByTime(supervisions, supervisionsTimeFilter).length} supervisões
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">Distribuição por hora no período selecionado</div>
          </CardFooter>
        </Card>
           {/* Card de Ocorrências */}
        <Card className="w-full shadow-sm border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Ocorrências</CardTitle>
              <CardDescription>{getPeriodTitle(occurrencesTimeFilter)}</CardDescription>
            </div>
            <Tabs value={occurrencesTimeFilter} onValueChange={setOccurrencesTimeFilter}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="day">Hoje</TabsTrigger>
                <TabsTrigger value="yesterday">Ontem</TabsTrigger>
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="month">Mês</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[300px] w-full" /> : <OccurrencesChart data={occurrencesHourlyData} />}
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Total: {filterDataByTime(occurrences, occurrencesTimeFilter).length} ocorrências
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">Distribuição por hora no período selecionado</div>
          </CardFooter>
        </Card>

      </div>
    </div>
  )
}
