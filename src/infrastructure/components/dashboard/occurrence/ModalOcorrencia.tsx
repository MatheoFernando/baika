import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/src/infrastructure/ui/alert-dialog"

import Image from "next/image"

export function ModalOcorrencia({ open, onOpenChange, dados }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle className="text-lg font-bold">Detalhes da Ocorrência</AlertDialogTitle>
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
          </div>
          <AlertDialogDescription className="space-y-2 pt-2">
            <p><strong>Hora:</strong> {dados.hora}</p>
            <p><strong>Data:</strong> {dados.data}</p>
            <p><strong>Site:</strong> {dados.site}</p>
            <p><strong>Supervisor:</strong> {dados.supervisor}</p>
            <p><strong>Detalhes:</strong> {dados.detalhes}</p>
            <p><strong>Prioridade:</strong> {dados.prioridade}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Fechar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}