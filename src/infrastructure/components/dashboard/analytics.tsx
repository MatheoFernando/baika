"use client"

import React, { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts"
import instance from "@/src/lib/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card"
import { Skeleton } from "../../ui/skeleton"

export default function Analytics() {
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [metricsRes] = await Promise.all([
          instance.get(`/admin/metrics?size=10000&page=1`),
          instance.get(`/admin/equipments`),
          instance.get(`/admin/supervision?size=100000&page=1`),
          instance.get(`/admin/employees`),
        ])

        setMetrics(metricsRes.data || null)
      } catch (err) {
        console.error("Erro ao carregar dados:", err)
        setError("Erro ao carregar dados.")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const getTopSupervisorBySupervisions = () => {
    const sites = metrics?.data?.sites ?? []
    if (!sites.length) return null

    const supervisorCounts = sites.reduce((acc: any, site: any) => {
      const name = site.supervisor?.name
      if (name) {
        acc[name] = (acc[name] || 0) + site.totalSupervisions
      }
      return acc
    }, {})

    const topName = Object.keys(supervisorCounts).reduce((a, b) =>
      supervisorCounts[a] > supervisorCounts[b] ? a : b,
    )

    return topName
      ? { name: topName, count: supervisorCounts[topName] }
      : null
  }

  const chartData = metrics?.data
    ? [
        { name: "Clientes", total: metrics.data.company || 0 },
        { name: "Sites", total: metrics.data.totalSites || 0 },
        { name: "Funcionários", total: metrics.data.users || 0 },
        { name: "Ocorrências", total: metrics.data.occurrences || 0 },
      ]
    : []

  const topSupervisor = getTopSupervisorBySupervisions()

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded-md shadow border text-sm">
          <p className="font-semibold">{payload[0].name}</p>
          <p>Valor: {payload[0].value}</p>
        </div>
      )
    }

    return null
  }

  return (
    <Card className="w-full md:w-1/2 dark:bg-gray-800 ">
      <CardHeader>
        <CardTitle>Visão Geral (Gráfico)</CardTitle>
        <CardDescription>Métricas principais</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] w-full">
          {isLoading ? (
            <Skeleton className="w-full h-full dark:bg-gray-700 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    cursor: "default",
                  }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.total < 50 ? "#90cdf4" : "#1D09B2"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-2">
        <p>Supervisor com Mais Supervisões</p>

        {isLoading ? (
          <Skeleton className="w-2/3 h-6 rounded-md" />
        ) : topSupervisor ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium">{topSupervisor.name}</p>
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">
                Total: {topSupervisor.count} supervisões
              </p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Nenhum supervisor disponível.
          </p>
        )}
      </CardFooter>
    </Card>
  )
}
