"use client"

import React from "react"
import Image from "next/image"
import { Notification } from "./occurrence-columns"
interface NotificationDetailsProps {
  notification: Notification
  getPriorityLabel: (priority: string) => string
  getPriorityClass: (priority: string) => string
}

export function NotificationDetails({ 
  notification, 
  getPriorityLabel,
  getPriorityClass 
}: NotificationDetailsProps) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-center mb-4">
        <Image src="/logo.png" alt="Logo" className="h-12" width={40} height={40}/>
      </div>

      <div className="text-center text-xl font-bold mb-6">RELATÓRIO DE OCORRÊNCIA</div>

      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <h3 className="font-semibold text-lg mb-3 border-b pb-2">INFORMAÇÕES GERAIS</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Local:</span>
              <span>{notification.siteName}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Centro de Custo:</span>
              <span>{notification.costCenter}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Supervisor:</span>
              <span>{notification.supervisorName || "Não informado"}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Número de Trabalhadores:</span>
              <span>{notification.numberOfWorkers || 0}</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Data:</span>
              <span>{notification.createdAt}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Hora:</span>
              <span>{notification.createdAtTime}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Prioridade:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                notification.priority === "BAIXA" ? "bg-green-100 text-green-800" :
                notification.priority === "MEDIA" ? "bg-yellow-100 text-yellow-800" :
                notification.priority === "ALTA" ? "bg-orange-100 text-orange-800" :
                "bg-red-100 text-red-800"
              }`}>
                {getPriorityLabel(notification.priority)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <h3 className="font-semibold text-lg mb-3 border-b pb-2">DETALHES DA OCORRÊNCIA</h3>
        <div className="bg-white p-4 rounded-md border">
          {notification.details || "Sem detalhes disponíveis."}
        </div>
      </div>

      {notification.workerInformation && notification.workerInformation.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="font-semibold text-lg mb-3 border-b pb-2">INFORMAÇÃO DOS TRABALHADORES</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notification.workerInformation.map((worker, index) => (
              <div key={index} className="bg-white p-4 rounded-md border">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Nome:</span>
                  <span>{worker.name}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Número de Empregado:</span>
                  <span>{worker.employeeNumber}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Estado:</span>
                  <span>{worker.state}</span>
                </div>
                
                {worker.obs && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Observações:</span>
                    <span>{worker.obs}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {notification.equipment && notification.equipment.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="font-semibold text-lg mb-3 border-b pb-2">EQUIPAMENTOS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notification.equipment.map((equip, index) => (
              <div key={index} className="bg-white p-4 rounded-md border">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Nome:</span>
                  <span>{equip.name}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Número de Série:</span>
                  <span>{equip.serialNumber}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Estado:</span>
                  <span>{equip.state}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Centro de Custo:</span>
                  <span>{equip.costCenter}</span>
                </div>
                
                {equip.obs && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Observações:</span>
                    <span>{equip.obs}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center text-sm text-gray-500 mt-6">
        Gerado pelo sistema - Visualização da ocorrência
      </div>
    </div>
  )
}