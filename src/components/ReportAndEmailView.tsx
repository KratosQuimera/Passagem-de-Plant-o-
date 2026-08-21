import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  Download, 
  Mail, 
  CheckCircle2, 
  Copy, 
  AlertOctagon, 
  Printer, 
  FileSpreadsheet,
  Clock,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { generateShiftPDF, exportTicketsToExcel, exportTicketsToCSV } from '../utils/exportUtils';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { Ticket, UserProfile, AppSettings, ShiftReport, SHIFT_OPTIONS, ShiftOption } from '../types';

interface ReportAndEmailViewProps {
  allTickets: Ticket[];
  currentUser: UserProfile;
  settings: AppSettings;
  onSaveShiftReport: (report: Omit<ShiftReport, 'id' | 'criado_em'>) => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

export const ReportAndEmailView: React.FC<ReportAndEmailViewProps> = ({
  allTickets,
  currentUser,
  settings,
  onSaveShiftReport,
  onUpdateSettings,
}) => {
  const [shiftTurno, setShiftTurno] = useState<ShiftOption | string>(SHIFT_OPTIONS[0]);
  const [responsavelTurno, setResponsavelTurno] = useState(currentUser.nome);
  const [proximoResponsavel, setProximoResponsavel] = useState('Elias de Morais');
  const [emailRecipients, setEmailRecipients] = useState(settings.destinatarios_padrao.join(', '));
  const [emailCC, setEmailCC] = useState(settings.destinatarios_cc.join(', '));
  const [emailSubject, setEmailSubject] = useState(
    `Relatório de Passagem de Plantão TI - ${new Date().toLocaleDateString('pt-BR')} - Hospital Alemão Oswaldo Cruz`
  );
  const [emailCustomMessage, setEmailCustomMessage] = useState(settings.corpo_padrao);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const activeTickets = allTickets.filter((t) => !t.arquivado);
  const concludedTickets = allTickets.filter((t) => t.arquivado || t.status === 'Resolvido');
  const pendingTickets = activeTickets.filter((t) => t.status === 'Pendente');
  const inProgressTickets = activeTickets.filter((t) => t.status.toLowerCase().includes('andamento') || t.status.toLowerCase().includes('atendimento'));
  const waitingTickets = activeTickets.filter((t) => t.status.toLowerCase().includes('aguard'));

  const handleDownloadPDF = () => {
    generateShiftPDF(
      allTickets,
      {
        data: new Date().toLocaleDateString('pt-BR'),
        horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        turno: shiftTurno,
        responsavel: responsavelTurno,
        responsavelRecebimento: proximoResponsavel,
        resumo: emailCustomMessage,
      },
      settings
    );
  };

  const handleSendEmail = () => {
    // Record shift
    onSaveShiftReport({
      data: new Date().toLocaleDateString('pt-BR'),
      horario_plantao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      turno: shiftTurno,
      responsavel_plantao: responsavelTurno,
      responsavel_passagem: responsavelTurno,
      responsavel_recebimento: proximoResponsavel,
      total_chamados: allTickets.length,
      chamados_resolvidos: concludedTickets.length,
      chamados_pendentes: pendingTickets.length,
      chamados_aguardando: waitingTickets.length,
      chamados_em_andamento: inProgressTickets.length,
      resumo_geral: emailCustomMessage,
      observacoes_passagem: `Enviado para ${emailRecipients}`,
      chamados_ids: allTickets.map((t) => t.id),
      enviado_email: true,
      destinatarios_envio: emailRecipients.split(',').map((e) => e.trim()),
    });

    setIsEmailSent(true);
    setTimeout(() => setIsEmailSent(false), 5000);
  };

  const copyEmailText = () => {
    const text = `
=== RELATÓRIO DE PASSAGEM DE PLANTÃO TI ===
Hospital: ${settings.unidade_hospitalar}
Data: ${new Date().toLocaleDateString('pt-BR')} | Turno: ${shiftTurno}
Responsável: ${responsavelTurno} | Recebido por: ${proximoResponsavel}

--- RESUMO OPERACIONAL ---
Total de Chamados no Período: ${allTickets.length}
Concluídos / Resolvidos: ${concludedTickets.length}
Pendentes: ${pendingTickets.length}
Em Andamento: ${inProgressTickets.length}
Aguardando: ${waitingTickets.length}

--- PENDÊNCIAS PARA O PRÓXIMO PLANTÃO (${activeTickets.length} chamados) ---
${activeTickets.map((t, idx) => `${idx + 1}. [${t.numero_chamado}] (${t.prioridade}) ${t.area} - ${t.problema} | Resp: ${t.responsavel} | Ação: ${t.proxima_acao || 'N/A'}`).join('\n')}

--- CHAMADOS RESOLVIDOS NO TURNO (${concludedTickets.length} chamados) ---
${concludedTickets.map((t, idx) => `${idx + 1}. [${t.numero_chamado}] ${t.area} - ${t.problema} (Concluído por ${t.concluido_por || t.responsavel})`).join('\n')}

Mensagem:
${emailCustomMessage}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Header */}
      <div className="bg-[#0a1e27] border border-teal-800/80 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Relatório do Plantão & Envio por E-mail
            </h2>
            <p className="text-xs text-teal-300/80">
              Hospital Alemão Oswaldo Cruz • Gere relatórios oficiais em PDF, planilhas Excel e envie o sumário estruturado
            </p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 bg-rose-700 hover:bg-rose-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Gerar PDF Oficial</span>
          </button>

          <button
            onClick={() => exportTicketsToExcel(allTickets, 'Relatorio_Plantao_TI_HAOC')}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={copyEmailText}
            className="flex items-center gap-1.5 bg-[#09222c] hover:bg-[#0c2e3b] text-teal-300 px-3.5 py-2 rounded-xl text-xs font-bold border border-teal-800/80 transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedText ? 'Copiado!' : 'Copiar Texto'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Email & Report Config Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#0a1e27] border border-teal-900/80 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-teal-900/60 pb-3">
            <Mail className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Configuração de Envio por E-mail</h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Shift & Responsibles */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Turno</label>
                <select
                  value={shiftTurno}
                  onChange={(e) => setShiftTurno(e.target.value)}
                  className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-2.5 py-1.5 text-slate-200 outline-none focus:border-teal-400"
                >
                  {SHIFT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Responsável Turno</label>
                <input
                  type="text"
                  value={responsavelTurno}
                  onChange={(e) => setResponsavelTurno(e.target.value)}
                  className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-2.5 py-1.5 text-slate-200 outline-none focus:border-teal-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Recebedor do Plantão</label>
              <input
                type="text"
                value={proximoResponsavel}
                onChange={(e) => setProximoResponsavel(e.target.value)}
                placeholder="Ex: Elias de Morais / Próxima Equipe"
                className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-2.5 py-1.5 text-slate-200 outline-none focus:border-teal-400"
              />
            </div>

            {/* Recipients */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Destinatários (separados por vírgula)
              </label>
              <input
                type="text"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                placeholder="supervisao.ti@hospital.org.br, coordenacao@hospital.org.br"
                className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-2.5 py-1.5 text-slate-200 outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Com Cópia (CC)
              </label>
              <input
                type="text"
                value={emailCC}
                onChange={(e) => setEmailCC(e.target.value)}
                placeholder="gerencia.ti@hospital.org.br"
                className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-2.5 py-1.5 text-slate-200 outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Assunto do E-mail
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-2.5 py-1.5 text-slate-200 outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Mensagem / Considerações Gerais
              </label>
              <textarea
                rows={4}
                value={emailCustomMessage}
                onChange={(e) => setEmailCustomMessage(e.target.value)}
                className="w-full bg-[#06151c] border border-teal-800 rounded-xl px-2.5 py-1.5 text-slate-200 outline-none focus:border-teal-400 resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSendEmail}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 border border-teal-400/30"
              >
                <Send className="w-4 h-4" />
                <span>ENVIAR RELATÓRIO POR E-MAIL</span>
              </button>
            </div>

            {isEmailSent && (
              <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Relatório enviado com sucesso para <strong>{emailRecipients}</strong> e histórico registrado!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Report Preview (7 cols) */}
        <div className="lg:col-span-7 bg-[#0a1e27] border border-teal-900/80 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-teal-900/60 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white">Visualização do Relatório Gerado</h3>
            </div>
            <span className="text-[11px] text-teal-400 font-mono">
              {new Date().toLocaleDateString('pt-BR')} • {shiftTurno}
            </span>
          </div>

          {/* Document Sheet Preview */}
          <div className="bg-[#06151c] border border-teal-900/80 rounded-xl p-5 space-y-4 text-xs font-sans">
            {/* Header */}
            <div className="border-b border-teal-900/60 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-white text-sm">
                  {settings.sistema_nome}
                </h4>
                <div className="text-teal-300 text-[11px]">{settings.unidade_hospitalar}</div>
              </div>
              <div className="text-right text-[11px] text-slate-400 font-mono">
                <div>Responsável: <strong className="text-slate-200">{responsavelTurno}</strong></div>
                <div>Recebido por: <strong className="text-slate-200">{proximoResponsavel}</strong></div>
              </div>
            </div>

            {/* Metrics summary cards */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-[#071922] p-2 rounded-xl border border-teal-900/60">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Total</div>
                <div className="text-base font-bold text-white font-mono">{allTickets.length}</div>
              </div>
              <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/40">
                <div className="text-emerald-400 text-[10px] uppercase font-bold">Resolvidos</div>
                <div className="text-base font-bold text-emerald-400 font-mono">{concludedTickets.length}</div>
              </div>
              <div className="bg-rose-950/40 p-2 rounded-xl border border-rose-800/40">
                <div className="text-rose-400 text-[10px] uppercase font-bold">Pendentes</div>
                <div className="text-base font-bold text-rose-400 font-mono">{pendingTickets.length}</div>
              </div>
              <div className="bg-amber-950/40 p-2 rounded-xl border border-amber-800/40">
                <div className="text-amber-400 text-[10px] uppercase font-bold">Aguardando</div>
                <div className="text-base font-bold text-amber-400 font-mono">{waitingTickets.length}</div>
              </div>
            </div>

            {/* Section: Pendências para o Próximo Plantão */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold uppercase text-[11px]">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>PENDÊNCIAS PARA O PRÓXIMO PLANTÃO ({activeTickets.length})</span>
              </div>

              {activeTickets.length === 0 ? (
                <div className="bg-emerald-950/20 text-emerald-300 p-2 rounded-xl border border-emerald-900/30 text-[11px]">
                  Sem pendências para o próximo turno.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {activeTickets.map((t) => (
                    <div key={t.id} className="bg-[#071922] border border-teal-900/60 rounded-xl p-2 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-teal-400">{t.numero_chamado}</span>
                          <PriorityBadge priority={t.prioridade} size="sm" />
                          <span className="text-slate-200 font-semibold">{t.area}</span>
                        </div>
                        <StatusBadge status={t.status} size="sm" />
                      </div>
                      <div className="text-slate-300">
                        <strong>Problema:</strong> {t.problema}
                      </div>
                      {t.proxima_acao && (
                        <div className="text-teal-300 bg-[#05151c] px-2 py-0.5 rounded-lg border border-teal-900/60">
                          <strong>Próxima ação:</strong> {t.proxima_acao} (Resp: {t.responsavel})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section: Chamados Resolvidos no Turno */}
            <div className="space-y-2 pt-2 border-t border-teal-900/60">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CHAMADOS CONCLUÍDOS / RESOLVIDOS ({concludedTickets.length})</span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {concludedTickets.map((t) => (
                  <div key={t.id} className="bg-[#071922]/70 border border-teal-900/60 rounded-xl p-2 text-[11px] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400">{t.numero_chamado}</span>
                      <span className="text-slate-300">{t.area} - {t.problema}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[10px]">
                      Concluído por {t.concluido_por || t.responsavel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
