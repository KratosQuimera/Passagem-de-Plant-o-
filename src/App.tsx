/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OperationalTable } from './components/OperationalTable';
import { HandoverView } from './components/HandoverView';
import { HistoryView } from './components/HistoryView';
import { DashboardView } from './components/DashboardView';
import { ReportAndEmailView } from './components/ReportAndEmailView';
import { SettingsView } from './components/SettingsView';
import { NewTicketModal } from './components/NewTicketModal';
import { EditTicketModal } from './components/EditTicketModal';
import { ConcludeTicketModal } from './components/ConcludeTicketModal';
import { TicketTimelineModal } from './components/TicketTimelineModal';
import { SendEmailModal } from './components/SendEmailModal';
import { useAppDatabase } from './hooks/useAppDatabase';
import { Ticket, UserProfile } from './types';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function App() {
  const {
    db,
    currentUser,
    tickets,
    activeTickets,
    archivedTickets,
    history,
    users,
    areas,
    allAreas,
    responsibles,
    allResponsibles,
    statuses,
    allStatuses,
    priorities,
    allPriorities,
    shifts,
    settings,
    createTicket,
    updateTicket,
    concludeTicket,
    reopenTicket,
    getHistoryForTicket,
    addArea,
    updateArea,
    toggleAreaActive,
    addResponsible,
    updateResponsible,
    toggleResponsibleActive,
    updateSettings,
    saveShiftReport,
    setCurrentUser,
    resetToDefaults,
  } = useAppDatabase();

  const [currentTab, setCurrentTab] = useState<'painel' | 'passagem' | 'historico' | 'dashboard' | 'relatorios' | 'configuracoes'>('painel');
  
  // Modal states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConcludeModalOpen, setIsConcludeModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Keyboard shortcut: 'Ctrl+K' to open new ticket modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsNewModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers for Ticket Actions
  const handleOpenEdit = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsEditModalOpen(true);
  };

  const handleOpenConclude = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsConcludeModalOpen(true);
  };

  const handleOpenTimeline = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsTimelineModalOpen(true);
  };

  const handleCreateTicketSubmit = (data: {
    numero_chamado: string;
    prioridade: string;
    area: string;
    problema: string;
    status: string;
    proxima_acao: string;
    responsavel: string;
    observacoes: string;
  }) => {
    const created = createTicket(data);
    showToast(`Chamado ${created.numero_chamado} registrado no painel operacional com sucesso!`, 'success');
  };

  const handleUpdateTicket = (id: string, updates: Partial<Ticket>) => {
    const updated = updateTicket(id, updates);
    showToast(`Chamado ${updated.numero_chamado} atualizado com sucesso.`, 'info');
  };

  const handleConfirmConclusion = (ticketId: string, notes?: string) => {
    const concluded = concludeTicket(ticketId, notes);
    showToast(
      `Chamado ${concluded.numero_chamado} concluído! Movido com segurança para o Histórico e Relatório.`,
      'success'
    );
  };

  const handleReopenTicket = (ticket: Ticket) => {
    const reopened = reopenTicket(ticket.id, 'Em andamento');
    showToast(
      `Chamado ${reopened.numero_chamado} reaberto e retornado ao Painel Operacional ativo!`,
      'success'
    );
  };

  return (
    <div className="min-h-screen bg-[#07171e] text-slate-200 flex flex-col font-sans selection:bg-[#00a2b4] selection:text-white">
      {/* Top Navbar & Sidebar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeCount={activeTickets.length}
        archivedCount={archivedTickets.length}
        onOpenNewTicket={() => setIsNewModalOpen(true)}
        onOpenSendEmail={() => setIsSendEmailModalOpen(true)}
        currentUser={currentUser}
        users={users}
        onSwitchUser={(u: UserProfile) => {
          setCurrentUser(u);
          showToast(`Operador alterado para ${u.nome} (${u.cargo})`, 'info');
        }}
        settings={settings}
      />

      {/* Main Content Area (With left margin compensation on desktop for the w-64 fixed sidebar) */}
      <div className="flex-1 flex flex-col lg:pl-64">
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-6">
          {/* Toast Alert Banner */}
          {toastMessage && (
            <div className="fixed bottom-14 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
              <div className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs sm:text-sm font-semibold ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/60 ring-1 ring-emerald-500/30'
                  : toastMessage.type === 'warning'
                  ? 'bg-amber-950/95 text-amber-200 border-amber-500/60 ring-1 ring-amber-500/30'
                  : 'bg-[#0a2733]/95 text-teal-200 border-teal-500/60 ring-1 ring-teal-500/30'
              }`}>
                {toastMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-teal-400 shrink-0" />
                )}
                <span>{toastMessage.text}</span>
              </div>
            </div>
          )}

          {/* Tab 1: Painel Operacional (Spreadsheet style + cards) */}
          {currentTab === 'painel' && (
            <OperationalTable
              tickets={activeTickets}
              areas={areas}
              responsibles={responsibles}
              statuses={statuses}
              priorities={priorities}
              onUpdateTicket={handleUpdateTicket}
              onConcludeTicket={handleOpenConclude}
              onEditTicket={handleOpenEdit}
              onViewHistory={handleOpenTimeline}
              onOpenNewModal={() => setIsNewModalOpen(true)}
              onOpenSendEmail={() => setIsSendEmailModalOpen(true)}
            />
          )}

          {/* Tab 2: Passagem de Plantão (Organized in 5 key categories) */}
          {currentTab === 'passagem' && (
            <HandoverView
              tickets={tickets}
              currentUser={currentUser}
              users={users}
              settings={settings}
              onConcludeTicket={handleOpenConclude}
              onEditTicket={handleOpenEdit}
              onViewHistory={handleOpenTimeline}
              onSaveShiftReport={saveShiftReport}
              onNavigateToEmail={() => setCurrentTab('relatorios')}
            />
          )}

          {/* Tab 3: Histórico Completo (Soft-deleted / archived tickets) */}
          {currentTab === 'historico' && (
            <HistoryView
              archivedTickets={archivedTickets}
              allTickets={tickets}
              areas={areas}
              responsibles={responsibles}
              statuses={statuses}
              onViewTimeline={handleOpenTimeline}
              onReopenTicket={handleReopenTicket}
            />
          )}

          {/* Tab 4: Dashboard & Indicadores */}
          {currentTab === 'dashboard' && (
            <DashboardView
              allTickets={tickets}
              areas={areas}
              responsibles={responsibles}
              onNavigateToTab={setCurrentTab}
            />
          )}

          {/* Tab 5: Relatórios & E-mail */}
          {currentTab === 'relatorios' && (
            <ReportAndEmailView
              allTickets={tickets}
              currentUser={currentUser}
              settings={settings}
              onSaveShiftReport={saveShiftReport}
              onUpdateSettings={updateSettings}
            />
          )}

          {/* Tab 6: Configurações & Cadastros */}
          {currentTab === 'configuracoes' && (
            <SettingsView
              areas={allAreas}
              responsibles={allResponsibles}
              statuses={allStatuses}
              settings={settings}
              users={users}
              currentUser={currentUser}
              onAddArea={addArea}
              onUpdateArea={updateArea}
              onToggleArea={toggleAreaActive}
              onAddResponsible={addResponsible}
              onUpdateResponsible={updateResponsible}
              onToggleResponsible={toggleResponsibleActive}
              onUpdateSettings={updateSettings}
              onResetData={() => {
                resetToDefaults();
                showToast('Dados de demonstração restaurados com sucesso!', 'info');
              }}
            />
          )}
        </main>

        {/* Hospital Alemão Oswaldo Cruz Professional Status Bar */}
        <footer className="h-11 border-t border-teal-950 bg-[#071922] flex items-center justify-between px-6 text-[11px] text-teal-400/80 uppercase tracking-wider select-none mt-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">Hospital Alemão Oswaldo Cruz • Passagem de Plantão TI</span>
          </div>
          <div className="hidden sm:block text-teal-300 font-medium">
            Segurança Operacional TI • Sem perda de histórico
          </div>
        </footer>
      </div>

      {/* Global Modals */}
      <NewTicketModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateTicketSubmit}
        areas={areas}
        responsibles={responsibles}
        statuses={statuses}
        priorities={priorities}
        onQuickAddArea={(nome: string) => addArea(nome)}
      />

      <EditTicketModal
        isOpen={isEditModalOpen}
        ticket={selectedTicket}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateTicket}
        onConcludeFromEdit={handleOpenConclude}
        areas={areas}
        responsibles={responsibles}
        statuses={statuses}
        priorities={priorities}
        onViewHistory={handleOpenTimeline}
      />

      <ConcludeTicketModal
        isOpen={isConcludeModalOpen}
        ticket={selectedTicket}
        currentUser={currentUser}
        onClose={() => setIsConcludeModalOpen(false)}
        onConfirm={handleConfirmConclusion}
      />

      <TicketTimelineModal
        isOpen={isTimelineModalOpen}
        ticket={selectedTicket}
        historyItems={selectedTicket ? getHistoryForTicket(selectedTicket.id) : []}
        onClose={() => setIsTimelineModalOpen(false)}
        onReopen={handleReopenTicket}
      />

      <SendEmailModal
        isOpen={isSendEmailModalOpen}
        onClose={() => setIsSendEmailModalOpen(false)}
        allTickets={tickets}
        currentUser={currentUser}
        users={users}
        settings={settings}
        onSaveShiftReport={saveShiftReport}
      />
    </div>
  );
}
