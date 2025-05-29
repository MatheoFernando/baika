"use client"

import { Hammer, UserIcon, Building2Icon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import instance from "@/src/lib/api"
import { useTranslations } from "next-intl"

export function SectionCards() {
  const [userCount, setUserCount] = useState<number | null>(null)
  const [companyCount, setCompanyCount] = useState<number | null>(null)
  const [equipmentCount, setEquipmentCount] = useState<number | null>(null)

  const t = useTranslations("SectionCards")

  useEffect(() => {
    async function fetchData() {
      try {
        const userResponse = await instance.get(`user?size=1000`)
        setUserCount(userResponse.data.data.data.length)

        const companyResponse = await instance.get(`/company?size=500`)
        setCompanyCount(companyResponse.data.data.data.length)

        const equipmentResponse = await instance.get(`/equipment?size=500`)
        setEquipmentCount(equipmentResponse.data.data.data.length)
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      }
    }

    fetchData()
  }, [])

  const cardsData = [
    {
      title: t("supervisores"),
      value: userCount,
      link: "/dashboard/supervisores",
      description: t("totalSupervisores"),
      icon: <UserIcon className="size-5" />,
      color: "bg-blue-100 text-blue-500",
    },
    {
      title: t("clientes"),
      value: companyCount,
      link: "/dashboard/cliente",
      description: t("totalClientes"),
      icon: <Building2Icon className="size-5" />,
      color: "bg-amber-100 text-amber-500",
    },
    {
      title: t("equipamentos"),
      value: equipmentCount,
      link: "/dashboard/equipamentos",
      description: t("totalEquipamentos"),
      icon: <Hammer className="size-5" />,
      color: "bg-rose-100 text-rose-500",
    },
  ]

  return (
    <div className="w-full gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {cardsData.map((card, index) => (
        <Link key={index} href={card.link} className="block">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
            <div className="flex items-start">
              <div className={`${card.color} p-3 rounded-full mr-4`}>{card.icon}</div>
              <div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-gray-800 dark:text-white">
                    {card.value !== null ? (
                      `${card.value}+`
                    ) : (
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    )}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">{card.description}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
