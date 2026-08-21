export type ShiftOption = 
  | 'Diurno 07:00 16:48'
  | 'Diurno 06:00 15:48'
  | 'Diurno 09:00 18:48'
  | 'Diurno 10:00 20:48'
  | 'Comercial 08:00 17:48'
  | 'Noturno 19:12 05:00'
  | 'Noturno 20:12 06:00';

export const SHIFT_OPTIONS: ShiftOption[] = [
  'Diurno 07:00 16:48',
  'Diurno 06:00 15:48',
  'Diurno 09:00 18:48',
  'Diurno 10:00 20:48',
  'Comercial 08:00 17:48',
  'Noturno 19:12 05:00',
  'Noturno 20:12 06:00',
];

export type UserRole = 'admin' | 'coordenador' | 'operador' | 'visualizador';

export interface UserPermissions {
  pode_criar_chamado: boolean;
  pode_editar_chamado: boolean;
  pode_concluir_chamado: boolean;
  pode_reabrir_chamado: boolean;
  pode_gerenciar_usuarios: boolean;
  pode_gerenciar_areas: boolean;
  pode_disparar_email: boolean;
  pode_configurar_sistema: boolean;
}

export interface UserProfile {
  id: string;
  nome: string;
  usuario: string;
  senha: string;
  email: string;
  cargo: string;
  role: UserRole;
  permissoes?: UserPermissions;
  ativo: boolean;
}

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
  turno: ShiftOption | string;
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

