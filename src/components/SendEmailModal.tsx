import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  Copy, 
  CheckCircle2, 
  Download, 
  FileSpreadsheet, 
  AlertCircle, 
  Layers, 
  ExternalLink,
  Sparkles,
  Building2,
  Clock,
  UserCheck
} from 'lucide-react';
import { Ticket, UserProfile, AppSettings, ShiftReport } from '../types';
import { generateShiftPDF, exportTicketsToExcel } from '../utils/exportUtils';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { OswaldoCruzLogo } from './OswaldoCruzLogo';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTickets: Ticket[];
  currentUser: UserProfile;
  settings: AppSettings;
  onSaveShiftReport: (report: Omit<ShiftReport, 'id' | 'criado_em'>) => void;
  onGoToFullReport?: () => void;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  allTickets,
  currentUser,
  settings,
  onSaveShiftReport,
  onGoToFullReport,
}) => {
  const [shiftTurno, setShiftTurno] = useState('Plantão Diurno (07:00 - 19:00)');
  const [responsavelTurno, setResponsavelTurno] = useState(currentUser.nome);
  const [proximoResponsavel, setProximoResponsavel] = useState('Elias de Morais');
  const [emailRecipients, setEmailRecipients] = useState(settings.destinatarios_padrao.join(', '));
  const [emailCC, setEmailCC] = useState(settings.destinatarios_cc.join(', '));
  const [emailSubject, setEmailSubject] = useState(
    `[TI] Relatório de Passagem de Plantão - ${new Date().toLocaleDateString('pt-BR')} - ${shiftTurno.split(' ')[0]}`
  );
  const [customNotes, setCustomNotes] = useState(settings.corpo_padrao || '');
  const [isCopied, setIsCopied] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'recipients'>('preview');

  if (!isOpen) return null;

  const activeTickets = allTickets.filter((t) => !t.arquivado);
  const concludedTickets = allTickets.filter((t) => t.arquivado || t.status === 'Resolvido');
  const pendingTickets = activeTickets.filter((t) => t.status === 'Pendente');
  const inProgressTickets = activeTickets.filter((t) => t.status.toLowerCase().includes('andamento') || t.status.toLowerCase().includes('atendimento'));
  const waitingTickets = activeTickets.filter((t) => t.status.toLowerCase().includes('aguard'));

  const generatePlainTextBody = () => {
    return `
=====================================================
HOSPITAL ALEMÃO OSWALDO CRUZ - TI OPERAÇÕES
RELATÓRIO DE PASSAGEM DE PLANTÃO DE TI
=====================================================

Unidade: ${settings.unidade_hospitalar}
Data: ${new Date().toLocaleDateString('pt-BR')} | Turno: ${shiftTurno}
Responsável: ${responsavelTurno} | Recebido por: ${proximoResponsavel}
Data/Hora Emissão: ${new Date().toLocaleString('pt-BR')}

-----------------------------------------------------
1. RESUMO GERAL DO PLANTÃO
-----------------------------------------------------
• Total de Chamados Registrados: ${allTickets.length}
• Chamados Pendentes (Atenção): ${pendingTickets.length}
• Chamados Em Atendimento: ${inProgressTickets.length}
• Chamados Aguardando: ${waitingTickets.length}
• Chamados Resolvidos/Concluídos: ${concludedTickets.length}

-----------------------------------------------------
2. PENDÊNCIAS CRÍTICAS PARA O PRÓXIMO TURNO (${activeTickets.length} chamados)
-----------------------------------------------------
${activeTickets.length === 0 ? 'Sem pendências para o próximo turno.' : activeTickets.map((t, idx) => `[${t.numero_chamado}] Prioridade: ${t.prioridade} | Status: ${t.status}
  Área: ${t.area}
  Problema: ${t.problema}
  Próxima Ação: ${t.proxima_acao || 'N/A'}
  Responsável: ${t.responsavel}
  Obs: ${t.observacoes || 'Nenhuma'}`).join('\n\n')}

-----------------------------------------------------
3. CHAMADOS RESOLVIDOS NESTE PLANTÃO (${concludedTickets.length} chamados)
-----------------------------------------------------
${concludedTickets.length === 0 ? 'Nenhum chamado concluído neste plantão.' : concludedTickets.map((t) => `• [${t.numero_chamado}] ${t.area} - ${t.problema} (Concluído por: ${t.concluido_por || t.responsavel})`).join('\n')}

-----------------------------------------------------
4. OBSERVAÇÕES E CONSIDERAÇÕES DO PLANTONISTA
-----------------------------------------------------
${customNotes || 'Nenhuma observação adicional informada.'}

=====================================================
Mensagem gerada pelo Sistema de Passagem de Plantão TI
Hospital Alemão Oswaldo Cruz
=====================================================
    `.trim();
  };

  const handleCopyText = () => {
    const text = generatePlainTextBody();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleOpenMailClient = () => {
    const body = generatePlainTextBody();
    const mailtoUrl = `mailto:${encodeURIComponent(emailRecipients)}?cc=${encodeURIComponent(emailCC)}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    // Record shift handover in database
    handleRecordShiftReport();
  };

  const handleRecordShiftReport = () => {
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
      resumo_geral: customNotes,
      observacoes_passagem: `Disparado por e-mail para ${emailRecipients}`,
      chamados_ids: allTickets.map((t) => t.id),
      enviado_email: true,
      destinatarios_envio: emailRecipients.split(',').map((e) => e.trim()),
    });

    setIsSentSuccess(true);
  };

  const handleDownloadPDF = () => {
    generateShiftPDF(
      allTickets,
      {
        data: new Date().toLocaleDateString('pt-BR'),
        horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        turno: shiftTurno,
        responsavel: responsavelTurno,
        responsavelRecebimento: proximoResponsavel,
        resumo: customNotes,
      },
      settings
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0b1f28] border border-teal-800/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#071922] border-b border-teal-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/15 rounded-xl border border-teal-500/30 text-teal-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Envio do Relatório de Plantão por E-mail
                </h3>
                <span className="bg-teal-950/80 text-teal-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold border border-teal-800/80">
                  DISPARO OFICIAL
                </span>
              </div>
              <p className="text-xs text-teal-300/80">
                Hospital Alemão Oswaldo Cruz • Notificação para coordenação e próximo turno
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subnav Tabs */}
        <div className="px-5 pt-3 bg-[#09222c] border-b border-teal-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'border-teal-400 text-teal-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Pré-visualização do E-mail</span>
            </button>
            <button
              onClick={() => setActiveTab('recipients')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'recipients'
                  ? 'border-teal-400 text-teal-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Destinatários & Mensagem</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-teal-300/70 pb-2 hidden sm:flex">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>Turno Atual: <strong className="text-teal-200">{shiftTurno.split(' ')[0]}</strong></span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {isSentSuccess && (
            <div className="bg-emerald-950/80 border border-emerald-500/60 rounded-xl p-3.5 text-xs text-emerald-200 flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-100">Passagem de Plantão Registrada!</div>
                  <div className="text-[11px] text-emerald-300">
                    O relatório foi salvo no histórico com status de envio por e-mail para {emailRecipients}.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsSentSuccess(false)}
                className="text-emerald-400 hover:text-emerald-200 text-xs underline cursor-pointer"
              >
                Dispensar
              </button>
            </div>
          )}

          {activeTab === 'recipients' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3 sm:col-span-2 bg-[#081d26] p-4 rounded-xl border border-teal-900/60">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 text-teal-300">
                  <UserCheck className="w-4 h-4 text-teal-400" />
                  Identificação do Turno
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Turno</label>
                    <select
                      value={shiftTurno}
                      onChange={(e) => setShiftTurno(e.target.value)}
                      className="w-full bg-[#05161d] border border-teal-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-teal-400"
                    >
                      <option value="Plantão Diurno (07:00 - 19:00)">Diurno (07h - 19h)</option>
                      <option value="Plantão Noturno (19:00 - 07:00)">Noturno (19h - 07h)</option>
                      <option value="Plantão Comercial (08:00 - 18:00)">Comercial (08h - 18h)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Responsável Saída</label>
                    <input
                      type="text"
                      value={responsavelTurno}
                      onChange={(e) => setResponsavelTurno(e.target.value)}
                      className="w-full bg-[#05161d] border border-teal-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Responsável Entrada</label>
                    <input
                      type="text"
                      value={proximoResponsavel}
                      onChange={(e) => setProximoResponsavel(e.target.value)}
                      className="w-full bg-[#05161d] border border-teal-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Destinatários Principais (Para)
                </label>
                <input
                  type="text"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  placeholder="supervisao.ti@hospital.org.br, plantao@hospital.org.br"
                  className="w-full bg-[#05161d] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400"
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
                  className="w-full bg-[#05161d] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Assunto do E-mail
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-[#05161d] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Observações e Considerações Especiais
                </label>
                <textarea
                  rows={4}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Informe qualquer evento extraordinário ou aviso importante para o próximo plantão..."
                  className="w-full bg-[#05161d] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400 resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Shift Stats Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[#081d26] p-3 rounded-xl border border-teal-900/70">
                  <div className="text-[10px] font-bold text-teal-400 uppercase">Chamados Ativos</div>
                  <div className="text-xl font-bold text-white mt-0.5">{activeTickets.length}</div>
                  <div className="text-[10px] text-teal-300/70">Para continuidade</div>
                </div>

                <div className="bg-red-950/30 p-3 rounded-xl border border-red-900/40">
                  <div className="text-[10px] font-bold text-red-400 uppercase">Pendentes</div>
                  <div className="text-xl font-bold text-red-400 mt-0.5">{pendingTickets.length}</div>
                  <div className="text-[10px] text-red-300/70">Atenção imediata</div>
                </div>

                <div className="bg-sky-950/30 p-3 rounded-xl border border-sky-900/40">
                  <div className="text-[10px] font-bold text-sky-400 uppercase">Em Andamento</div>
                  <div className="text-xl font-bold text-sky-400 mt-0.5">{inProgressTickets.length}</div>
                  <div className="text-[10px] text-sky-300/70">Com operador</div>
                </div>

                <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-900/40">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase">Resolvidos</div>
                  <div className="text-xl font-bold text-emerald-400 mt-0.5">{concludedTickets.length}</div>
                  <div className="text-[10px] text-emerald-300/70">Finalizados no turno</div>
                </div>
              </div>

              {/* Email Document Simulator */}
              <div className="bg-[#05151c] border border-teal-900/90 rounded-xl p-4 sm:p-5 font-sans space-y-4 shadow-inner">
                {/* Header Oswaldo Cruz Branding */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-teal-900/60">
                  <OswaldoCruzLogo size="sm" textColor="text-white" subtitleColor="text-teal-400" />
                  <div className="text-left sm:text-right text-[11px] text-slate-400 font-mono">
                    <div>Data: <strong className="text-slate-200">{new Date().toLocaleDateString('pt-BR')}</strong></div>
                    <div>Plantonista: <strong className="text-teal-300">{responsavelTurno}</strong></div>
                  </div>
                </div>

                {/* Email Subject preview line */}
                <div className="bg-[#0b222c] px-3 py-2 rounded-lg border border-teal-800/60 text-xs">
                  <span className="text-teal-400 font-semibold mr-1.5">Assunto:</span>
                  <span className="text-white font-medium">{emailSubject}</span>
                </div>

                {/* Pendências List */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    Pendências para o Próximo Plantão ({activeTickets.length})
                  </div>

                  {activeTickets.length === 0 ? (
                    <div className="text-xs text-emerald-300 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/30">
                      Nenhuma pendência ativa no momento.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {activeTickets.map((t) => (
                        <div
                          key={t.id}
                          className="bg-[#09222c] border border-teal-900/50 rounded-lg p-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-teal-400">{t.numero_chamado}</span>
                              <PriorityBadge priority={t.prioridade} size="sm" />
                              <span className="font-semibold text-slate-200">{t.area}</span>
                            </div>
                            <div className="text-slate-300">{t.problema}</div>
                            {t.proxima_acao && (
                              <div className="text-[11px] text-teal-300">
                                <strong>Ação:</strong> {t.proxima_acao} • <em>Resp: {t.responsavel}</em>
                              </div>
                            )}
                          </div>
                          <StatusBadge status={t.status} size="sm" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes preview */}
                {customNotes && (
                  <div className="pt-2 border-t border-teal-900/50 text-xs text-slate-300">
                    <strong className="text-teal-300 block mb-1">Considerações:</strong>
                    <p className="whitespace-pre-line text-slate-400 bg-[#071b23] p-2.5 rounded-lg border border-teal-900/40">
                      {customNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#071922] border-t border-teal-900/80 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 bg-[#0b2834] hover:bg-[#0f3747] text-teal-300 px-3 py-2 rounded-lg text-xs font-bold border border-teal-700/60 transition cursor-pointer"
              title="Gerar PDF com identidade Oswaldo Cruz"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Baixar</span> PDF Oficial
            </button>

            <button
              onClick={() => exportTicketsToExcel(allTickets, 'Passagem_Plantao_OswaldoCruz')}
              className="flex items-center gap-1.5 bg-[#0b2834] hover:bg-[#0f3747] text-teal-300 px-3 py-2 rounded-lg text-xs font-bold border border-teal-700/60 transition cursor-pointer"
              title="Exportar Planilha Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Exportar</span> Excel
            </button>

            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 bg-[#0b2834] hover:bg-[#0f3747] text-slate-200 px-3 py-2 rounded-lg text-xs font-semibold border border-teal-700/60 transition cursor-pointer"
              title="Copiar texto para colar em e-mails / Teams"
            >
              <Copy className="w-3.5 h-3.5 text-teal-300" />
              <span>{isCopied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRecordShiftReport}
              className="bg-[#0d3342] hover:bg-[#134457] text-teal-200 px-3.5 py-2 rounded-lg text-xs font-semibold border border-teal-600/50 transition cursor-pointer"
            >
              <span>Registrar no Histórico</span>
            </button>

            <button
              onClick={handleOpenMailClient}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 active:from-teal-700 active:to-cyan-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-teal-950/50 border border-teal-400/40 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>DISPARAR E-MAIL (OUTLOOK / CLIENTE)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
