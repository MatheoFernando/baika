"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Building2,
  MapPin,
  Wrench,
  Users,
  AlertTriangle,
  UserCheck,
  Activity,
  BarChart3,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/infrastructure/ui/card";
import { Skeleton } from "@/src/infrastructure/ui/skeleton";
import { Button } from "@/src/infrastructure/ui/button";
import instance from "@/src/lib/api";
import { calculateEfficiency, exportToExcel, exportToPDF } from "./exportUtils";

// Interface para os dados da API
interface SiteData {
  siteCostcenter: string;
  siteName: string;
  siteNumberOfWorkers: number;
  supervisor: {
    name: string;
    employeeId: string;
  };
  totalEquipments: number;
  totalSupervisions: number;
  totalOccurrences: number;
}

interface MetricsData {
  company?: number;
  totalSites?: number;
  equipments?: number;
  employees?: number;
  supervisions?: number;
  occurrences?: number;
  tasks?: number;
  users?: number;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
  };
  sites?: SiteData[];
}

const sitesData = [
  { month: "Jan", sites: 380 },
  { month: "Fev", sites: 420 },
  { month: "Mar", sites: 440 },
  { month: "Abr", sites: 454 },
];

const equipmentData = [
  { day: "Seg", equipments: 4100 },
  { day: "Ter", equipments: 4150 },
  { day: "Qua", equipments: 4180 },
  { day: "Qui", equipments: 4200 },
  { day: "Sex", equipments: 4206 },
];

const supervisionData = [
  { name: "Concluídas", value: 2814, color: "#3b82f6" },
  { name: "Pendentes", value: 186, color: "#e5e7eb" },
];

const occurrenceData = [
  { week: "Sem 1", occurrences: 12 },
  { week: "Sem 2", occurrences: 8 },
  { week: "Sem 3", occurrences: 15 },
  { week: "Sem 4", occurrences: 14 },
];

interface MetricsCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  delay?: number;
  color?: string;
}

function MetricsCard({
  title,
  subtitle,
  value,
  description,
  icon,
  children,
  delay = 0,
  color = "blue",
}: MetricsCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Card
      className={`transition-all shadow-sm duration-700 ease-out transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } hover:shadow-lg hover:-translate-y-1 border-2 `}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-xs text-muted-foreground/70">{subtitle}</p>
          )}
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">
          {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {children && <div className="mt-4">{children}</div>}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-20 w-full mt-4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await instance.get(`/admin/metrics?size=10&page=1`);
      setMetrics(response.data?.data || null);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setError("Erro ao carregar métricas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const generateSitesChartData = () => {
    if (!metrics?.sites) return sitesData;
    return metrics.sites.slice(0, 4).map((site, index) => ({
      month: `Site ${index + 1}`,
      sites: site.totalEquipments,
    }));
  };

  const generateEquipmentChartData = () => {
    if (!metrics?.sites) return equipmentData;
    // Pega os primeiros 5 sites para mostrar no gráfico de equipamentos
    return metrics.sites.slice(0, 5).map((site, index) => ({
      day: site.siteName.split(" ")[0] || `Site ${index + 1}`,
      equipments: site.totalEquipments,
    }));
  };

  const generateOccurrenceChartData = () => {
    if (!metrics?.sites) return occurrenceData;

    // Agrupa ocorrências por semana simulada baseada nos sites
    const sitesWithOccurrences = metrics.sites.filter(
      (site) => site.totalOccurrences > 0
    );
    if (sitesWithOccurrences.length === 0) {
      return [
        { week: "Sem 1", occurrences: 0 },
        { week: "Sem 2", occurrences: 0 },
        { week: "Sem 3", occurrences: 0 },
        { week: "Sem 4", occurrences: 0 },
      ];
    }

    return sitesWithOccurrences.slice(0, 4).map((site, index) => ({
      week: `Sem ${index + 1}`,
      occurrences: site.totalOccurrences,
    }));
  };

  // Gerar dados do gráfico de barras para sites
  const generateSitesBarChartData = () => {
    if (!metrics?.sites) return [];

    return metrics.sites
      .sort((a, b) => b.totalEquipments - a.totalEquipments)
      .slice(0, 6)
      .map((site) => ({
        name:
          site.siteName.length > 12
            ? site.siteName.substring(0, 12) + "..."
            : site.siteName,
        equipments: site.totalEquipments,
      }));
  };

  const updateSupervisionData = () => {
    if (!metrics) return supervisionData;

    const completed = metrics.supervisions || 0;
    const pending = Math.max(0, Math.floor(completed * 0.1));

    return [
      { name: "Concluídas", value: completed, color: "#3b82f6" },
      { name: "Pendentes", value: pending, color: "#e5e7eb" },
    ];
  };

  // Funções de exportação
  const handleExportExcel = async () => {
    if (!metrics) return;

    setExporting("excel");
    try {
      const result = await exportToExcel(metrics);
      if (result.success) {
        console.log(`Arquivo Excel exportado: ${result.fileName}`);
      } else {
        console.error("Erro na exportação:", result.error);
      }
    } catch (error) {
      console.error("Erro ao exportar Excel:", error);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    if (!metrics) return;

    setExporting("pdf");
    try {
      const result = await exportToPDF(metrics);
      if (result.success) {
        console.log(`Arquivo PDF exportado: ${result.fileName}`);
      } else {
        console.error("Erro na exportação:", result.error);
      }
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard de Analytics
          </h1>
          <p className="text-red-500">{error}</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <button
            onClick={fetchMetrics}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard de Analytics
          </h1>
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  const sitesChartData = generateSitesBarChartData();

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-1000">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard de Analytics
          </h1>
          <p className="text-muted-foreground">
            Visão geral das métricas e indicadores principais do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportExcel}
            disabled={exporting === "excel"}
            variant="outline"
            size="sm"
            className="flex items-center cursor-pointer gap-2 hover:bg-blue-600 hover:text-white" 
          >
            <FileSpreadsheet className="h-4 w-4" />
            {exporting === "excel" ? "Exportando..." : "Excel"}
          </Button>
          <Button
            onClick={handleExportPDF}
            disabled={exporting === "pdf"}
            variant="outline"
            size="sm"
            className="flex items-center cursor-pointer gap-2 hover:bg-blue-600 hover:text-white" 
          >
            <FileText className="h-4 w-4" />
            {exporting === "pdf" ? "Exportando..." : "PDF"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total de Empresas"
          value={metrics.company || 0}
          description="empresas cadastradas"
          icon={<Building2 className="h-4 w-4" />}
          delay={100}
          color="blue"
        >
          <div className="h-16 flex items-end justify-between space-x-1">
            {[65, 78, 82, 95, 88, 92, 100].map((height, i) => (
              <div
                key={i}
                className="bg-blue-500 rounded-sm flex-1 animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: "2s",
                }}
              />
            ))}
          </div>
        </MetricsCard>
        <MetricsCard
          title="Total de Sites"
          value={metrics.totalSites || 0}
          description="sites monitorados"
          icon={<MapPin className="h-4 w-4" />}
          delay={200}
          color="green"
        >
          <ResponsiveContainer width="100%" height={64}>
            <LineChart data={generateSitesChartData()}>
              <Line
                type="monotone"
                dataKey="sites"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                className="animate-in slide-in-from-left duration-1000"
              />
            </LineChart>
          </ResponsiveContainer>
        </MetricsCard>

        <MetricsCard
          title="Total de Equipamentos"
          value={metrics.equipments || 0}
          description="equipamentos ativos"
          icon={<Wrench className="h-4 w-4" />}
          delay={300}
          color="orange"
        >
          <ResponsiveContainer width="100%" height={64}>
            <BarChart data={generateEquipmentChartData()}>
              <Bar
                dataKey="equipments"
                fill="#f97316"
                radius={[2, 2, 0, 0]}
                className="animate-in slide-in-from-bottom duration-1000"
              />
            </BarChart>
          </ResponsiveContainer>
        </MetricsCard>

        <MetricsCard
          title="Total de Usuários"
          value={metrics.users || 0}
          description="usuários ativos"
          icon={<Users className="h-4 w-4" />}
          delay={400}
          color="purple"
        >
          <div className="flex items-center justify-center h-16">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"
                style={{ animationDuration: "3s" }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-purple-600">
                  {metrics.users || 0}
                </span>
              </div>
            </div>
          </div>
        </MetricsCard>

        <MetricsCard
          title="Total de Supervisões"
          value={metrics.supervisions || 0}
          description="supervisões realizadas"
          icon={<UserCheck className="h-4 w-4" />}
          delay={500}
          color="blue"
        >
          <ResponsiveContainer width="100%" height={64}>
            <PieChart>
              <Pie
                data={updateSupervisionData()}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={30}
                dataKey="value"
                className="animate-in spin-in duration-1000"
              >
                {updateSupervisionData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </MetricsCard>

        <MetricsCard
          title="Total de Ocorrências"
          value={metrics.occurrences || 0}
          description="ocorrências registradas"
          icon={<AlertTriangle className="h-4 w-4" />}
          delay={600}
          color="red"
        >
          <ResponsiveContainer width="100%" height={64}>
            <LineChart data={generateOccurrenceChartData()}>
              <Line
                type="monotone"
                dataKey="occurrences"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", r: 3 }}
                className="animate-in slide-in-from-right duration-1000"
              />
            </LineChart>
          </ResponsiveContainer>
        </MetricsCard>

        <MetricsCard
          title="Taxa de Eficiência"
          value={calculateEfficiency(metrics)}
          description="eficiência operacional"
          icon={<Activity className="h-4 w-4" />}
          delay={700}
          color="green"
        >
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Eficiência</span>
              <span>{calculateEfficiency(metrics)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: calculateEfficiency(metrics) }}
              ></div>
            </div>
          </div>
        </MetricsCard>

        <MetricsCard
          title="Status do Sistema"
          value="Online"
          description="todos os sistemas operacionais"
          icon={<Activity className="h-4 w-4" />}
          delay={900}
          color="green"
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">
              Sistema Operacional
            </span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-1 bg-green-500 rounded animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              ></div>
            ))}
          </div>
        </MetricsCard>
      </div>

      <MetricsCard
        title="Distribuição por Sites"
        subtitle={`Top ${sitesChartData.length} sites com mais equipamentos`}
        value={`${metrics.sites?.length || 0} sites`}
        description="sites cadastrados"
        icon={<BarChart3 className="h-5 w-5" />}
        delay={800}
        color="blue"
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={sitesChartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 13, fontWeight: "bold" }}
              angle={-45}
              textAnchor="end"
              height={120}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="equipments" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </MetricsCard>
    </div>
  );
}
