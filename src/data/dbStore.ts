import { AppDatabase, AppSettings, AreaItem, PriorityItem, ResponsibleItem, StatusItem, Ticket, TicketHistoryItem, UserProfile, ShiftReport } from '../types';
import { getInitialDatabase } from './initialData';

const DB_KEY = 'painel_plantao_ti_db_v1';
const CURRENT_USER_KEY = 'painel_plantao_ti_current_user_v1';

class DatabaseStore {
  private db: AppDatabase;
  private listeners: Set<() => void> = new Set();
  private currentUser: UserProfile;

  constructor() {
    this.db = this.loadFromStorage();
    this.currentUser = this.loadCurrentUser();
  }

  private loadFromStorage(): AppDatabase {
    try {
      const stored = localStorage.getItem(DB_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with initial defaults if missing fields
        const initial = getInitialDatabase();
        return {
          tickets: parsed.tickets || initial.tickets,
          history: parsed.history || initial.history,
          users: parsed.users || initial.users,
          areas: parsed.areas || initial.areas,
          responsibles: parsed.responsibles || initial.responsibles,
          statuses: parsed.statuses || initial.statuses,
          priorities: parsed.priorities || initial.priorities,
          shifts: parsed.shifts || initial.shifts,
          settings: { ...initial.settings, ...(parsed.settings || {}) },
        };
      }
    } catch (e) {
      console.error('Error loading database from localStorage:', e);
    }
    const initial = getInitialDatabase();
    this.saveToStorage(initial);
    return initial;
  }

  private loadCurrentUser(): UserProfile {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading user from localStorage:', e);
    }
    // Default to Wagner Marcelino (Admin)
    return this.db.users[0] || {
      id: 'usr-1',
      nome: 'Wagner Marcelino',
      email: 'wagner.marcelino@hospital.org.br',
      cargo: 'Analista de Suporte Sênior',
      role: 'admin',
      ativo: true,
    };
  }

  private saveToStorage(database: AppDatabase) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(database));
    } catch (e) {
      console.error('Error saving database to localStorage:', e);
    }
  }

  private notify() {
    this.saveToStorage(this.db);
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getDatabase(): AppDatabase {
    return this.db;
  }

  public getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  public setCurrentUser(user: UserProfile) {
    this.currentUser = user;
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving current user:', e);
    }
    this.notify();
  }

  // --- TICKET OPERATIONS ---

  public getTickets(includeArchived: boolean = false): Ticket[] {
    if (includeArchived) {
      return [...this.db.tickets].sort(
        (a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
      );
    }
    return this.db.tickets
      .filter((t) => !t.arquivado)
      .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
  }

  public getArchivedTickets(): Ticket[] {
    return this.db.tickets
      .filter((t) => t.arquivado)
      .sort((a, b) => {
        const timeA = a.concluido_em ? new Date(a.concluido_em).getTime() : new Date(a.atualizado_em).getTime();
        const timeB = b.concluido_em ? new Date(b.concluido_em).getTime() : new Date(b.atualizado_em).getTime();
        return timeB - timeA;
      });
  }

  public getTicketById(id: string): Ticket | undefined {
    return this.db.tickets.find((t) => t.id === id);
  }

  public createTicket(data: Omit<Ticket, 'id' | 'criado_em' | 'atualizado_em' | 'concluido_em' | 'criado_por' | 'atualizado_por' | 'concluido_por' | 'arquivado'>): Ticket {
    const now = new Date().toISOString();
    const newId = 'ticket-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    const newTicket: Ticket = {
      ...data,
      id: newId,
      criado_em: now,
      atualizado_em: now,
      concluido_em: null,
      criado_por: this.currentUser.nome,
      atualizado_por: this.currentUser.nome,
      concluido_por: null,
      arquivado: false,
    };

    this.db.tickets.unshift(newTicket);

    // Audit log
    const historyItem: TicketHistoryItem = {
      id: 'hist-' + Date.now(),
      ticket_id: newId,
      numero_chamado: newTicket.numero_chamado,
      usuario: this.currentUser.nome,
      acao: 'CRIADO',
      descricao: `Chamado ${newTicket.numero_chamado} criado para a área "${newTicket.area}" com prioridade ${newTicket.prioridade}. Problema: ${newTicket.problema}.`,
      data_hora: now,
    };
    this.db.history.unshift(historyItem);

    this.notify();
    return newTicket;
  }

  public updateTicket(id: string, updates: Partial<Omit<Ticket, 'id' | 'criado_em' | 'criado_por'>>): Ticket {
    const index = this.db.tickets.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Chamado não encontrado.');

    const oldTicket = { ...this.db.tickets[index] };
    const now = new Date().toISOString();

    const updatedTicket: Ticket = {
      ...oldTicket,
      ...updates,
      atualizado_em: now,
      atualizado_por: this.currentUser.nome,
    };

    this.db.tickets[index] = updatedTicket;

    // Detect what changed and log to history
    const fieldsToTrack: (keyof Ticket)[] = [
      'prioridade',
      'area',
      'problema',
      'status',
      'proxima_acao',
      'responsavel',
      'observacoes',
    ];

    fieldsToTrack.forEach((field) => {
      if (updates[field] !== undefined && updates[field] !== oldTicket[field]) {
        let acao: TicketHistoryItem['acao'] = 'ALTERADO';
        if (field === 'status') acao = 'STATUS_ALTERADO';
        if (field === 'responsavel') acao = 'RESPONSAVEL_ALTERADO';

        const historyItem: TicketHistoryItem = {
          id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
          ticket_id: id,
          numero_chamado: updatedTicket.numero_chamado,
          usuario: this.currentUser.nome,
          acao,
          campo_alterado: field,
          valor_anterior: String(oldTicket[field] ?? ''),
          valor_novo: String(updates[field] ?? ''),
          descricao: `Alterou ${field} de "${oldTicket[field]}" para "${updates[field]}"`,
          data_hora: now,
        };
        this.db.history.unshift(historyItem);
      }
    });

    this.notify();
    return updatedTicket;
  }

  /**
   * SOFT DELETE / CONCLUIR CHAMADO / ARQUIVAR
   * Never physically deletes ticket. Updates status, marks arquivado=true,
   * stamps conclusion user & date, and writes to audit history.
   */
  public concludeTicket(id: string, conclusionNotes?: string): Ticket {
    const index = this.db.tickets.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Chamado não encontrado.');

    const oldTicket = { ...this.db.tickets[index] };
    const now = new Date().toISOString();

    let newNotes = oldTicket.observacoes;
    if (conclusionNotes && conclusionNotes.trim()) {
      newNotes = newNotes ? `${newNotes}\n[Conclusão por ${this.currentUser.nome} em ${new Date().toLocaleTimeString()}]: ${conclusionNotes}` : conclusionNotes;
    }

    const updatedTicket: Ticket = {
      ...oldTicket,
      status: 'Resolvido',
      observacoes: newNotes,
      concluido_em: now,
      concluido_por: this.currentUser.nome,
      atualizado_em: now,
      atualizado_por: this.currentUser.nome,
      arquivado: true,
    };

    this.db.tickets[index] = updatedTicket;

    const historyItem: TicketHistoryItem = {
      id: 'hist-' + Date.now(),
      ticket_id: id,
      numero_chamado: updatedTicket.numero_chamado,
      usuario: this.currentUser.nome,
      acao: 'CONCLUIDO',
      campo_alterado: 'Status / Arquivado',
      valor_anterior: oldTicket.status,
      valor_novo: 'Resolvido (Arquivado)',
      descricao: `Chamado concluído e arquivado por ${this.currentUser.nome}. ${conclusionNotes ? `Obs: ${conclusionNotes}` : ''}`,
      data_hora: now,
    };
    this.db.history.unshift(historyItem);

    this.notify();
    return updatedTicket;
  }

  public reopenTicket(id: string, newStatus: string = 'Em andamento'): Ticket {
    const index = this.db.tickets.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Chamado não encontrado.');

    const oldTicket = { ...this.db.tickets[index] };
    const now = new Date().toISOString();

    const updatedTicket: Ticket = {
      ...oldTicket,
      status: newStatus,
      concluido_em: null,
      concluido_por: null,
      atualizado_em: now,
      atualizado_por: this.currentUser.nome,
      arquivado: false,
    };

    this.db.tickets[index] = updatedTicket;

    const historyItem: TicketHistoryItem = {
      id: 'hist-' + Date.now(),
      ticket_id: id,
      numero_chamado: updatedTicket.numero_chamado,
      usuario: this.currentUser.nome,
      acao: 'REABERTO',
      campo_alterado: 'Status',
      valor_anterior: 'Concluído/Arquivado',
      valor_novo: newStatus,
      descricao: `Chamado reaberto no painel ativo por ${this.currentUser.nome} com status "${newStatus}".`,
      data_hora: now,
    };
    this.db.history.unshift(historyItem);

    this.notify();
    return updatedTicket;
  }

  public getHistoryForTicket(ticketId: string): TicketHistoryItem[] {
    return this.db.history
      .filter((h) => h.ticket_id === ticketId)
      .sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime());
  }

  public getAllHistory(): TicketHistoryItem[] {
    return [...this.db.history].sort(
      (a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()
    );
  }

  // --- CATALOG MANAGEMENT (AREAS, RESPONSÁVEIS, STATUS, PRIORIDADES) ---

  public addArea(nome: string, descricao?: string): AreaItem {
    const newArea: AreaItem = {
      id: 'area-' + Date.now(),
      nome: nome.trim(),
      descricao: descricao?.trim(),
      ativo: true,
    };
    this.db.areas.push(newArea);
    this.notify();
    return newArea;
  }

  public updateArea(id: string, updates: Partial<AreaItem>) {
    const index = this.db.areas.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.db.areas[index] = { ...this.db.areas[index], ...updates };
      this.notify();
    }
  }

  public toggleAreaActive(id: string) {
    const index = this.db.areas.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.db.areas[index].ativo = !this.db.areas[index].ativo;
      this.notify();
    }
  }

  public addResponsible(nome: string, cargo?: string, email?: string): ResponsibleItem {
    const newResp: ResponsibleItem = {
      id: 'resp-' + Date.now(),
      nome: nome.trim(),
      cargo: cargo?.trim() || 'Técnico de Plantão',
      email: email?.trim(),
      ativo: true,
    };
    this.db.responsibles.push(newResp);
    this.notify();
    return newResp;
  }

  public updateResponsible(id: string, updates: Partial<ResponsibleItem>) {
    const index = this.db.responsibles.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.db.responsibles[index] = { ...this.db.responsibles[index], ...updates };
      this.notify();
    }
  }

  public toggleResponsibleActive(id: string) {
    const index = this.db.responsibles.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.db.responsibles[index].ativo = !this.db.responsibles[index].ativo;
      this.notify();
    }
  }

  public addStatus(nome: string, cor: string = '#6b7280', bgCor: string = '#f3f4f6'): StatusItem {
    const newStatus: StatusItem = {
      id: 'st-' + Date.now(),
      nome: nome.trim(),
      cor,
      bgCor,
      ativo: true,
    };
    this.db.statuses.push(newStatus);
    this.notify();
    return newStatus;
  }

  public updateSettings(settings: Partial<AppSettings>) {
    this.db.settings = { ...this.db.settings, ...settings };
    this.notify();
  }

  // --- SHIFT HANDOVER REPORTS ---

  public saveShiftReport(report: Omit<ShiftReport, 'id' | 'criado_em'>): ShiftReport {
    const newReport: ShiftReport = {
      ...report,
      id: 'shift-' + Date.now(),
      criado_em: new Date().toISOString(),
    };
    this.db.shifts.unshift(newReport);
    this.notify();
    return newReport;
  }

  public getShiftReports(): ShiftReport[] {
    return [...this.db.shifts].sort(
      (a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
    );
  }

  // --- USER MANAGEMENT ---
  public addUser(user: Omit<UserProfile, 'id'>): UserProfile {
    const newUser: UserProfile = {
      ...user,
      id: 'usr-' + Date.now(),
    };
    this.db.users.push(newUser);
    this.notify();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<UserProfile>) {
    const index = this.db.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.db.users[index] = { ...this.db.users[index], ...updates };
      if (this.currentUser.id === id) {
        this.currentUser = this.db.users[index];
      }
      this.notify();
    }
  }

  public resetToDefaults() {
    this.db = getInitialDatabase();
    this.currentUser = this.db.users[0];
    this.notify();
  }
}

export const dbStore = new DatabaseStore();
