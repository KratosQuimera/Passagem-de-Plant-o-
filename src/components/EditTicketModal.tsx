import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Building2, User, Clock, CheckCircle2, History } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { AreaItem, ResponsibleItem, StatusItem, PriorityItem, Ticket } from '../types';

interface EditTicketModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Ticket>) => void;
  onConcludeFromEdit?: (ticket: Ticket) => void;
  areas: AreaItem[];
  responsibles: ResponsibleItem[];
  statuses: StatusItem[];
  priorities: PriorityItem[];
  onViewHistory?: (ticket: Ticket) => void;
}

export const EditTicketModal: React.FC<EditTicketModalProps> = ({
  isOpen,
  ticket,
  onClose,
  onSave,
  onConcludeFromEdit,
  areas,
  responsibles,
  statuses,
  priorities,
  onViewHistory,
}) => {
  const [prioridade, setPrioridade] = useState('P4');
  const [area, setArea] = useState('');
  const [problema, setProblema] = useState('');
  const [status, setStatus] = useState('Pendente');
  const [proximaAcao, setProximaAcao] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (ticket) {
      setPrioridade(ticket.prioridade);
      setArea(ticket.area);
      setProblema(ticket.problema);
      setStatus(ticket.status);
      setProximaAcao(ticket.proxima_acao || '');
      setResponsavel(ticket.responsavel);
      setObservacoes(ticket.observacoes || '');
    }
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(ticket.id, {
      prioridade,
      area,
      problema: problema.trim(),
      status,
      proxima_acao: proximaAcao.trim(),
      responsavel,
      observacoes: observacoes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a1e27] border border-teal-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-slate-200">
        {/* Header */}
        <div className="bg-[#071922] px-6 py-4 border-b border-teal-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30 font-mono font-bold text-sm">
              {ticket.numero_chamado}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Editar Chamado</h2>
                <span className="text-xs text-teal-400 font-mono">ID: {ticket.id}</span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Aberto em: {new Date(ticket.criado_em).toLocaleString('pt-BR')}</span>
                <span>•</span>
                <span>Por: {ticket.criado_por}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onViewHistory && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewHistory(ticket);
                }}
                className="text-xs text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>Histórico</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#09222c] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prioridade */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Prioridade
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['P1', 'P2', 'P3', 'P4'].map((p) => {
                  const isSelected = prioridade === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPrioridade(p)}
                      className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? 'border-teal-400 ring-2 ring-teal-400/40 bg-[#0d2f3d]'
                          : 'border-teal-900/60 bg-[#06151c] hover:bg-[#071922] opacity-70'
                      }`}
                    >
                      <PriorityBadge priority={p} size="sm" />
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        {p === 'P1' ? 'Crítico' : p === 'P2' ? 'Alto' : p === 'P3' ? 'Médio' : 'Normal'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Status Atual
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                {statuses.map((st) => (
                  <option key={st.id} value={st.nome}>
                    {st.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Área */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Área / Setor
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.nome}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Responsável */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Responsável
              </label>
              <select
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                {responsibles.map((r) => (
                  <option key={r.id} value={r.nome}>
                    {r.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Problema */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Problema
            </label>
            <input
              type="text"
              required
              value={problema}
              onChange={(e) => setProblema(e.target.value)}
              className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>

          {/* Próxima Ação */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Próxima Ação
            </label>
            <input
              type="text"
              value={proximaAcao}
              onChange={(e) => setProximaAcao(e.target.value)}
              className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Observações
            </label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="bg-[#071922] -mx-6 -mb-6 px-6 py-4 border-t border-teal-900/80 flex items-center justify-between gap-3 mt-6">
            <div>
              {onConcludeFromEdit && !ticket.arquivado && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onConcludeFromEdit(ticket);
                  }}
                  className="px-3.5 py-2 bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 hover:text-emerald-100 rounded-xl text-xs font-bold border border-emerald-700/60 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Concluir Chamado</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#09222c] hover:bg-[#0c2e3b] text-slate-300 rounded-xl text-xs font-semibold border border-teal-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-950/40 border border-teal-400/30 transition cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>SALVAR ALTERAÇÕES</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
