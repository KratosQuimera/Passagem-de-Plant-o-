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
  Layers,
  CalendarDays,
  X,
  Sparkles,
  ArrowUpDown
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

type QuickDatePreset = 'todos' | 'hoje' | 'ontem' | '7dias' | '30dias' | 'mes_atual' | 'personalizado';

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

  // Date filtering state
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [datePreset, setDatePreset] = useState<QuickDatePreset>('todos');
  const [specificDate, setSpecificDate] = useState<string>(''); // YYYY-MM-DD
  const [startDate, setStartDate] = useState<string>(''); // YYYY-MM-DD
  const [endDate, setEndDate] = useState<string>(''); // YYYY-MM-DD
  const [dateFieldTarget, setDateFieldTarget] = useState<'criado_em' | 'concluido_em'>('criado_em');

  const baseList = showOnlyArchived ? archivedTickets : allTickets;

  // Extract unique users who concluded tickets
  const concludedByUsers = useMemo(() => {
    const set = new Set<string>();
    allTickets.forEach((t) => {
      if (t.concluido_por) set.add(t.concluido_por);
    });
    return Array.from(set);
  }, [allTickets]);

  const handleApplyPreset = (preset: QuickDatePreset) => {
    setDatePreset(preset);
    const now = new Date();
    
    if (preset === 'todos') {
      setSpecificDate('');
      setStartDate('');
      setEndDate('');
    } else if (preset === 'hoje') {
      const todayStr = now.toISOString().slice(0, 10);
      setSpecificDate(todayStr);
      setStartDate('');
      setEndDate('');
    } else if (preset === 'ontem') {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      setSpecificDate(yesterday.toISOString().slice(0, 10));
      setStartDate('');
      setEndDate('');
    } else if (preset === '7dias') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setSpecificDate('');
      setStartDate(past7.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (preset === '30dias') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setSpecificDate('');
      setStartDate(past30.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (preset === 'mes_atual') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setSpecificDate('');
      setStartDate(firstDay.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    }
  };

  const handleClearDateFilter = () => {
    setDatePreset('todos');
    setSpecificDate('');
    setStartDate('');
    setEndDate('');
  };

  const isDateFilterActive = datePreset !== 'todos' || Boolean(specificDate) || Boolean(startDate) || Boolean(endDate);

  const filteredTickets = useMemo(() => {
    return baseList.filter((t) => {
      // Text query
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

      // Dropdowns
      if (selectedArea !== 'TODAS' && t.area !== selectedArea) return false;
      if (selectedPriority !== 'TODAS' && t.prioridade !== selectedPriority) return false;
      if (selectedResponsible !== 'TODOS' && t.responsavel !== selectedResponsible) return false;
      if (selectedConcludedBy !== 'TODOS' && t.concluido_por !== selectedConcludedBy) return false;

      // Date filtering
      if (isDateFilterActive) {
        const targetDateStr = dateFieldTarget === 'concluido_em' 
          ? (t.concluido_em || t.atualizado_em) 
          : t.criado_em;

        if (!targetDateStr) return false;

        const ticketDate = new Date(targetDateStr);
        // Format ticket date to YYYY-MM-DD in local time
        const ticketDateFormatted = ticketDate.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'

        if (specificDate) {
          if (ticketDateFormatted !== specificDate) return false;
        } else {
          if (startDate && ticketDateFormatted < startDate) return false;
          if (endDate && ticketDateFormatted > endDate) return false;
        }
      }

      return true;
    });
  }, [
    baseList,
    searchQuery,
    selectedArea,
    selectedPriority,
    selectedResponsible,
    selectedConcludedBy,
    isDateFilterActive,
    specificDate,
    startDate,
    endDate,
    dateFieldTarget,
  ]);

  return (
    <div className="space-y-4 text-slate-200">
      {/* Header and Summary */}
      <div className="bg-[#0a1e27] border border-teal-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Histórico Permanente de Chamados
              </h2>
              <p className="text-xs text-teal-300/80">
                Hospital Alemão Oswaldo Cruz • Auditoria e consulta completa por data do ocorrido, responsável e setor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Dedicated Date Filter Trigger Button */}
            <button
              onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                isDateFilterActive
                  ? 'bg-teal-500/25 text-teal-200 border-teal-400 ring-2 ring-teal-500/30'
                  : 'bg-[#09222c] hover:bg-[#0c2e3b] text-teal-300 border-teal-800/80'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-teal-400" />
              <span>{isDateFilterActive ? 'Data Filtrada' : 'Pesquisar por Data do Ocorrido'}</span>
              {isDateFilterActive && (
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => exportTicketsToExcel(filteredTickets, 'Historico_Chamados_HAOC')}
              className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold border border-emerald-500/40 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </button>
            <button
              onClick={() => exportTicketsToCSV(filteredTickets, 'Historico_Chamados_HAOC')}
              className="flex items-center gap-1.5 bg-[#09222c] hover:bg-[#0c2e3b] text-slate-200 px-3 py-2 rounded-xl text-xs font-medium border border-teal-800/80 transition cursor-pointer"
            >
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Date Search Panel (Expanded when user clicks 'Pesquisar por Data do Ocorrido') */}
        {isDateFilterOpen && (
          <div className="p-4 bg-[#071922] border border-teal-700/60 rounded-xl space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-teal-900/60 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                <Calendar className="w-4 h-4 text-teal-400" />
                <span>FILTRAR HISTÓRICO POR DATA DO OCORRIDO</span>
              </div>
              <div className="flex items-center gap-2">
                {isDateFilterActive && (
                  <button
                    onClick={handleClearDateFilter}
                    className="text-[11px] text-rose-400 hover:text-rose-300 underline font-semibold cursor-pointer"
                  >
                    Limpar Filtro de Data
                  </button>
                )}
                <button
                  onClick={() => setIsDateFilterOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-teal-400 font-semibold mr-1">Atalhos:</span>
              {[
                { id: 'todos', label: 'Todos os Períodos' },
                { id: 'hoje', label: 'Hoje' },
                { id: 'ontem', label: 'Ontem' },
                { id: '7dias', label: 'Últimos 7 dias' },
                { id: '30dias', label: 'Últimos 30 dias' },
                { id: 'mes_atual', label: 'Este Mês' },
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset.id as QuickDatePreset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                    datePreset === preset.id
                      ? 'bg-teal-600 text-white border-teal-400'
                      : 'bg-[#09222c] text-slate-300 border-teal-900/70 hover:bg-[#0c2e3b]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Date Inputs Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Data Específica do Ocorrido
                </label>
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => {
                    setSpecificDate(e.target.value);
                    setDatePreset('personalizado');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="w-full bg-[#05151c] border border-teal-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Ou Intervalo: Data Inicial
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setSpecificDate('');
                    setDatePreset('personalizado');
                  }}
                  className="w-full bg-[#05151c] border border-teal-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Intervalo: Data Final
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setSpecificDate('');
                    setDatePreset('personalizado');
                  }}
                  className="w-full bg-[#05151c] border border-teal-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-teal-400"
                />
              </div>
            </div>

            {/* Target Date Field Selector */}
            <div className="flex items-center gap-4 text-xs pt-1 border-t border-teal-900/60">
              <span className="text-slate-400 font-semibold">Considerar como referência:</span>
              <label className="flex items-center gap-1.5 text-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="targetDate"
                  checked={dateFieldTarget === 'criado_em'}
                  onChange={() => setDateFieldTarget('criado_em')}
                  className="text-teal-500 bg-[#05151c] border-teal-800 focus:ring-0"
                />
                <span>Data de Abertura / Ocorrido</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="targetDate"
                  checked={dateFieldTarget === 'concluido_em'}
                  onChange={() => setDateFieldTarget('concluido_em')}
                  className="text-teal-500 bg-[#05151c] border-teal-800 focus:ring-0"
                />
                <span>Data de Conclusão / Arquivamento</span>
              </label>
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="pt-2 border-t border-teal-900/60 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-teal-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por chamado, problema, área, observação..."
                className="w-full bg-[#06151c] border border-teal-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* Area Filter */}
            <div>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-teal-400"
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
                className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-teal-400"
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
                className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-teal-400"
              >
                <option value="TODOS">Todos Conclusores</option>
                {concludedByUsers.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 gap-2">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showOnlyArchived}
                  onChange={(e) => setShowOnlyArchived(e.target.checked)}
                  className="rounded bg-[#06151c] border-teal-800 text-teal-600 focus:ring-0"
                />
                <span>Exibir apenas chamados concluídos/arquivados</span>
              </label>

              {isDateFilterActive && (
                <div className="inline-flex items-center gap-1.5 bg-teal-950/80 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-700/60 font-mono text-[11px]">
                  <span>Filtro de Data Ativo ({specificDate || `${startDate || 'Início'} até ${endDate || 'Hoje'}`})</span>
                  <button onClick={handleClearDateFilter} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <span>
              Total localizado: <strong className="text-white font-mono">{filteredTickets.length}</strong> chamados
            </span>
          </div>
        </div>
      </div>

      {/* History Table */}
      {filteredTickets.length === 0 ? (
        <div className="bg-[#0a1e27] border border-teal-900/80 rounded-2xl p-12 text-center">
          <History className="w-12 h-12 text-teal-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Nenhum chamado encontrado para estes filtros</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {isDateFilterActive 
              ? 'Tente ajustar a data selecionada ou limpar o filtro de período.'
              : 'Assim que você concluir chamados no painel ativo, eles aparecerão aqui preservando todos os dados e histórico.'}
          </p>
          {isDateFilterActive && (
            <button
              onClick={handleClearDateFilter}
              className="mt-3 bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Limpar Filtro de Data
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-teal-900/80 bg-[#0a1e27] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#071922] text-teal-300 border-b border-teal-900/80 uppercase font-bold text-[11px]">
                  <th className="py-3 px-3.5">Chamado</th>
                  <th className="py-3 px-3">Prioridade</th>
                  <th className="py-3 px-3.5">Área / Setor</th>
                  <th className="py-3 px-3.5">Problema</th>
                  <th className="py-3 px-3.5">Data Ocorrido</th>
                  <th className="py-3 px-3.5">Responsável</th>
                  <th className="py-3 px-3.5">Concluído Por</th>
                  <th className="py-3 px-3.5">Data Conclusão</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-900/40 font-sans">
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-[#071922]/70 transition">
                    <td className="py-3 px-3.5 font-mono font-bold text-teal-400 whitespace-nowrap">
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
                    <td className="py-3 px-3.5 text-teal-300 font-mono text-[11px] whitespace-nowrap">
                      {new Date(t.criado_em).toLocaleDateString('pt-BR')} {new Date(t.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
                          className="flex items-center gap-1 bg-[#071922] hover:bg-[#0c2e3b] text-teal-300 px-2.5 py-1 rounded text-xs border border-teal-800/80 transition cursor-pointer"
                          title="Ver linha do tempo e auditoria"
                        >
                          <History className="w-3 h-3 text-teal-400" />
                          <span>Auditoria</span>
                        </button>
                        <button
                          onClick={() => onReopenTicket(t)}
                          className="flex items-center gap-1 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white px-2.5 py-1 rounded text-xs border border-cyan-500/40 transition cursor-pointer"
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
