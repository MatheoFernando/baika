"use client"
import React, { useState, useEffect, useMemo } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts"

import { CalendarDays, Clock, User, Filter } from "lucide-react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../../ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import instance from "@/src/lib/api"

const chartConfig = {
  supervisions: {
    label: "Supervisões",
    color: "#3b82f6",
  },
  hours: {
    label: "Horas",
    color: "#1f2937",
  },
} satisfies ChartConfig

export default function SupervisionAnalytics() {
  const [supervisions, setSupervisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedSupervisor, setSelectedSupervisor] = useState("all")
  const [activeChart, setActiveChart] = useState("supervisions")

  // Busca os dados de supervisões
  const fetchSupervisions = async () => {
    try {
      setLoading(true)
      const response = await instance.get(`/admin/supervision?size=1&page=1`)
      console.log("Supervisions Response:", response.data)
      setSupervisions(
        Array.isArray(response.data?.data) ? response.data.data : []
      )
    } catch (err) {
      console.error("Error fetching supervisions:", err)
      setError("Erro ao carregar supervisões.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSupervisions()
  }, [])

  // Processar dados para o gráfico mensal
  const monthlyData = useMemo(() => {
    if (!supervisions.length) return []

    const months = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ]

    const filteredData = supervisions.filter(supervision => {
      const date = new Date(supervision.created_at || supervision.date)
      const year = date.getFullYear().toString()
      
      if (year !== selectedYear) return false
      if (selectedSupervisor !== "all" && supervision.supervisor_name !== selectedSupervisor) return false
      
      return true
    })

    const monthlyStats = months.map((month, index) => {
      const monthSupervisions = filteredData.filter(supervision => {
        const date = new Date(supervision.created_at || supervision.date)
        return date.getMonth() === index
      })

      const totalHours = monthSupervisions.reduce((acc, supervision) => {
        return acc + (supervision.duration_hours || supervision.hours || 1)
      }, 0)

      return {
        month,
        supervisions: monthSupervisions.length,
        hours: totalHours,
        date: `${selectedYear}-${String(index + 1).padStart(2, '0')}-01`
      }
    })

    return monthlyStats
  }, [supervisions, selectedYear, selectedSupervisor])

  // Ranking de supervisores
  const supervisorRanking = useMemo(() => {
    if (!supervisions.length) return []

    const supervisorStats = {}

    supervisions.forEach(supervision => {
      const date = new Date(supervision.created_at || supervision.date)
      const year = date.getFullYear().toString()
      
      if (year !== selectedYear) return

      const name = supervision.supervisor_name || supervision.supervisor || "Supervisor Desconhecido"
      
      if (!supervisorStats[name]) {
        supervisorStats[name] = {
          name,
          totalSupervisions: 0,
          totalHours: 0,
          months: new Set()
        }
      }

      supervisorStats[name].totalSupervisions += 1
      supervisorStats[name].totalHours += supervision.duration_hours || supervision.hours || 1
      supervisorStats[name].months.add(date.getMonth())
    })

    return Object.values(supervisorStats)
      .sort((a, b) => b.totalSupervisions - a.totalSupervisions)
      .slice(0, 10)
  }, [supervisions, selectedYear])

  // Anos disponíveis
  const availableYears = useMemo(() => {
    const years = new Set()
    supervisions.forEach(supervision => {
      const date = new Date(supervision.created_at || supervision.date)
      years.add(date.getFullYear().toString())
    })
    return Array.from(years).sort().reverse()
  }, [supervisions])

  // Supervisores disponíveis
  const availableSupervisors = useMemo(() => {
    const supervisors = new Set()
    supervisions.forEach(supervision => {
      const name = supervision.supervisor_name || supervision.supervisor
      if (name) supervisors.add(name)
    })
    return Array.from(supervisors).sort()
  }, [supervisions])

  const totalStats = useMemo(() => {
    const filtered = supervisions.filter(supervision => {
      const date = new Date(supervision.created_at || supervision.date)
      const year = date.getFullYear().toString()
      
      if (year !== selectedYear) return false
      if (selectedSupervisor !== "all" && supervision.supervisor_name !== selectedSupervisor) return false
      
      return true
    })

    return {
      supervisions: filtered.length,
      hours: filtered.reduce((acc, supervision) => {
        return acc + (supervision.duration_hours || supervision.hours || 1)
      }, 0)
    }
  }, [supervisions, selectedYear, selectedSupervisor])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Carregando dados de supervisão...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchSupervisions}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Ano</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Supervisor</label>
            <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Supervisores</SelectItem>
                {availableSupervisors.map(supervisor => (
                  <SelectItem key={supervisor} value={supervisor}>{supervisor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico Principal */}
      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Análise de Supervisões - {selectedYear}</CardTitle>
            <CardDescription>
              Atividades dos supervisores ao longo dos meses
            </CardDescription>
          </div>
          <div className="flex">
            {[
              { key: "supervisions", label: "Supervisões", icon: CalendarDays },
              { key: "hours", label: "Horas", icon: Clock }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                data-active={activeChart === key}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(key)}
              >
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  {label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {totalStats[key].toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={monthlyData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[180px]"
                    labelFormatter={(value, payload) => {
                      if (payload && payload[0]) {
                        return `${payload[0].payload.month} ${selectedYear}`
                      }
                      return value
                    }}
                  />
                }
              />
              <Line
                dataKey={activeChart}
                type="monotone"
                stroke={chartConfig[activeChart].color}
                strokeWidth={3}
                dot={{ fill: chartConfig[activeChart].color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: chartConfig[activeChart].color, strokeWidth: 2 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Ranking de Supervisores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Ranking de Supervisores - {selectedYear}
          </CardTitle>
          <CardDescription>
            Supervisores ordenados por atividade (mais ativos primeiro)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {supervisorRanking.map((supervisor, index) => (
              <div key={supervisor.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{supervisor.name}</h3>
                    <p className="text-sm text-gray-600">
                      Ativo em {supervisor.months.size} {supervisor.months.size === 1 ? 'mês' : 'meses'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{supervisor.totalSupervisions}</p>
                  <p className="text-sm text-gray-600">{supervisor.totalHours}h total</p>
                </div>
              </div>
            ))}
            {supervisorRanking.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Nenhum dado encontrado para o período selecionado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}