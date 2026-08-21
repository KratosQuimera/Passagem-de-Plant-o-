import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, X, ArrowRight, UserCheck } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { Ticket, UserProfile } from '../types';

interface ConcludeTicketModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  currentUser: UserProfile;
  onClose: () => void;
  onConfirm: (ticketId: string, notes?: string) => void;
}

export const ConcludeTicketModal: React.FC<ConcludeTicketModalProps> = ({
  isOpen,
  ticket,
  currentUser,
  onClose,
  onConfirm,
}) => {
  const [resolutionNotes, setResolutionNotes] = useState('');

  if (!isOpen || !ticket) return null;

  const handleConfirm = () => {
    onConfirm(ticket.id, resolutionNotes);
    setResolutionNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a1e27] border border-teal-800/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-slate-200">
        {/* Header */}
        <div className="bg-[#071922] px-6 py-4 border-b border-teal-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40 shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Concluir & Arquivar Chamado</h2>
              <div className="flex items-center gap-2 text-xs font-mono text-teal-300">
                <span>{ticket.numero_chamado}</span>
                <span>•</span>
                <span>{ticket.area}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#09222c] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Reassurance Banner (Soft Delete Guarantee) */}
          <div className="bg-[#06151c] border border-teal-700/60 rounded-xl p-3.5 space-y-2">
            <div className="flex items-start gap-2.5 text-xs text-slate-200">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">
                  Deseja concluir este chamado?
                </p>
                <p className="text-teal-200/90 text-[11px] mt-0.5">
                  Ele será removido do painel operacional ativo, mas continuará <strong>disponível permanentemente no Histórico</strong> e será <strong>incluído no relatório de passagem do plantão</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Summary Card */}
          <div className="bg-[#071922] rounded-xl p-3.5 border border-teal-900/60 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Problema:</span>
              <span className="font-semibold text-slate-200">{ticket.problema}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Prioridade:</span>
              <PriorityBadge priority={ticket.prioridade} size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Responsável:</span>
              <span className="text-slate-200 font-medium">{ticket.responsavel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Concluído por:</span>
              <span className="text-teal-300 font-bold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                {currentUser.nome}
              </span>
            </div>
          </div>

          {/* Resolution note input */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Observação de Conclusão / Solução Final (Opcional):
            </label>
            <textarea
              rows={2}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Ex: Impressora configurada e testada no setor com a enfermagem..."
              className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-[#071922] px-6 py-3.5 border-t border-teal-900/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#09222c] hover:bg-[#0c2e3b] text-slate-300 rounded-xl text-xs font-semibold border border-teal-800 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/40 transition cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>CONFIRMAR CONCLUSÃO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
