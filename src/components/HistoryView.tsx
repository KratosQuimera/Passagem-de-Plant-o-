import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  UserCheck, 
  Download, 
  RotateCcw, 
  Clock, 
  Eye, 
  CheckCircle2,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { exportTicketsToExcel, exportTicketsToCSV } from '../utils/exportUtils';
import { Ticket, AreaItem, ResponsibleItem, StatusItem } from '../types';

interface HistoryViewProps {
  archivedTickets: Ticket[];
  allTickets: Ticket[];
  areas: AreaItem[];
  responsibles: ResponsibleItem[];
  statuses: StatusItem[];
  onViewTimeline: (ticket: Ticket) => void;
  onReopenTicket: (ticket: Ticket) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  archivedTickets,
  allTickets,
  areas,
  responsibles,
  statuses,
  onViewTimeline,
  onReopenTicket,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('TODAS');
  const [selectedPriority, setSelectedPriority] = useState('TODAS');
  const [selectedResponsible, setSelectedResponsible] = useState('TODOS');
  const [selectedConcludedBy, setSelectedConcludedBy] = useState('TODOS');
  const [showOnlyArchived, setShowOnlyArchived] = useState(true);

  const baseList = showOnlyArchived ? archivedTickets : allTickets;

  // Extract unique users who concluded tickets
  const concludedByUsers = useMemo(() => {
    const set = new Set<string>();
    allTickets.forEach((t) => {
      if (t.concluido_por) set.add(t.concluido_por);
    });
    return Array.from(set);
  }, [allTickets]);

  const filteredTickets = useMemo(() => {
    return baseList.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          t.numero_chamado.toLowerCase().includes(q) ||
          t.problema.toLowerCase().includes(q) ||
          t.area.toLowerCase().includes(q) ||
          t.responsavel.toLowerCase().includes(q) ||
          t.observacoes.toLowerCase().includes(q) ||
          (t.concluido_por && t.concluido_por.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (selectedArea !== 'TODAS' && t.area !== selectedArea) return false;
      if (selectedPriority !== 'TODAS' && t.prioridade !== selectedPriority) return false;
      if (selectedResponsible !== 'TODOS' && t.responsavel !== selectedResponsible) return false;
      if (selectedConcludedBy !== 'TODOS' && t.concluido_por !== selectedConcludedBy) return false;

      return true;
    });
  }, [baseList, searchQuery, selectedArea, selectedPriority, selectedResponsible, selectedConcludedBy]);

  return (
    <div className="space-y-4">
      {/* Header and Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Histórico Permanente de Chamados
              </h2>
              <p className="text-xs text-slate-400">
                Auditoria e consulta completa de chamados concluídos, arquivados e encerrados sem risco de exclusão
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportTicketsToExcel(filteredTickets, 'Historico_Chamados_Plantao')}
              className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-3 py-2 rounded-lg text-xs font-semibold border border-emerald-500/40 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </button>
            <button
              onClick={() => exportTicketsToCSV(filteredTickets, 'Historico_Chamados_Plantao')}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por chamado, problema, área..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Area Filter */}
            <div>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
              >
                <option value="TODAS">Todas as Áreas</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.nome}>{a.nome}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
              >
                <option value="TODAS">Todas as Prioridades</option>
                <option value="P1">P1 - Crítico</option>
                <option value="P2">P2 - Alto</option>
                <option value="P3">P3 - Médio</option>
                <option value="P4">P4 - Normal</option>
              </select>
            </div>

            {/* Concluded By Filter */}
            <div>
              <select
                value={selectedConcludedBy}
                onChange={(e) => setSelectedConcludedBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
              >
                <option value="TODOS">Todos Conclusores</option>
                {concludedByUsers.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showOnlyArchived}
                  onChange={(e) => setShowOnlyArchived(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Exibir apenas chamados concluídos/arquivados</span>
              </label>
            </div>

            <span>
              Total localizado: <strong className="text-white">{filteredTickets.length}</strong> chamados
            </span>
          </div>
        </div>
      </div>

      {/* History Table */}
      {filteredTickets.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Nenhum chamado no histórico</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Assim que você concluir chamados no painel ativo, eles aparecerão aqui preservando todos os dados e histórico.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-[11px]">
                  <th className="py-3 px-3.5">Chamado</th>
                  <th className="py-3 px-3">Prioridade</th>
                  <th className="py-3 px-3.5">Área</th>
                  <th className="py-3 px-3.5">Problema</th>
                  <th className="py-3 px-3.5">Responsável</th>
                  <th className="py-3 px-3.5">Concluído Por</th>
                  <th className="py-3 px-3.5">Data Conclusão</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/70 transition">
                    <td className="py-3 px-3.5 font-mono font-bold text-blue-400 whitespace-nowrap">
                      {t.numero_chamado}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <PriorityBadge priority={t.prioridade} size="sm" />
                    </td>
                    <td className="py-3 px-3.5 font-medium text-slate-200 whitespace-nowrap">
                      {t.area}
                    </td>
                    <td className="py-3 px-3.5 text-slate-100 max-w-[200px] truncate" title={t.problema}>
                      {t.problema}
                    </td>
                    <td className="py-3 px-3.5 text-slate-300 whitespace-nowrap">
                      {t.responsavel}
                    </td>
                    <td className="py-3 px-3.5 text-emerald-400 font-medium whitespace-nowrap">
                      {t.concluido_por || t.atualizado_por}
                    </td>
                    <td className="py-3 px-3.5 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {t.concluido_em
                        ? new Date(t.concluido_em).toLocaleString('pt-BR')
                        : new Date(t.atualizado_em).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <StatusBadge status={t.status} size="sm" />
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewTimeline(t)}
                          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-400 px-2.5 py-1 rounded text-xs border border-slate-700 transition cursor-pointer"
                          title="Ver linha do tempo e auditoria"
                        >
                          <History className="w-3 h-3" />
                          <span>Linha do Tempo</span>
                        </button>
                        <button
                          onClick={() => onReopenTicket(t)}
                          className="flex items-center gap-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-2.5 py-1 rounded text-xs border border-blue-500/40 transition cursor-pointer"
                          title="Reativar chamado de volta ao painel de plantão"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reabrir</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
