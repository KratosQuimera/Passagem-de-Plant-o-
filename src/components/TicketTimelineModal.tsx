import React from 'react';
import { X, History, Clock, ArrowRight, CheckCircle2, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { Ticket, TicketHistoryItem } from '../types';

interface TicketTimelineModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  historyItems: TicketHistoryItem[];
  onClose: () => void;
  onReopen?: (ticket: Ticket) => void;
}

export const TicketTimelineModal: React.FC<TicketTimelineModalProps> = ({
  isOpen,
  ticket,
  historyItems,
  onClose,
  onReopen,
}) => {
  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a1e27] border border-teal-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#071922] px-6 py-4 border-b border-teal-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Linha do Tempo & Histórico</h2>
                <span className="font-mono font-bold text-teal-400 text-sm">
                  {ticket.numero_chamado}
                </span>
              </div>
              <p className="text-xs text-teal-300/80">
                Auditoria de alterações, status e histórico permanente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#09222c] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Basic Summary */}
        <div className="bg-[#081d26] px-6 py-3 border-b border-teal-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Área:</span>
            <span className="font-bold text-slate-200 bg-[#06151c] px-2 py-0.5 rounded-lg border border-teal-900">
              {ticket.area}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Prioridade:</span>
            <PriorityBadge priority={ticket.prioridade} size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Status Atual:</span>
            <StatusBadge status={ticket.status} size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Responsável:</span>
            <span className="font-semibold text-teal-300">{ticket.responsavel}</span>
          </div>
        </div>

        {/* Timeline Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">
            Registro Cronológico de Eventos ({historyItems.length})
          </div>

          {historyItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs bg-[#06151c] rounded-xl border border-teal-950 p-6">
              Nenhum evento registrado ainda para este chamado.
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-teal-900 space-y-6">
              {historyItems.map((item, idx) => (
                <div key={item.id || idx} className="relative group">
                  {/* Dot icon on line */}
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#0a1e27] border-2 border-teal-400 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                  </div>

                  <div className="bg-[#071922] border border-teal-900/60 rounded-xl p-3.5 text-xs space-y-1.5 hover:border-teal-700/60 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        {new Date(item.criado_em).toLocaleString('pt-BR')}
                      </span>
                      <span className="text-[11px] text-slate-400 bg-[#06151c] px-2 py-0.5 rounded border border-teal-950">
                        {item.usuario_nome}
                      </span>
                    </div>

                    <div className="font-medium text-slate-200">
                      {item.descricao}
                    </div>

                    {item.observacoes && (
                      <div className="text-slate-400 bg-[#06151c] p-2 rounded-lg border border-teal-950 text-[11px] italic">
                        "{item.observacoes}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#071922] px-6 py-3.5 border-t border-teal-900/80 flex items-center justify-between gap-3">
          <div>
            {ticket.arquivado && onReopen && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReopen(ticket);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-950 hover:bg-teal-900 text-teal-300 rounded-xl text-xs font-bold border border-teal-700/60 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reabrir para o Painel</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#09222c] hover:bg-[#0c2e3b] text-slate-300 rounded-xl text-xs font-semibold border border-teal-800 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
