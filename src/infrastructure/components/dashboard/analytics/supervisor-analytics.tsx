'use client';

import { useState, useEffect } from 'react';
import { Clock,  Filter, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/infrastructure/ui/card';
import { Select, SelectContent, SelectItem } from '@/src/infrastructure/ui/select';
import { SelectTrigger, SelectValue } from '@radix-ui/react-select';
import { Button } from '@/src/infrastructure/ui/button';
import instance from '@/src/lib/api';


interface Supervision {
  id: string;
  supervisor_name: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: string;
  project_name?: string;
}

interface SupervisorStats {
  id: string;
  name: string;
  totalHours: number;
  totalMinutes: number;
  percentage: number;
  sessions: number;
  avatar: string;
  color: string;
}

const colors = [
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600', 
  'bg-cyan-100 text-cyan-600',
  'bg-orange-100 text-orange-600',
  'bg-pink-100 text-pink-600',
  'bg-purple-100 text-purple-600',
  'bg-yellow-100 text-yellow-600',
  'bg-red-100 text-red-600'
];

export default function SupervisionAnalytics() {
const [supervisions, setSupervisions] = useState<Supervision[]>([]);
  const [supervisorStats, setSupervisorStats] = useState<SupervisorStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
const [metrics, setMetrics] = useState(null);
    // Busca os dados de métricas
    const fetchMetrics = async () => {
      try {
        const response = await instance.get(
          `/admin/metrics?size=10&page=1`
        );
        console.log("Metrics Response:", response.data);
        setMetrics(response.data || null);
      } catch (err) {
        console.error("Error fetching metrics:", err);
        setError("Erro ao carregar métricas.");
      }
    };
  // Busca os dados de supervisões
  const fetchSupervisions = async () => {
    try {
      setLoading(true);
      const response = await instance.get(`admin/supervision?size=100&page=4`
      );
      console.log('Supervisions Response:', response.data);
      const data = response.data.data.data;
      setSupervisions(data);
      processSupervisionData(data);
    } catch (err) {
      console.error('Error fetching supervisions:', err);
      setError('Erro ao carregar supervisões.');
    } finally {
      setLoading(false);
    }
  };

  // Processa os dados para estatísticas dos supervisores
  const processSupervisionData = (data: Supervision[]) => {
    const supervisorMap = new Map<string, {
      name: string;
      totalMinutes: number;
      sessions: number;
    }>();

    // Filtra por período se necessário
    const filteredData = filterByTime(data);

    filteredData.forEach((supervision) => {
      const name = supervision.name || 'Supervisor Desconhecido';
      // Converte time string (0:09:59.000000) para minutos
      const timeMinutes = convertTimeToMinutes(supervision.time);
      
      if (supervisorMap.has(name)) {
        const existing = supervisorMap.get(name)!;
        existing.totalMinutes += timeMinutes;
        existing.sessions += 1;
      } else {
        supervisorMap.set(name, {
          name,
          totalMinutes: timeMinutes,
          sessions: 1,
        });
      }
    });

    // Converte para array e calcula percentuais
    const supervisorsArray = Array.from(supervisorMap.entries()).map(([key, value]) => ({
      id: key,
      name: value.name,
      totalMinutes: value.totalMinutes,
      totalHours: Math.floor(value.totalMinutes / 60),
      sessions: value.sessions,
    }));

    // Ordena por tempo total (decrescente)
    supervisorsArray.sort((a, b) => b.totalMinutes - a.totalMinutes);

    // Calcula percentuais baseado no maior valor
    const maxMinutes = supervisorsArray[0]?.totalMinutes || 1;
    
    const statsWithPercentage: SupervisorStats[] = supervisorsArray.map((supervisor, index) => ({
      ...supervisor,
      percentage: Math.round((supervisor.totalMinutes / maxMinutes) * 100),
      avatar: supervisor.name.charAt(0).toUpperCase(),
      color: colors[index % colors.length],
    }));

    setSupervisorStats(statsWithPercentage);
  };

  // Converte string de tempo para minutos
  const convertTimeToMinutes = (timeString: string): number => {
    try {
      // Remove microsegundos se existirem
      const cleanTime = timeString.split('.')[0];
      const parts = cleanTime.split(':');
      
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const seconds = parseInt(parts[2]) || 0;
      
      return hours * 60 + minutes + Math.round(seconds / 60);
    } catch (error) {
      console.error('Erro ao converter tempo:', timeString, error);
      return 0;
    }
  };

  // Filtra dados por período
  const filterByTime = (data: Supervision[]) => {
    if (timeFilter === 'all') return data;

    const now = new Date();
    const filterDate = new Date();

    switch (timeFilter) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return data;
    }

    return data.filter(supervision => {
      const supervisionDate = new Date(supervision.createdAt);
      return supervisionDate >= filterDate;
    });
  };

  // Formata tempo em horas e minutos
  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  };

 

  useEffect(() => {
    fetchSupervisions();
  }, []);

  useEffect(() => {
    if (supervisions.length > 0) {
      processSupervisionData(supervisions);
    }
  }, [timeFilter, supervisions]);

  const displayedStats = supervisorStats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(supervisorStats.length / itemsPerPage);
  const hasNextPage = currentPage < totalPages;

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Card Principal */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Análise de Supervisão
            </CardTitle>
            <CardDescription className="text-gray-600">
              Visualize as atividades de supervisão dos usuários, incluindo tempo total supervisionado e porcentagem de participação.
            </CardDescription>
          </div>
          
          <div className="relative">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[200px] bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-between hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Filtrar por tempo" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg mt-1 overflow-hidden">
                <SelectItem value="all" className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center">
                  Todo período
                </SelectItem>
                <SelectItem value="today" className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center">
                  Hoje
                </SelectItem>
                <SelectItem value="week" className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center">
                  Última semana
                </SelectItem>
                <SelectItem value="month" className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center">
                  Último mês
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {displayedStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum dado de supervisão encontrado
            </div>
          ) : (
            <>
              {displayedStats.map((supervisor, index) => (
                <div
                  key={supervisor.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`size-8 rounded-full flex items-center justify-center text-sm font-semibold ${supervisor.color}`}>
                      {supervisor.avatar}
                    </div>
                    <div>
                      <div className="flex gap-2 text-sm font-medium text-gray-900">
                       <p> {supervisor.name}</p>
                         <p className="font-semibold text-xs bg-blue-100 rounded-2xl py-1 px-2 text-blue-600">
                        {supervisor.percentage}%
                      </p>
                      </div>
                   
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                     
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(supervisor.totalMinutes)}
                      </div>
                    </div>
                    
                    <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${supervisor.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                 
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1"
                    >
                      <ChevronLeft />
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 p-0 ${
                            currentPage === page 
                              ? 'bg-blue-600 text-white' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!hasNextPage}
                      className="px-3 py-1"
                    >
                     <ChevronRight />
                    </Button>
                  </div>
                </div>
              )}

              {hasNextPage && totalPages === 1 && (
                <div className="text-center pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Ver mais supervisores
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>

       
      </Card>

     
    </div>
  );
}