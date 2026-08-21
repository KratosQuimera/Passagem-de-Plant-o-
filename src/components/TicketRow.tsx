import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  Edit3, 
  History, 
  ChevronDown, 
  User, 
  Clock, 
  AlertCircle,
  MoreVertical,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { Ticket, AreaItem, ResponsibleItem, StatusItem, PriorityItem } from '../types';

interface TicketRowProps {
  ticket: Ticket;
  areas: AreaItem[];
  responsibles: ResponsibleItem[];
  statuses: StatusItem[];
  priorities: PriorityItem[];
  onUpdate: (id: string, updates: Partial<Ticket>) => void;
  onConclude: (ticket: Ticket) => void;
  onEdit: (ticket: Ticket) => void;
  onViewHistory: (ticket: Ticket) => void;
}

export const TicketRow: React.FC<TicketRowProps> = ({
  ticket,
  areas,
  responsibles,
  statuses,
  priorities,
  onUpdate,
  onConclude,
  onEdit,
  onViewHistory,
}) => {
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isRespOpen, setIsRespOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(ticket.observacoes || '');

  const priorityRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const respRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotesValue(ticket.observacoes || '');
  }, [ticket.observacoes]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (priorityRef.current && !priorityRef.current.contains(e.target as Node)) {
        setIsPriorityOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setIsStatusOpen(false);
      }
      if (respRef.current && !respRef.current.contains(e.target as Node)) {
        setIsRespOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrioritySelect = (p: string) => {
    onUpdate(ticket.id, { prioridade: p });
    setIsPriorityOpen(false);
  };

  const handleStatusSelect = (st: string) => {
    onUpdate(ticket.id, { status: st });
    setIsStatusOpen(false);
  };

  const handleRespSelect = (resp: string) => {
    onUpdate(ticket.id, { responsavel: resp });
    setIsRespOpen(false);
  };

  const handleSaveNotes = () => {
    if (notesValue !== ticket.observacoes) {
      onUpdate(ticket.id, { observacoes: notesValue });
    }
    setIsEditingNotes(false);
  };

  const isHighPriority = ticket.prioridade === 'P1' || ticket.prioridade === 'P2';

  return (
    <tr className={`border-b border-teal-950 transition-colors text-xs hover:bg-[#071922]/90 ${
      isHighPriority ? 'bg-[#06171f]/80' : 'bg-transparent'
    }`}>
      {/* 1. CHAMADO */}
      <td className="px-4 py-3 font-mono font-bold text-teal-400 whitespace-nowrap">
        <span className="hover:underline cursor-pointer" onClick={() => onEdit(ticket)}>
          {ticket.numero_chamado}
        </span>
      </td>

      {/* 2. PRIORIDADE (Interactive Dropdown) */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <div className="relative inline-block text-left" ref={priorityRef}>
          <button
            type="button"
            onClick={() => setIsPriorityOpen(!isPriorityOpen)}
            className="flex items-center gap-1.5 p-0.5 rounded hover:ring-1 hover:ring-teal-400/50 transition cursor-pointer"
            title="Alterar prioridade"
          >
            <PriorityBadge priority={ticket.prioridade} size="sm" />
            <ChevronDown className="w-3 h-3 text-teal-500/60 hover:text-teal-300" />
          </button>

          {isPriorityOpen && (
            <div className="absolute left-0 top-full mt-1 w-32 bg-[#0a1e27] border border-teal-800 rounded-xl shadow-2xl z-30 p-1 space-y-1 animate-in fade-in zoom-in-95 duration-100">
              {['P1', 'P2', 'P3', 'P4'].map((p) => (
                <button
                  key={p}
                  onClick={() => handlePrioritySelect(p)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                    ticket.prioridade === p ? 'bg-[#0d2f3d] font-bold' : 'hover:bg-[#071922] text-slate-300'
                  }`}
                >
                  <PriorityBadge priority={p} size="sm" />
                  <span className="text-[10px] text-slate-400 font-sans">
                    {p === 'P1' ? 'Crítico' : p === 'P2' ? 'Alto' : p === 'P3' ? 'Médio' : 'Normal'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </td>

      {/* 3. ÁREA */}
      <td className="px-3.5 py-3 text-slate-200 font-medium whitespace-nowrap">
        <span className="bg-[#071922] px-2 py-0.5 rounded-lg text-teal-200 text-xs border border-teal-900/80">
          {ticket.area}
        </span>
      </td>

      {/* 4. PROBLEMA */}
      <td className="px-4 py-3 font-medium text-slate-100 max-w-[240px]">
        <div className="truncate font-medium text-slate-200" title={ticket.problema}>
          {ticket.problema}
        </div>
      </td>

      {/* 5. STATUS (Interactive Dropdown) */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <div className="relative inline-block text-left" ref={statusRef}>
          <button
            type="button"
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg hover:bg-[#071922] transition cursor-pointer"
            title="Alterar status"
          >
            <StatusBadge status={ticket.status} size="sm" />
            <ChevronDown className="w-3 h-3 text-teal-500/60 hover:text-teal-300" />
          </button>

          {isStatusOpen && (
            <div className="absolute left-0 top-full mt-1 w-48 bg-[#0a1e27] border border-teal-800 rounded-xl shadow-2xl z-30 p-1 space-y-1 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1 text-[10px] font-bold text-teal-300 uppercase border-b border-teal-900">
                Selecione o Status
              </div>
              {statuses.map((st) => (
                <button
                  key={st.id}
                  onClick={() => handleStatusSelect(st.nome)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                    ticket.status === st.nome ? 'bg-[#0d2f3d] font-bold' : 'hover:bg-[#071922] text-slate-300'
                  }`}
                >
                  <StatusBadge status={st.nome} size="sm" />
                </button>
              ))}
            </div>
          )}
        </div>
      </td>

      {/* 6. PRÓXIMA AÇÃO */}
      <td className="px-4 py-3 text-slate-300 max-w-[240px]">
        <div className="text-slate-300 truncate" title={ticket.proxima_acao}>
          {ticket.proxima_acao || <span className="text-teal-900 italic">Sem ação</span>}
        </div>
      </td>

      {/* 7. RESPONSÁVEL (Interactive Dropdown) */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <div className="relative inline-block text-left" ref={respRef}>
          <button
            type="button"
            onClick={() => setIsRespOpen(!isRespOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[#071922] transition cursor-pointer text-slate-300"
            title="Alterar responsável"
          >
            <span className="truncate max-w-[120px] font-medium">{ticket.responsavel}</span>
            <ChevronDown className="w-3 h-3 text-teal-500/60 ml-0.5" />
          </button>

          {isRespOpen && (
            <div className="absolute left-0 top-full mt-1 w-56 bg-[#0a1e27] border border-teal-800 rounded-xl shadow-2xl z-30 p-1 max-h-56 overflow-y-auto space-y-1 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1 text-[10px] font-bold text-teal-300 uppercase border-b border-teal-900">
                Atribuir Responsável
              </div>
              {responsibles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRespSelect(r.nome)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer text-left ${
                    ticket.responsavel === r.nome
                      ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30'
                      : 'hover:bg-[#071922] text-slate-300'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-teal-900 border border-teal-700 flex items-center justify-center font-bold text-[10px] text-teal-200 shrink-0">
                    {r.nome.substring(0, 2)}
                  </div>
                  <span className="truncate">{r.nome}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </td>

      {/* 8. OBSERVAÇÕES */}
      <td className="px-4 py-2 max-w-[240px]">
        {isEditingNotes ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              onBlur={handleSaveNotes}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveNotes();
                if (e.key === 'Escape') setIsEditingNotes(false);
              }}
              autoFocus
              className="w-full bg-[#06151c] border border-teal-400 rounded-lg px-2 py-1 text-xs text-white outline-none ring-1 ring-teal-400"
            />
          </div>
        ) : (
          <div
            onClick={() => setIsEditingNotes(true)}
            className="group flex items-center justify-between gap-1 p-1 rounded hover:bg-[#071922] cursor-pointer text-slate-300 min-h-[26px]"
            title="Clique para editar observação"
          >
            <span className="truncate text-xs text-slate-400 group-hover:text-teal-200">
              {ticket.observacoes || <span className="text-teal-900 italic">Adicionar nota...</span>}
            </span>
            <Edit3 className="w-3 h-3 text-teal-500 opacity-0 group-hover:opacity-100 transition shrink-0" />
          </div>
        )}
      </td>

      {/* 9. AÇÕES */}
      <td className="px-4 py-2 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-1.5">
          {/* Concluir / Arquivar Soft-Delete Button */}
          <button
            onClick={() => onConclude(ticket)}
            className="flex items-center gap-1 bg-emerald-950/40 hover:bg-emerald-600 text-emerald-400 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-800/60 transition cursor-pointer group shadow-sm"
            title="Concluir chamado (Arquivar para Histórico)"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
            <span className="hidden xl:inline">Concluir</span>
          </button>

          {/* Editar Modal */}
          <button
            onClick={() => onEdit(ticket)}
            className="p-1.5 text-slate-400 hover:text-teal-300 hover:bg-[#071922] rounded-lg transition cursor-pointer"
            title="Editar chamado completo"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Linha do Tempo / Histórico */}
          <button
            onClick={() => onViewHistory(ticket)}
            className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-[#071922] rounded-lg transition cursor-pointer"
            title="Ver histórico e timeline"
          >
            <History className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
