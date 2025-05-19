"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { DataTable } from "./data-table";
import { toast } from "sonner";
import { columns } from "./columns";
import instance from "@/src/lib/api";
import { getUser } from "@/src/core/auth/authApi";
import { Card } from "@/src/infrastructure/ui/card";

export default function Activities() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const user = getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const data = await instance.get(`/notification/${user}?size=5000`);
        console.log(data);

        const formattedNotifications = data.data.map((notification: any) => ({
          ...notification,
          createdAt: format(new Date(notification.createdAt), "dd/MM/yyyy"),
          createdAtDate: new Date(notification.createdAt),
          supervisorName: "Carregando...",
          siteName: "Carregando...",
        }));

        const sortedNotifications = formattedNotifications.sort(
          (a: Notification, b: Notification) =>
            b.createdAtDate.getTime() - a.createdAtDate.getTime()
        );

        setNotifications(sortedNotifications);

        fetchSiteData(sortedNotifications);
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        toast.error("Não foi possível carregar as notificações");
        setLoading(false);
      }
    };

    const fetchSiteData = async (currentNotifications: Notification[]) => {
      try {
        const data = await instance.get(`/admin/metrics?size=10&page=1`);

        if (!data.ok) {
          throw new Error(data.message || "Erro ao buscar dados dos sites");
        }

        updateNotificationsWithMetrics(data.data.sites, currentNotifications);
      } catch (error) {
        console.error("Erro ao buscar métricas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const updateNotificationsWithMetrics = (
    metrics: any[],
    currentNotifications: Notification[]
  ) => {
    const updated = currentNotifications.map((notification) => {
      const metricSite = metrics.find(
        (site) => site.siteCostcenter === notification.costCenter
      );

      if (metricSite) {
        const supervisor =
          metricSite.supervisor &&
          metricSite.supervisor.employeeId === notification.supervisorCode
            ? metricSite.supervisor.name
            : "Não encontrado";

        return {
          ...notification,
          supervisorName: supervisor || "Sem supervisor",
          siteName: metricSite.siteName || "Sem site",
        };
      }
      return notification;
    });

    setNotifications(updated);
  };

  return (
    <Card className=" flex dark:bg-gray-800 p-8 ">
      <h1 className="text-base font-medium mb-5">Últimas Atividades</h1>
      <DataTable columns={columns} data={notifications} loading={loading} />
    </Card>
  );
}
