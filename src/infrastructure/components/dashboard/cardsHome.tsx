"use client";
import {
  Hammer,
  UserIcon,
  Building2Icon,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import Link from "next/link";
import instance from "@/src/lib/api";
import { useEffect, useState } from "react";
import { Skeleton } from "../../ui/skeleton";

export function SectionCards() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [companyCount, setCompanyCount] = useState<number | null>(null);
  const [equipmentCount, setEquipmentCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const userResponse = await instance.get(`user?size=1000`);
        setUserCount(userResponse.data.data.data.length);

        const companyResponse = await instance.get(`/company?size=5000`);
        setCompanyCount(companyResponse.data.data.data.length);

        const equipmentResponse = await instance.get(`/equipment?size=5000`);
        setEquipmentCount(equipmentResponse.data.data.data.length);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }

    fetchData();
  }, []);

  const cardsData = [
    {
      title: "Supervisores",
      value: userCount,
      link: "/dashboard/supervisores",
      footer: "Total de supervisores",
      icon: <UserIcon className="size-8 text-muted-foreground" />,
    },
    {
      title: "Clientes",
      value: companyCount,
      link: "/dashboard/cliente",
      footer: "Total de clientes",
      icon: <Building2Icon className="size-8 text-muted-foreground" />,
    },
    {
      title: "Equipamentos",
      value: equipmentCount,
      link: "/dashboard/equipamentos",
      footer: "Total de equipamentos",
      icon: <Hammer className="size-8 text-muted-foreground" />,
    },
  ];

  return (
    <div className="w-full gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ">
      {cardsData.map((card, index) => {
        const isLoaded = card.value !== null;

        return (
          <div key={index} className="w-full h-full  transition-all duration-200 ">
            {isLoaded ? (
              <Link href={card.link} className=" w-full">
                <Card className="dark:bg-gray-800">
                  <CardHeader className="relative">
                    <CardDescription>{card.title}</CardDescription>
                    <CardTitle className="lg:text-3xl text-primary-provision  text-2xl font-semibold ">
                      {card.value}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                      {card.icon}
                    </div>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      {card.footer}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ) : (
              <Skeleton className="w-full h-[150px] rounded-xl bg-gray-300 dark:bg-gray-800" />
            )}
          </div>
        );
      })}
    </div>
  );
}
