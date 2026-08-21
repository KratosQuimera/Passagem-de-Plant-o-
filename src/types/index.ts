export interface Ticket {
  id: string;
  numero_chamado: string;
  prioridade: 'P1' | 'P2' | 'P3' | 'P4' | string;
  area: string;
  problema: string;
  status: 'Pendente' | 'Em andamento' | 'Aguardando' | 'Resolvido' | 'Cancelado' | string;
  proxima_acao: string;
  responsavel: string;
  observacoes: string;
  criado_em: string;
  atualizado_em: string;
  concluido_em: string | null;
  criado_por: string;
  atualizado_por: string;
  concluido_por: string | null;
  arquivado: boolean; // Soft delete flag
}

export interface TicketHistoryItem {
  id: string;
  ticket_id: string;
  numero_chamado: string;
  usuario: string;
  acao: 'CRIADO' | 'ALTERADO' | 'CONCLUIDO' | 'REABERTO' | 'ARQUIVADO' | 'STATUS_ALTERADO' | 'RESPONSAVEL_ALTERADO';
  campo_alterado?: string;
  valor_anterior?: string;
  valor_novo?: string;
  descricao: string;
  data_hora: string;
}

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  role: 'admin' | 'operador';
  ativo: boolean;
}

export interface AreaItem {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface ResponsibleItem {
  id: string;
  nome: string;
  email?: string;
  cargo?: string;
  ativo: boolean;
}

export interface StatusItem {
  id: string;
  nome: string;
  cor: string;
  bgCor: string;
  ativo: boolean;
}

export interface PriorityItem {
  id: string;
  nome: string;
  nivel: number;
  cor: string;
  bgCor: string;
  ativo: boolean;
}

export interface ShiftReport {
  id: string;
  data: string;
  horario_plantao: string;
  turno: 'Manhã (07:00 - 19:00)' | 'Noite (19:00 - 07:00)' | 'Comercial (08:00 - 18:00)' | 'Plantão 24h' | string;
  responsavel_plantao: string;
  responsavel_passagem?: string;
  responsavel_recebimento?: string;
  total_chamados: number;
  chamados_resolvidos: number;
  chamados_pendentes: number;
  chamados_aguardando: number;
  chamados_em_andamento: number;
  resumo_geral: string;
  observacoes_passagem: string;
  chamados_ids: string[];
  criado_em: string;
  enviado_email: boolean;
  destinatarios_envio?: string[];
}

export interface AppSettings {
  sistema_nome: string;
  unidade_hospitalar: string;
  email_remetente: string;
  destinatarios_padrao: string[];
  destinatarios_cc: string[];
  assunto_padrao: string;
  corpo_padrao: string;
  envio_automatico_ativo: boolean;
  horario_envio_automatico: string;
  dias_envio: string[];
  enviar_somente_com_chamados: boolean;
  anexar_pdf: boolean;
  anexar_excel: boolean;
  tema_padrao: 'dark' | 'light';
}

export interface AppDatabase {
  tickets: Ticket[];
  history: TicketHistoryItem[];
  users: UserProfile[];
  areas: AreaItem[];
  responsibles: ResponsibleItem[];
  statuses: StatusItem[];
  priorities: PriorityItem[];
  shifts: ShiftReport[];
  settings: AppSettings;
}
