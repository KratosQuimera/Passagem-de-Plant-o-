import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  SlidersHorizontal, 
  ChevronUp, 
  ChevronDown, 
  Download, 
  RefreshCw,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Mail,
  Send,
  FileSpreadsheet
} from 'lucide-react';
import { TicketRow } from './TicketRow';
import { TicketCardMobile } from './TicketCardMobile';
import { PriorityBadge } from './PriorityBadge';
import { exportTicketsToExcel, exportTicketsToCSV } from '../utils/exportUtils';
import { Ticket, AreaItem, ResponsibleItem, StatusItem, PriorityItem } from '../types';

interface OperationalTableProps {
  tickets: Ticket[];
  areas: AreaItem[];
  responsibles: ResponsibleItem[];
  statuses: StatusItem[];
  priorities: PriorityItem[];
  onUpdateTicket: (id: string, updates: Partial<Ticket>) => void;
  onConcludeTicket: (ticket: Ticket) => void;
  onEditTicket: (ticket: Ticket) => void;
  onViewHistory: (ticket: Ticket) => void;
  onOpenNewModal: () => void;
  onOpenSendEmail?: () => void;
}

export const OperationalTable: React.FC<OperationalTableProps> = ({
  tickets,
  areas,
  responsibles,
  statuses,
  priorities,
  onUpdateTicket,
  onConcludeTicket,
  onEditTicket,
  onViewHistory,
  onOpenNewModal,
  onOpenSendEmail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('TODOS');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [areaFilter, setAreaFilter] = useState<string>('TODAS');
  const [respFilter, setRespFilter] = useState<string>('TODOS');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'criado_em' | 'prioridade' | 'area' | 'status'>('criado_em');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Search text query in ticket number, problem, area, responsible, observations, next action
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          t.numero_chamado.toLowerCase().includes(q) ||
          t.problema.toLowerCase().includes(q) ||
          t.area.toLowerCase().includes(q) ||
          t.responsavel.toLowerCase().includes(q) ||
          t.proxima_acao.toLowerCase().includes(q) ||
          t.observacoes.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Priority filter
      if (priorityFilter !== 'TODOS' && t.prioridade !== priorityFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'TODOS') {
        if (statusFilter === 'PENDENTES' && t.status !== 'Pendente') return false;
        if (statusFilter === 'ANDAMENTO' && !t.status.toLowerCase().includes('andamento') && !t.status.toLowerCase().includes('atendimento')) return false;
        if (statusFilter === 'AGUARDANDO' && !t.status.toLowerCase().includes('aguard')) return false;
        if (statusFilter === 'RESOLVIDOS' && !t.status.toLowerCase().includes('resolv') && !t.status.toLowerCase().includes('conclu')) return false;
      }

      // Area filter
      if (areaFilter !== 'TODAS' && t.area !== areaFilter) {
        return false;
      }

      // Responsible filter
      if (respFilter !== 'TODOS' && t.responsavel !== respFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let comp = 0;
      if (sortBy === 'criado_em') {
        comp = new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime();
      } else if (sortBy === 'prioridade') {
        comp = a.prioridade.localeCompare(b.prioridade);
      } else if (sortBy === 'area') {
        comp = a.area.localeCompare(b.area);
      } else if (sortBy === 'status') {
        comp = a.status.localeCompare(b.status);
      }
      return sortOrder === 'asc' ? comp : -comp;
    });
  }, [tickets, searchQuery, priorityFilter, statusFilter, areaFilter, respFilter, sortBy, sortOrder]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary KPI Cards Grid (Hospital Alemão Oswaldo Cruz Styling) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#0a1e27] p-4 rounded-xl border border-teal-900/60 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Chamados Ativos</div>
            <div className="text-2xl font-black text-white mt-0.5">{tickets.length}</div>
            <div className="text-[10px] text-teal-300/70 mt-0.5">Em atendimento no turno</div>
          </div>
          <div className="p-2.5 bg-teal-500/15 rounded-xl text-teal-300 border border-teal-500/30">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-red-950/25 p-4 rounded-xl border border-red-900/40 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Pendentes</div>
            <div className="text-2xl font-black text-red-400 mt-0.5">
              {tickets.filter((t) => t.status === 'Pendente').length}
            </div>
            <div className="text-[10px] text-red-400/80 mt-0.5">Aguardando início</div>
          </div>
          <div className="p-2.5 bg-red-900/30 rounded-xl text-red-400 border border-red-800/40">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-sky-950/25 p-4 rounded-xl border border-sky-900/40 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">Em Andamento</div>
            <div className="text-2xl font-black text-sky-400 mt-0.5">
              {tickets.filter((t) => t.status.toLowerCase().includes('andamento') || t.status.toLowerCase().includes('atendimento')).length}
            </div>
            <div className="text-[10px] text-sky-400/80 mt-0.5">Com operador alocado</div>
          </div>
          <div className="p-2.5 bg-sky-900/30 rounded-xl text-sky-400 border border-sky-800/40">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-emerald-950/25 p-4 rounded-xl border border-emerald-900/40 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Resolvidos no Painel</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              {tickets.filter((t) => t.status === 'Resolvido').length}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">Prontos para arquivamento</div>
          </div>
          <div className="p-2.5 bg-emerald-900/30 rounded-xl text-emerald-400 border border-emerald-800/40">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Top Filter & Search Toolbar */}
      <div className="bg-[#0a1e27]/90 border border-teal-900/60 rounded-2xl p-4 shadow-md backdrop-blur-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-teal-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar chamado, problema, área, responsável ou ação..."
              className="w-full bg-[#06151c] border border-teal-800/80 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-teal-400/40 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-[#09222c] px-1.5 py-0.5 rounded cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Quick Action Buttons & Mode Switch */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View switcher */}
            <div className="flex items-center bg-[#06151c] p-1 rounded-xl border border-teal-900/80">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-teal-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Visualização em Tabela (Planilha)"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabela</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'cards' ? 'bg-teal-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Visualização em Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            {/* Export options */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => exportTicketsToExcel(filteredTickets, 'Chamados_Plantao_OswaldoCruz')}
                className="flex items-center gap-1.5 bg-[#09222c] hover:bg-[#0c2e3b] text-teal-200 px-3 py-2 rounded-xl text-xs font-semibold border border-teal-800/70 transition cursor-pointer"
                title="Exportar para Excel (.xlsx)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Excel</span>
              </button>
            </div>

            {/* Main Screen Direct Email Dispatch Button */}
            {onOpenSendEmail && (
              <button
                onClick={onOpenSendEmail}
                className="flex items-center gap-1.5 bg-[#082834] hover:bg-[#0d3b4d] text-teal-200 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-teal-500/50 shadow-md shadow-teal-950/40 transition cursor-pointer group"
                title="Enviar resumo do plantão por e-mail"
              >
                <Mail className="w-4 h-4 text-teal-400 group-hover:scale-110 transition" />
                <span>Enviar E-mail</span>
              </button>
            )}

            {/* Novo Chamado button */}
            <button
              onClick={onOpenNewModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 active:from-teal-700 active:to-cyan-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-teal-950/50 border border-teal-400/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Chamado</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-teal-900/60 text-xs">
          <span className="text-teal-400/80 text-[11px] font-bold uppercase flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-teal-400" /> Filtros:
          </span>

          {/* Status Quick Pills */}
          <button
            onClick={() => { setStatusFilter('TODOS'); setPriorityFilter('TODOS'); }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              statusFilter === 'TODOS' && priorityFilter === 'TODOS'
                ? 'bg-teal-600 text-white ring-2 ring-teal-400/30 font-bold shadow-sm'
                : 'bg-[#09222c] text-slate-300 hover:bg-[#0c2e3b] border border-teal-900/40'
            }`}
          >
            Todos ({tickets.length})
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'PENDENTES' ? 'TODOS' : 'PENDENTES')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'PENDENTES'
                ? 'bg-red-600 text-white ring-2 ring-red-400/30 font-bold'
                : 'bg-[#09222c] text-red-400 hover:bg-[#0c2e3b] border border-red-900/40'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
            Pendentes ({tickets.filter((t) => t.status === 'Pendente').length})
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'ANDAMENTO' ? 'TODOS' : 'ANDAMENTO')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'ANDAMENTO'
                ? 'bg-sky-600 text-white ring-2 ring-sky-400/30 font-bold'
                : 'bg-[#09222c] text-sky-400 hover:bg-[#0c2e3b] border border-sky-900/40'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            Em andamento ({tickets.filter((t) => t.status.toLowerCase().includes('andamento') || t.status.toLowerCase().includes('atendimento')).length})
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'AGUARDANDO' ? 'TODOS' : 'AGUARDANDO')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'AGUARDANDO'
                ? 'bg-amber-600 text-white ring-2 ring-amber-400/30 font-bold'
                : 'bg-[#09222c] text-amber-400 hover:bg-[#0c2e3b] border border-amber-900/40'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Aguardando ({tickets.filter((t) => t.status === 'Aguardando').length})
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === 'RESOLVIDOS' ? 'TODOS' : 'RESOLVIDOS')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'RESOLVIDOS'
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/30 font-bold'
                : 'bg-[#09222c] text-emerald-400 hover:bg-[#0c2e3b] border border-emerald-900/40'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Resolvidos ({tickets.filter((t) => t.status === 'Resolvido').length})
          </button>

          <div className="h-4 w-px bg-teal-900 mx-1 hidden sm:block"></div>

          {/* Priority Quick Filter */}
          {['P1', 'P2', 'P3', 'P4'].map((p) => {
            const isSelected = priorityFilter === p;
            const count = tickets.filter((t) => t.prioridade === p).length;
            return (
              <button
                key={p}
                onClick={() => setPriorityFilter(isSelected ? 'TODOS' : p)}
                className={`transition cursor-pointer ${
                  isSelected ? 'scale-105 ring-2 ring-teal-400 rounded' : 'opacity-85 hover:opacity-100'
                }`}
                title={`Filtrar prioridade ${p}`}
              >
                <div className="flex items-center gap-1 bg-[#09222c] px-2 py-0.5 rounded-lg border border-teal-900">
                  <PriorityBadge priority={p} size="sm" />
                  <span className="text-[10px] text-teal-300/80 font-mono pr-0.5">{count}</span>
                </div>
              </button>
            );
          })}

          {/* Area dropdown filter */}
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            aria-label="Filtrar por Área"
            className="bg-[#06151c] border border-teal-800 rounded-xl px-2.5 py-1 text-xs text-slate-300 outline-none focus:border-teal-400 cursor-pointer ml-auto"
          >
            <option value="TODAS">Todas as Áreas ({areas.length})</option>
            {areas.map((a) => (
              <option key={a.id} value={a.nome}>
                {a.nome}
              </option>
            ))}
          </select>

          {/* Responsible dropdown filter */}
          <select
            value={respFilter}
            onChange={(e) => setRespFilter(e.target.value)}
            aria-label="Filtrar por Responsável"
            className="bg-[#06151c] border border-teal-800 rounded-xl px-2.5 py-1 text-xs text-slate-300 outline-none focus:border-teal-400 cursor-pointer"
          >
            <option value="TODOS">Todos os Responsáveis ({responsibles.length})</option>
            {responsibles.map((r) => (
              <option key={r.id} value={r.nome}>
                {r.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredTickets.length === 0 ? (
        <div className="bg-[#0a1e27] border border-teal-900/60 rounded-2xl p-12 text-center shadow-lg">
          <div className="w-16 h-16 bg-[#09222c] text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-800/80">
            <CheckCircle className="w-8 h-8 text-teal-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Nenhum chamado ativo encontrado</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            {searchQuery || priorityFilter !== 'TODOS' || statusFilter !== 'TODOS'
              ? 'Nenhum chamado corresponde aos filtros aplicados. Tente limpar os filtros ou realizar outra busca.'
              : 'Todos os chamados foram concluídos ou não há pendências cadastradas no momento.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            {(searchQuery || priorityFilter !== 'TODOS' || statusFilter !== 'TODOS' || areaFilter !== 'TODAS') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPriorityFilter('TODOS');
                  setStatusFilter('TODOS');
                  setAreaFilter('TODAS');
                  setRespFilter('TODOS');
                }}
                className="px-4 py-2 bg-[#09222c] hover:bg-[#0c2e3b] text-teal-200 rounded-xl text-xs font-semibold border border-teal-800 transition cursor-pointer"
              >
                Limpar Filtros
              </button>
            )}
            <button
              onClick={onOpenNewModal}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-950/40 transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Chamado</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Table View */}
          {viewMode === 'table' ? (
            <div className="hidden md:block overflow-hidden rounded-2xl border border-teal-900/60 bg-[#0a1e27] shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  {/* Oswaldo Cruz Sleek Table Header */}
                  <thead>
                    <tr className="bg-[#071922] border-b border-teal-900/80 text-teal-300 text-xs font-bold uppercase tracking-wider select-none">
                      <th
                        onClick={() => handleSort('criado_em')}
                        className="px-4 py-3 cursor-pointer hover:bg-[#0c2e3b] transition"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span>CHAMADO</span>
                          <ChevronDown className="w-3.5 h-3.5 text-teal-500" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('prioridade')}
                        className="px-3 py-3 cursor-pointer hover:bg-[#0c2e3b] transition"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span>PRIORIDADE</span>
                          <ChevronDown className="w-3.5 h-3.5 text-teal-500" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('area')}
                        className="px-3.5 py-3 cursor-pointer hover:bg-[#0c2e3b] transition"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span>ÁREA</span>
                          <ChevronDown className="w-3.5 h-3.5 text-teal-500" />
                        </div>
                      </th>
                      <th className="px-4 py-3">
                        <div className="flex items-center justify-between gap-1">
                          <span>PROBLEMA</span>
                          <ChevronDown className="w-3.5 h-3.5 text-teal-500" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('status')}
                        className="px-3 py-3 cursor-pointer hover:bg-[#0c2e3b] transition"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span>STATUS</span>
                          <ChevronDown className="w-3.5 h-3.5 text-teal-500" />
                        </div>
                      </th>
                      <th className="px-4 py-3">
                        <div className="flex items-center justify-between gap-1">
                          <span>PRÓXIMA AÇÃO</span>
                          <ChevronDown className="w-3.5 h-3.5 text-teal-500" />
                        </div>
                      </th>
                      <th className="px-3 py-3">
                        <div className="flex items-center justify-between gap-1">
                          <span>RESPONSÁVEL</span>
                          <ChevronDown className="w-3.5 h-3.5 text-teal-500" />
                        </div>
                      </th>
                      <th className="px-4 py-3">
                        <div className="flex items-center justify-between gap-1">
                          <span>OBSERVAÇÕES</span>
                          <ChevronDown className="w-3.5 h-3.5 text-teal-500" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-right">
                        <span>AÇÕES</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-teal-900/40 font-sans">
                    {filteredTickets.map((ticket) => (
                      <TicketRow
                        key={ticket.id}
                        ticket={ticket}
                        areas={areas}
                        responsibles={responsibles}
                        statuses={statuses}
                        priorities={priorities}
                        onUpdate={onUpdateTicket}
                        onConclude={onConcludeTicket}
                        onEdit={onEditTicket}
                        onViewHistory={onViewHistory}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {/* Cards View */}
          <div className={`${viewMode === 'table' ? 'md:hidden' : ''} grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5`}>
            {filteredTickets.map((ticket) => (
              <TicketCardMobile
                key={ticket.id}
                ticket={ticket}
                onConclude={onConcludeTicket}
                onEdit={onEditTicket}
                onViewHistory={onViewHistory}
              />
            ))}
          </div>
        </>
      )}

      {/* Table Footer / Summary bar */}
      <div className="bg-[#0a1e27]/80 border border-teal-900/70 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-bold text-teal-300">
            Exibindo {filteredTickets.length} de {tickets.length} chamados ativos
          </span>
          <span className="text-teal-900">|</span>
          <span className="text-slate-400">
            P1/P2: <strong className="text-orange-400">{tickets.filter((t) => t.prioridade === 'P1' || t.prioridade === 'P2').length}</strong>
          </span>
          <span className="text-slate-400">
            Pendentes: <strong className="text-red-400">{tickets.filter((t) => t.status === 'Pendente').length}</strong>
          </span>
        </div>

        <div className="text-[11px] text-teal-400/70">
          Hospital Alemão Oswaldo Cruz • Auditoria de chamados e histórico permanente
        </div>
      </div>
    </div>
  );
};
