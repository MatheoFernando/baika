"use client"

import * as React from "react"
import { format } from "date-fns"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/src/infrastructure/ui/alert-dialog"
import { NotificationDetails } from "./notification-details"
import { NotificationPDF } from "./notification-pdf"
import { PDFDownloadLink } from "@react-pdf/renderer"
import instance from "@/src/lib/api"
import { toast } from "sonner"
import { DataTable } from "./occurrence-table"
import { columns } from "./occurrence-columns"
import { BreadcrumbRoutas } from "../../ulils/breadcrumbRoutas"

export default function OccurrencesPage() {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [metricsData, setMetricsData] = React.useState<any[]>([])
  const [modalShow, setModalShow] = React.useState(false)
  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null)

  React.useEffect(() => {
    fetchNotifications()
    fetchMetrics()

    // Listen for PDF generation events
    const handleGeneratePDF = (event: CustomEvent) => {
      const { id, name } = event.detail
      generatePDF(id, name)
    }

    window.addEventListener('generatePDF', handleGeneratePDF as EventListener)

    return () => {
      window.removeEventListener('generatePDF', handleGeneratePDF as EventListener)
    }
  }, [])

  React.useEffect(() => {
    if (metricsData.length > 0 && notifications.length > 0) {
      updateNotificationsWithMetrics(metricsData)
    }
  }, [metricsData, notifications.length])

  async function fetchNotifications() {
    try {
      setIsLoading(true)
      const response = await instance.get(`/occurrence?size=100000`
      )
      const formattedNotifications = response.data.data.data.map(
        (notification: any) => ({
          ...notification,
          createdAt: format(new Date(notification.createdAt), "dd/MM/yyyy"),
          createdAtTime: format(new Date(notification.createdAt), "HH:mm"),
          createdAtDate: new Date(notification.createdAt),
          supervisorName: notification.supervisorName || "Carregando...",
          siteName: notification.name || "Carregando...",
        })
      )
      console.log(formattedNotifications)
      setNotifications(formattedNotifications)
    } catch (error: any) {
      console.error("Error fetching notifications:", error.message)
      toast.error("Erro ao carregar ocorrências")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMetrics = async () => {
    try {
      const response = await instance.get( `/admin/metrics?size=950&page=1` )
      setMetricsData(response.data.data.sites)
      console.log(
        "Métricas carregadas:",
        response.data.data.sites.map((site: any) => site.siteName)
      )
    } catch (error: any) {
      console.error("Error fetching metrics:", error.message)
      toast.error("Erro ao carregar métricas")
    }
  }

  const updateNotificationsWithMetrics = (metrics: any[]) => {
    const updatedNotifications = notifications.map((notification) => {
      const metricSite = metrics.find(
        (site) => site.siteCostcenter === notification.costCenter
      )
      if (metricSite) {
        const supervisorName = metricSite.supervisor
          ? metricSite.supervisor.name
          : "Não encontrado"
        return {
          ...notification,
          supervisorName: supervisorName,
          siteName: metricSite.siteName || notification.siteName || "Sem site",
        }
      }
      return notification
    })
    setNotifications(updatedNotifications)
  }

  const handleViewDetails = async (notification: Notification) => {
    try {
      const occorence = await getOcorrenceByIdNot(notification.idNotification || notification._id)
      // Combine occurrence data with notification data
      setSelectedNotification({
        ...occorence,
        ...notification,
        createdAt: notification.createdAt,
        createdAtTime: notification.createdAtTime,
      })
      setModalShow(true)
    } catch (error) {
      console.error("Erro ao buscar detalhes da ocorrência:", error)
      toast.error("Erro ao carregar detalhes da ocorrência")
    }
  }

  async function getOcorrenceByIdNot(id: string) {
    try {
      const response = await instance.get( `/occurrence/getOcorByNotification/${id}` )
      return response.data.data
    } catch (error) {
      console.error("Erro:", error)
      throw error
    }
  }

  const generatePDF = (id: string, name: string) => {
    if (!selectedNotification) {
      toast.error("Nenhuma ocorrência selecionada para gerar PDF")
      return
    }
    
    // For browsers, create a download link
    const downloadLink = document.createElement("a")
    downloadLink.style.display = "none"
    document.body.appendChild(downloadLink)

    try {
      toast.success(`PDF da ocorrência '${name}' gerado com sucesso!`)
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      toast.error("Erro ao gerar PDF")
    }
  }

  function getPriorityLabel(priority: string) {
    const priorityMap: Record<string, string> = {
      BAIXA: "Baixa",
      MEDIA: "Média",
      ALTA: "Alta",
      CRITICA: "Crítica",
    }
    return priorityMap[priority] || priority
  }

  function getPriorityClass(priority: string) {
    const priorityClassMap: Record<string, string> = {
      BAIXA: "priority-low",
      MEDIA: "priority-medium",
      ALTA: "priority-high",
      CRITICA: "priority-critical",
    }
    return priorityClassMap[priority] || ""
  }

  return (
    <div className="container mx-auto py-8">
      <BreadcrumbRoutas showBackButton productName="Ocorrências" title="ocorrências"/>
      
      <DataTable
        columns={columns(handleViewDetails)}
        data={notifications}
        isLoading={isLoading}
      />

      <AlertDialog open={modalShow} onOpenChange={setModalShow}>
        <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Detalhes da Ocorrência</AlertDialogTitle>
          </AlertDialogHeader>
          
          {selectedNotification && (
            <>
              <NotificationDetails 
                notification={selectedNotification}
                getPriorityLabel={getPriorityLabel}
                getPriorityClass={getPriorityClass}
              />
              
              <div className="flex justify-end gap-2 mt-4">
                {selectedNotification && (
                  <PDFDownloadLink
                    document={
                      <NotificationPDF 
                        notification={selectedNotification} 
                        getPriorityLabel={getPriorityLabel}
                      />
                    }
                    fileName={`ocorrencia-${selectedNotification.siteName}-${selectedNotification.createdAt}.pdf`}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                  >
                    {({ blob, url, loading, error }) =>
                      loading ? 'Gerando PDF...' : 'Baixar PDF'
                    }
                  </PDFDownloadLink>
                )}
                <button
                  className="bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded"
                  onClick={() => setModalShow(false)}
                >
                  Fechar
                </button>
              </div>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}