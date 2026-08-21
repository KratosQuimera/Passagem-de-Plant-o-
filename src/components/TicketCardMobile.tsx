import React from 'react';
import { 
  CheckCircle2, 
  Edit3, 
  History, 
  User, 
  MapPin, 
  ArrowRight, 
  Clock 
} from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { Ticket } from '../types';

interface TicketCardMobileProps {
  ticket: Ticket;
  canEdit?: boolean;
  canConclude?: boolean;
  onConclude: (ticket: Ticket) => void;
  onEdit: (ticket: Ticket) => void;
  onViewHistory: (ticket: Ticket) => void;
}

export const TicketCardMobile: React.FC<TicketCardMobileProps> = ({
  ticket,
  canEdit = true,
  canConclude = true,
  onConclude,
  onEdit,
  onViewHistory,
}) => {
  const isHighPriority = ticket.prioridade === 'P1' || ticket.prioridade === 'P2';

  return (
    <div
      className={`rounded-2xl border p-4 shadow-md transition ${
        isHighPriority
          ? 'bg-[#081d26] border-orange-500/50 ring-1 ring-orange-500/20'
          : 'bg-[#0a1e27] border-teal-900/60'
      }`}
    >
      {/* Card Header: Ticket Number, Priority, Status */}
      <div className="flex items-center justify-between gap-2 border-b border-teal-900/60 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-base text-teal-400">
            {ticket.numero_chamado}
          </span>
          <PriorityBadge priority={ticket.prioridade} size="sm" />
        </div>
        <StatusBadge status={ticket.status} size="sm" />
      </div>

      {/* Area & Problem */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-300">
          <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
          <span>{ticket.area}</span>
        </div>

        <div className="text-sm font-semibold text-white">
          <span className="text-slate-400 font-normal text-xs mr-1.5">Problema:</span>
          {ticket.problema}
        </div>

        {ticket.proxima_acao && (
          <div className="text-xs text-teal-200 bg-[#06171f] border border-teal-900/80 rounded-xl p-2 flex items-start gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-teal-300">Próxima Ação:</strong> {ticket.proxima_acao}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-teal-400" />
            <strong className="text-slate-200">{ticket.responsavel}</strong>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-teal-400/70">
            <Clock className="w-3 h-3" />
            {new Date(ticket.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {ticket.observacoes && (
          <div className="text-xs text-slate-300 bg-[#05151c] rounded-xl p-2 border border-teal-950">
            <span className="text-teal-400/80 font-medium">Obs:</span> {ticket.observacoes}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-teal-900/60">
        {canConclude && (
          <button
            onClick={() => onConclude(ticket)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 px-2 rounded-xl text-xs font-bold shadow transition cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Concluir</span>
          </button>
        )}

        {canEdit && (
          <button
            onClick={() => onEdit(ticket)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#09222c] hover:bg-[#0c2e3b] text-slate-200 py-1.5 px-2 rounded-xl text-xs font-medium border border-teal-800/60 transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-teal-400" />
            <span>Editar</span>
          </button>
        )}

        <button
          onClick={() => onViewHistory(ticket)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#09222c] hover:bg-[#0c2e3b] text-slate-300 py-1.5 px-2 rounded-xl text-xs font-medium border border-teal-800/60 transition cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span>Histórico</span>
        </button>
      </div>
    </div>
  );
};
