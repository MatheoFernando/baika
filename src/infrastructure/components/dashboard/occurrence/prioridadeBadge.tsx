export function PrioridadeBadge({ prioridade }) {
  const cores = {
    "Alta": "bg-red-500 animate-pulse",
    "Médio": "bg-yellow-500",
    "Baixo": "bg-green-500",
  }
  
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${cores[prioridade] || "bg-gray-400"}`} />
      <span>{prioridade}</span>
    </div>
  )
}