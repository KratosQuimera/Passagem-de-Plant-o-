import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  AlertOctagon, 
  Clock, 
  PauseCircle, 
  CheckCircle2, 
  Pin, 
  FileText, 
  Send, 
  Download, 
  UserCheck, 
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Edit3,
  Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { generateShiftPDF, exportTicketsToExcel } from '../utils/exportUtils';
import { Ticket, UserProfile, AppSettings, ShiftReport } from '../types';

interface HandoverViewProps {
  tickets: Ticket[];
  currentUser: UserProfile;
  users: UserProfile[];
  settings: AppSettings;
  onConcludeTicket: (ticket: Ticket) => void;
  onEditTicket: (ticket: Ticket) => void;
  onViewHistory: (ticket: Ticket) => void;
  onSaveShiftReport: (report: Omit<ShiftReport, 'id' | 'criado_em'>) => void;
  onNavigateToEmail: () => void;
}

export const HandoverView: React.FC<HandoverViewProps> = ({
  tickets,
  currentUser,
  users,
  settings,
  onConcludeTicket,
  onEditTicket,
  onViewHistory,
  onSaveShiftReport,
  onNavigateToEmail,
}) => {
  const [selectedShift, setSelectedShift] = useState<'Plantão Diurno (07:00 - 19:00)' | 'Plantão Noturno (19:00 - 07:00)' | 'Plantão Comercial (08:00 - 18:00)'>('Plantão Diurno (07:00 - 19:00)');
  const [receiverName, setReceiverName] = useState(users[1]?.nome || 'Elias de Morais');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [isHandoverCompleted, setIsHandoverCompleted] = useState(false);

  // Group tickets into handover categories
  const activeTickets = tickets.filter((t) => !t.arquivado);
  const urgentTickets = activeTickets.filter((t) => t.prioridade === 'P1' || t.prioridade === 'P2');
  const inProgressTickets = activeTickets.filter((t) => t.status.toLowerCase().includes('andamento') || t.status.toLowerCase().includes('atendimento'));
  const waitingTickets = activeTickets.filter((t) => t.status.toLowerCase().includes('aguard'));
  const otherPendingTickets = activeTickets.filter(
    (t) => !urgentTickets.includes(t) && !inProgressTickets.includes(t) && !waitingTickets.includes(t)
  );
  const concludedTickets = tickets.filter((t) => t.arquivado || t.status === 'Resolvido');

  const handleFinalizeHandover = () => {
    // Save shift record
    const reportData = {
      data: new Date().toLocaleDateString('pt-BR'),
      horario_plantao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      turno: selectedShift,
      responsavel_plantao: currentUser.nome,
      responsavel_passagem: currentUser.nome,
      responsavel_recebimento: receiverName,
      total_chamados: tickets.length,
      chamados_resolvidos: concludedTickets.length,
      chamados_pendentes: activeTickets.filter((t) => t.status === 'Pendente').length,
      chamados_aguardando: waitingTickets.length,
      chamados_em_andamento: inProgressTickets.length,
      resumo_geral: `Passagem de plantão concluída por ${currentUser.nome} para ${receiverName}. Total de ${activeTickets.length} pendências ativas transferidas.`,
      observacoes_passagem: handoverNotes,
      chamados_ids: tickets.map((t) => t.id),
      enviado_email: false,
    };

    onSaveShiftReport(reportData);
    setIsHandoverCompleted(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.log('Confetti trigger', e);
    }
  };

  const handleExportPDF = () => {
    generateShiftPDF(
      tickets,
      {
        data: new Date().toLocaleDateString('pt-BR'),
        horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        turno: selectedShift,
        responsavel: currentUser.nome,
        responsavelRecebimento: receiverName,
        resumo: handoverNotes,
      },
      settings
    );
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Handover Hero Banner */}
      <div className="bg-gradient-to-r from-[#071922] via-[#0a232f] to-[#071922] border border-teal-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-teal-950/80 text-teal-300 px-3 py-1 rounded-full text-xs font-bold border border-teal-700/60">
              <ArrowRightLeft className="w-3.5 h-3.5 text-teal-400" />
              <span>Transição e Passagem Operacional • Hospital Alemão Oswaldo Cruz</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Passagem de Plantão TI
            </h2>
            <p className="text-xs text-teal-200/90 max-w-xl leading-relaxed">
              Visão sintetizada e estruturada para transferência de turno. Revise chamados urgentes, em andamento, aguardando e certifique-se das pendências repassadas para a próxima equipe com segurança.
            </p>
          </div>

          {/* Shift Handover Actions */}
          <div className="bg-[#05151c] p-4 rounded-xl border border-teal-800/60 w-full lg:w-auto min-w-[320px] space-y-3 shadow-lg">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-teal-400/80 font-bold uppercase">Turno Atual</label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value as any)}
                  className="w-full bg-[#081d26] border border-teal-800 rounded-lg px-2 py-1 text-slate-200 text-xs mt-0.5 outline-none focus:border-teal-400"
                >
                  <option value="Plantão Diurno (07:00 - 19:00)">Diurno (07h - 19h)</option>
                  <option value="Plantão Noturno (19:00 - 07:00)">Noturno (19h - 07h)</option>
                  <option value="Plantão Comercial (08:00 - 18:00)">Comercial (08h - 18h)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-teal-400/80 font-bold uppercase">Recebendo Turno</label>
                <select
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full bg-[#081d26] border border-teal-800 rounded-lg px-2 py-1 text-slate-200 text-xs mt-0.5 outline-none focus:border-teal-400"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.nome}>
                      {u.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExportPDF}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#09222c] hover:bg-[#0c2e3b] text-teal-300 py-2 px-3 rounded-xl text-xs font-bold border border-teal-700/60 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-teal-400" />
                <span>Baixar PDF</span>
              </button>
              <button
                onClick={handleFinalizeHandover}
                className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white py-2 px-3 rounded-xl text-xs font-bold shadow-md shadow-teal-950/40 border border-teal-400/30 transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Salvar Passagem</span>
              </button>
            </div>
          </div>
        </div>

        {isHandoverCompleted && (
          <div className="mt-4 bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Passagem registrada com sucesso! De <strong>{currentUser.nome}</strong> para <strong>{receiverName}</strong>.
              </span>
            </div>
            <button
              onClick={onNavigateToEmail}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Enviar por E-mail Agora</span>
            </button>
          </div>
        )}
      </div>

      {/* Structured Handover Sections */}
      <div className="grid grid-cols-1 gap-6">
        {/* 1. 🔴 URGENTE / ALTA PRIORIDADE */}
        <section className="bg-[#0a1e27] border border-red-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-red-900/50 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-red-600/20 text-red-400 rounded-xl border border-red-600/40">
                <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>1. URGENTE / ALTA PRIORIDADE (P1 & P2)</span>
                  <span className="bg-red-950 text-red-300 text-xs px-2 py-0.5 rounded-full border border-red-800 font-mono font-bold">
                    {urgentTickets.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Chamados críticos que impactam diretamente a operação e exigem atenção imediata da nova equipe
                </p>
              </div>
            </div>
          </div>

          {urgentTickets.length === 0 ? (
            <div className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Nenhum chamado crítico P1/P2 em aberto no momento. Excelente!</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {urgentTickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#06151c] border border-red-500/50 rounded-xl p-3.5 space-y-2 relative hover:border-red-400 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-red-400">{t.numero_chamado}</span>
                      <PriorityBadge priority={t.prioridade} size="sm" />
                    </div>
                    <StatusBadge status={t.status} size="sm" />
                  </div>
                  <div className="text-xs text-slate-200">
                    <strong>{t.area}:</strong> {t.problema}
                  </div>
                  {t.proxima_acao && (
                    <div className="text-[11px] text-red-300 bg-red-950/40 p-1.5 rounded border border-red-900/40">
                      <strong>Ação Necessária:</strong> {t.proxima_acao}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-teal-950">
                    <span>Resp: <strong className="text-slate-200">{t.responsavel}</strong></span>
                    <button
                      onClick={() => onConcludeTicket(t)}
                      className="text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. 🟠 EM ANDAMENTO */}
        <section className="bg-[#0a1e27] border border-sky-500/40 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-teal-900/60 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-600/20 text-sky-400 rounded-xl border border-sky-500/40">
                <Clock className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>2. EM ATENDIMENTO / EM ANDAMENTO</span>
                  <span className="bg-sky-950 text-sky-300 text-xs px-2 py-0.5 rounded-full border border-sky-800 font-mono font-bold">
                    {inProgressTickets.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Chamados que já foram iniciados e precisam de continuidade técnica
                </p>
              </div>
            </div>
          </div>

          {inProgressTickets.length === 0 ? (
            <div className="text-xs text-slate-400 bg-[#06151c] p-3 rounded-xl">
              Nenhum chamado em andamento no momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {inProgressTickets.map((t) => (
                <div key={t.id} className="bg-[#06151c] border border-teal-900/60 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-teal-400">{t.numero_chamado}</span>
                    <PriorityBadge priority={t.prioridade} size="sm" />
                  </div>
                  <div className="text-xs font-semibold text-white">{t.problema}</div>
                  <div className="text-[11px] text-slate-400">{t.area}</div>
                  <div className="text-[11px] text-teal-300 bg-[#081d26] p-1.5 rounded-lg border border-teal-950">
                    <strong>Próx. Ação:</strong> {t.proxima_acao || 'Dar prosseguimento'}
                  </div>
                  <div className="text-[11px] text-slate-400">Resp: <strong className="text-slate-200">{t.responsavel}</strong></div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. 🟡 AGUARDANDO */}
        <section className="bg-[#0a1e27] border border-amber-500/40 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-teal-900/60 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-600/20 text-amber-400 rounded-xl border border-amber-500/40">
                <PauseCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>3. AGUARDANDO (Terceiros / Peças / Senhas / Fornecedor)</span>
                  <span className="bg-amber-950 text-amber-300 text-xs px-2 py-0.5 rounded-full border border-amber-800 font-mono font-bold">
                    {waitingTickets.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Chamados pausados aguardando retorno externo, peças ou aprovação
                </p>
              </div>
            </div>
          </div>

          {waitingTickets.length === 0 ? (
            <div className="text-xs text-slate-400 bg-[#06151c] p-3 rounded-xl">
              Nenhum chamado aguardando terceiros.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {waitingTickets.map((t) => (
                <div key={t.id} className="bg-[#06151c] border border-teal-900/60 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-amber-400">{t.numero_chamado}</span>
                    <PriorityBadge priority={t.prioridade} size="sm" />
                  </div>
                  <div className="text-xs font-semibold text-white">{t.problema}</div>
                  <div className="text-[11px] text-slate-400">{t.area}</div>
                  <div className="text-[11px] text-amber-300 bg-amber-950/30 border border-amber-900/30 p-1.5 rounded-lg">
                    <strong>Motivo de Espera:</strong> {t.observacoes || t.proxima_acao || 'Aguardando liberação'}
                  </div>
                  <div className="text-[11px] text-slate-400">Resp: <strong className="text-slate-200">{t.responsavel}</strong></div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. 📌 TODAS AS PENDÊNCIAS PARA O PRÓXIMO PLANTÃO */}
        <section className="bg-[#0a1e27] border border-teal-900/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-teal-900/60 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-600/20 text-teal-400 rounded-xl border border-teal-500/40">
                <Pin className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>4. RESUMO GERAL DAS PENDÊNCIAS (Total: {activeTickets.length})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Tudo que deve continuar em aberto para o próximo profissional de plantão
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#071922] text-teal-300 border-b border-teal-900/80 uppercase font-bold">
                  <th className="py-2.5 px-3">Chamado</th>
                  <th className="py-2.5 px-3">Prioridade</th>
                  <th className="py-2.5 px-3">Área</th>
                  <th className="py-2.5 px-3">Problema</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Próxima Ação</th>
                  <th className="py-2.5 px-3">Responsável</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-900/40 font-sans">
                {activeTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-[#071922]/70 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-400">{t.numero_chamado}</td>
                    <td className="py-2.5 px-3"><PriorityBadge priority={t.prioridade} size="sm" /></td>
                    <td className="py-2.5 px-3 text-slate-200">{t.area}</td>
                    <td className="py-2.5 px-3 text-slate-100 font-medium">{t.problema}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={t.status} size="sm" /></td>
                    <td className="py-2.5 px-3 text-slate-300">{t.proxima_acao || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-semibold">{t.responsavel}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onConcludeTicket(t)}
                        className="text-emerald-400 hover:text-emerald-300 text-xs font-bold cursor-pointer"
                      >
                        Concluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. 🟢 CONCLUÍDOS NO PLANTÃO */}
        <section className="bg-[#0a1e27] border border-emerald-500/40 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-teal-900/60 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/40">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>5. CHAMADOS RESOLVIDOS / CONCLUÍDOS NO PLANTÃO</span>
                  <span className="bg-emerald-950 text-emerald-300 text-xs px-2 py-0.5 rounded-full border border-emerald-800 font-mono font-bold">
                    {concludedTickets.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Chamados finalizados e arquivados permanentemente com histórico garantido
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {concludedTickets.map((t) => (
              <div key={t.id} className="bg-[#06151c] border border-teal-900/60 rounded-xl p-3 space-y-1.5 opacity-90 hover:opacity-100">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-emerald-400">{t.numero_chamado}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {t.concluido_em ? new Date(t.concluido_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Resolvido'}
                  </span>
                </div>
                <div className="text-xs text-slate-200 font-medium">{t.problema}</div>
                <div className="text-[11px] text-teal-400/80">{t.area}</div>
                <div className="text-[10px] text-emerald-300">
                  Finalizado por: <strong>{t.concluido_por || t.responsavel}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
