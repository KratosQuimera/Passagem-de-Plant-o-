import React, { useState } from 'react';
import { X, Plus, AlertCircle, Sparkles, Check, Building2, User, HelpCircle } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { AreaItem, ResponsibleItem, StatusItem, PriorityItem, Ticket } from '../types';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    numero_chamado: string;
    prioridade: string;
    area: string;
    problema: string;
    status: string;
    proxima_acao: string;
    responsavel: string;
    observacoes: string;
  }) => void;
  areas: AreaItem[];
  responsibles: ResponsibleItem[];
  statuses: StatusItem[];
  priorities: PriorityItem[];
  onQuickAddArea?: (nome: string) => void;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  areas,
  responsibles,
  statuses,
  priorities,
  onQuickAddArea,
}) => {
  const [numeroChamado, setNumeroChamado] = useState('');
  const [prioridade, setPrioridade] = useState('P4');
  const [area, setArea] = useState(areas[0]?.nome || 'Centro Cirúrgico');
  const [problema, setProblema] = useState('');
  const [status, setStatus] = useState('Pendente');
  const [proximaAcao, setProximaAcao] = useState('');
  const [responsavel, setResponsavel] = useState(responsibles[0]?.nome || 'Wagner Marcelino');
  const [observacoes, setObservacoes] = useState('');
  const [newAreaInput, setNewAreaInput] = useState('');
  const [isAddingNewArea, setIsAddingNewArea] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroChamado.trim()) return;
    if (!problema.trim()) return;

    onSubmit({
      numero_chamado: numeroChamado.trim().toUpperCase(),
      prioridade,
      area: area || 'Geral',
      problema: problema.trim(),
      status,
      proxima_acao: proximaAcao.trim(),
      responsavel,
      observacoes: observacoes.trim(),
    });

    // Reset form
    setNumeroChamado('');
    setProblema('');
    setProximaAcao('');
    setObservacoes('');
    onClose();
  };

  const handleAddNewArea = () => {
    if (newAreaInput.trim()) {
      if (onQuickAddArea) onQuickAddArea(newAreaInput.trim());
      setArea(newAreaInput.trim());
      setNewAreaInput('');
      setIsAddingNewArea(false);
    }
  };

  const generateTicketNumber = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const prefix = Math.random() > 0.3 ? 'T' : 'R';
    setNumeroChamado(`${prefix}${randomNum}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a1e27] border border-teal-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-slate-200">
        {/* Modal Header */}
        <div className="bg-[#071922] px-6 py-4 border-b border-teal-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cadastrar Novo Chamado</h2>
              <p className="text-xs text-teal-300/80">
                Hospital Alemão Oswaldo Cruz • Registro de atendimento do plantão
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Número do Chamado */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  Número do Chamado / Ticket <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateTicketNumber}
                  className="text-[11px] text-teal-400 hover:text-teal-300 transition cursor-pointer font-semibold"
                >
                  Gerar automático
                </button>
              </div>
              <input
                type="text"
                required
                value={numeroChamado}
                onChange={(e) => setNumeroChamado(e.target.value)}
                placeholder="Ex: T504757 ou R119018"
                className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
              />
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Prioridade <span className="text-rose-400">*</span>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Área */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-200">
                  Área / Setor Hospitalar <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewArea(!isAddingNewArea)}
                  className="text-[11px] text-teal-400 hover:text-teal-300 transition cursor-pointer"
                >
                  + Nova área
                </button>
              </div>

              {isAddingNewArea ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newAreaInput}
                    onChange={(e) => setNewAreaInput(e.target.value)}
                    placeholder="Nome da nova área..."
                    className="w-full bg-[#06151c] border border-teal-400 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddNewArea}
                    className="bg-teal-600 hover:bg-teal-500 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewArea(false)}
                    className="text-slate-400 hover:text-white px-1.5 py-1.5 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
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
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Status Inicial <span className="text-rose-400">*</span>
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

          {/* Problema */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Problema / Solicitação <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={problema}
              onChange={(e) => setProblema(e.target.value)}
              placeholder="Ex: Zebra Pulseira, Trocar conector, Remanejamento, Organização, Configurar Painel..."
              className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Próxima Ação */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Próxima Ação
              </label>
              <input
                type="text"
                value={proximaAcao}
                onChange={(e) => setProximaAcao(e.target.value)}
                placeholder="Ex: Posicionar sensor e calibrar, Trocar conector keystone..."
                className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* Responsável */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Responsável pelo Atendimento <span className="text-rose-400">*</span>
              </label>
              <select
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                {responsibles.map((r) => (
                  <option key={r.id} value={r.nome}>
                    {r.nome} {r.cargo ? `(${r.cargo})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Observações Adicionais (Permite texto detalhado)
            </label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Descreva detalhes adicionais, procedimentos já realizados, números de patrimônio ou orientações para a equipe..."
              className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="bg-[#071922] -mx-6 -mb-6 px-6 py-4 border-t border-teal-900/80 flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#09222c] hover:bg-[#0c2e3b] text-slate-300 rounded-xl text-xs font-semibold border border-teal-800/80 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 active:from-teal-700 active:to-cyan-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-950/40 border border-teal-400/30 transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>SALVAR NOVO CHAMADO</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
