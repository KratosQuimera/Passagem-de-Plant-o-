import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  Building2, 
  Clock, 
  Mail, 
  Plus, 
  Check, 
  X, 
  Trash2, 
  Edit2, 
  Shield, 
  RefreshCw,
  Save,
  BellRing,
  UserPlus,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  CheckSquare,
  Square,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  AreaItem, 
  ResponsibleItem, 
  StatusItem, 
  AppSettings, 
  UserProfile, 
  UserRole, 
  UserPermissions 
} from '../types';
import { getDefaultPermissions } from '../data/initialData';

interface SettingsViewProps {
  areas: AreaItem[];
  responsibles: ResponsibleItem[];
  statuses: StatusItem[];
  settings: AppSettings;
  users: UserProfile[];
  currentUser: UserProfile;
  onAddArea: (nome: string, descricao?: string) => void;
  onUpdateArea: (id: string, updates: Partial<AreaItem>) => void;
  onDeleteArea?: (id: string) => void;
  onToggleArea: (id: string) => void;
  onAddResponsible: (nome: string, cargo?: string, email?: string) => void;
  onUpdateResponsible: (id: string, updates: Partial<ResponsibleItem>) => void;
  onDeleteResponsible?: (id: string) => void;
  onToggleResponsible: (id: string) => void;
  onAddUser?: (user: Omit<UserProfile, 'id'>) => void;
  onUpdateUser?: (id: string, updates: Partial<UserProfile>) => void;
  onDeleteUser?: (id: string) => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  areas,
  responsibles,
  statuses,
  settings,
  users,
  currentUser,
  onAddArea,
  onUpdateArea,
  onDeleteArea,
  onToggleArea,
  onAddResponsible,
  onUpdateResponsible,
  onDeleteResponsible,
  onToggleResponsible,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onUpdateSettings,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'usuarios' | 'areas' | 'responsaveis' | 'envio_auto' | 'geral'>('usuarios');
  
  // User Management State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [inlineEditingCargoUserId, setInlineEditingCargoUserId] = useState<string | null>(null);
  const [inlineCargoValue, setInlineCargoValue] = useState<string>('');
  const [userFormData, setUserFormData] = useState<{
    nome: string;
    usuario: string;
    senha: string;
    email: string;
    cargo: string;
    role: UserRole;
    ativo: boolean;
    permissoes: UserPermissions;
  }>({
    nome: '',
    usuario: '',
    senha: '',
    email: '',
    cargo: '',
    role: 'operador',
    ativo: true,
    permissoes: getDefaultPermissions('operador'),
  });
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // Area Management State
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaItem | null>(null);
  const [areaFormData, setAreaFormData] = useState({
    nome: '',
    descricao: '',
    ativo: true,
  });
  const [areaToDelete, setAreaToDelete] = useState<AreaItem | null>(null);

  // Responsibles local state
  const [newRespNome, setNewRespNome] = useState('');
  const [newRespCargo, setNewRespCargo] = useState('');
  const [newRespEmail, setNewRespEmail] = useState('');
  const [editingResp, setEditingResp] = useState<ResponsibleItem | null>(null);
  const [respToDelete, setRespToDelete] = useState<ResponsibleItem | null>(null);

  // Settings form state
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // --- USER HANDLERS ---
  const handleOpenAddUser = () => {
    if (!isAdmin) return;
    setEditingUser(null);
    setUserFormData({
      nome: '',
      usuario: '',
      senha: '16763',
      email: '',
      cargo: '',
      role: 'operador',
      ativo: true,
      permissoes: getDefaultPermissions('operador'),
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: UserProfile) => {
    if (!isAdmin) return;
    setEditingUser(user);
    setUserFormData({
      nome: user.nome,
      usuario: user.usuario || user.nome.split(' ')[0],
      senha: user.senha || '16763',
      email: user.email,
      cargo: user.cargo || '',
      role: user.role,
      ativo: user.ativo,
      permissoes: user.permissoes || getDefaultPermissions(user.role),
    });
    setIsUserModalOpen(true);
  };

  const handleStartInlineCargoEdit = (user: UserProfile) => {
    if (!isAdmin) return;
    setInlineEditingCargoUserId(user.id);
    setInlineCargoValue(user.cargo || '');
  };

  const handleSaveInlineCargo = (userId: string) => {
    if (!isAdmin || !onUpdateUser) return;
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    const newCargo = inlineCargoValue.trim() || 'Técnico de Suporte TI';
    onUpdateUser(userId, { cargo: newCargo });
    setInlineEditingCargoUserId(null);
  };

  const handleCancelInlineCargo = () => {
    setInlineEditingCargoUserId(null);
    setInlineCargoValue('');
  };

  const handleRoleChange = (role: UserRole) => {
    setUserFormData((prev) => ({
      ...prev,
      role,
      permissoes: getDefaultPermissions(role),
    }));
  };

  const handlePermissionToggle = (key: keyof UserPermissions) => {
    setUserFormData((prev) => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [key]: !prev.permissoes[key],
      },
    }));
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!userFormData.nome.trim()) return;

    const fallbackUsername = userFormData.usuario.trim() || userFormData.nome.trim().split(' ')[0];
    const fallbackPassword = userFormData.senha.trim() || '16763';
    const cleanCargo = userFormData.cargo.trim() || 'Técnico de Suporte TI';

    if (editingUser && onUpdateUser) {
      onUpdateUser(editingUser.id, {
        nome: userFormData.nome.trim(),
        usuario: fallbackUsername,
        senha: fallbackPassword,
        email: userFormData.email.trim(),
        cargo: cleanCargo,
        role: userFormData.role,
        ativo: userFormData.ativo,
        permissoes: userFormData.permissoes,
      });
    } else if (onAddUser) {
      onAddUser({
        nome: userFormData.nome.trim(),
        usuario: fallbackUsername,
        senha: fallbackPassword,
        email: userFormData.email.trim(),
        cargo: cleanCargo,
        role: userFormData.role,
        ativo: userFormData.ativo,
        permissoes: userFormData.permissoes,
      });
    }
    setIsUserModalOpen(false);
  };

  const handleConfirmDeleteUser = () => {
    if (!isAdmin) return;
    if (userToDelete && onDeleteUser) {
      onDeleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  // --- AREA HANDLERS ---
  const handleOpenAddArea = () => {
    if (!isAdmin) return;
    setEditingArea(null);
    setAreaFormData({ nome: '', descricao: '', ativo: true });
    setIsAreaModalOpen(true);
  };

  const handleOpenEditArea = (area: AreaItem) => {
    if (!isAdmin) return;
    setEditingArea(area);
    setAreaFormData({
      nome: area.nome,
      descricao: area.descricao || '',
      ativo: area.ativo,
    });
    setIsAreaModalOpen(true);
  };

  const handleSaveArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!areaFormData.nome.trim()) return;

    if (editingArea) {
      onUpdateArea(editingArea.id, {
        nome: areaFormData.nome.trim(),
        descricao: areaFormData.descricao.trim(),
        ativo: areaFormData.ativo,
      });
    } else {
      onAddArea(areaFormData.nome.trim(), areaFormData.descricao.trim());
    }
    setIsAreaModalOpen(false);
  };

  const handleConfirmDeleteArea = () => {
    if (!isAdmin) return;
    if (areaToDelete && onDeleteArea) {
      onDeleteArea(areaToDelete.id);
      setAreaToDelete(null);
    }
  };

  // --- SETTINGS FORM ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    onUpdateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  const toggleDay = (day: string) => {
    const current = formData.dias_envio || [];
    if (current.includes(day)) {
      setFormData({ ...formData, dias_envio: current.filter((d) => d !== day) });
    } else {
      setFormData({ ...formData, dias_envio: [...current, day] });
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="bg-[#0a1e27] border border-teal-800/80 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Gerenciamento & Controle Administrativo
            </h2>
            <p className="text-xs text-teal-300/80">
              Hospital Alemão Oswaldo Cruz • Gestão de usuários, permissões, setores hospitalares e envio automatizado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            isAdmin 
              ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
              : 'bg-teal-950/80 text-teal-300 border border-teal-700/60'
          }`}>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Perfil: {currentUser.nome} ({currentUser.role.toUpperCase()})</span>
          </span>
        </div>
      </div>

      {/* Non-Admin Restriction Warning Banner */}
      {!isAdmin && (
        <div className="bg-amber-950/30 border border-amber-800/60 rounded-2xl p-4 flex items-start gap-3 text-amber-200 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-300">
              Modo Somente Leitura — Acesso Restrito a Administradores
            </div>
            <p className="text-amber-200/80 leading-relaxed">
              Você está autenticado como <strong>{currentUser.nome}</strong> ({currentUser.cargo || currentUser.role}). 
              Apenas usuários com perfil de <strong>Administrador</strong> têm permissão para cadastrar, editar ou excluir colaboradores, setores e configurações globais. 
              Suas permissões operacionais de atendimento a chamados permanecem ativas nos painéis de plantão.
            </p>
          </div>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-teal-900/60 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'usuarios'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-[#09222c] text-teal-300/80 hover:text-white hover:bg-[#0c2e3b]'
          }`}
        >
          <Users className="w-4 h-4 text-teal-300" />
          <span>Gerenciar Usuários & Permissões ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('areas')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'areas'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-[#09222c] text-teal-300/80 hover:text-white hover:bg-[#0c2e3b]'
          }`}
        >
          <Building2 className="w-4 h-4 text-teal-300" />
          <span>Gerenciar Áreas & Setores ({areas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('responsaveis')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'responsaveis'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-[#09222c] text-teal-300/80 hover:text-white hover:bg-[#0c2e3b]'
          }`}
        >
          <Users className="w-4 h-4 text-teal-300" />
          <span>Equipe & Plantonistas ({responsibles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('envio_auto')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'envio_auto'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-[#09222c] text-teal-300/80 hover:text-white hover:bg-[#0c2e3b]'
          }`}
        >
          <BellRing className="w-4 h-4 text-teal-300" />
          <span>Envio Automático</span>
        </button>

        <button
          onClick={() => setActiveTab('geral')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'geral'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-[#09222c] text-teal-300/80 hover:text-white hover:bg-[#0c2e3b]'
          }`}
        >
          <Settings className="w-4 h-4 text-teal-300" />
          <span>Geral & Dados</span>
        </button>
      </div>

      {/* 1. USUÁRIOS & PERMISSÕES MANAGEMENT */}
      {activeTab === 'usuarios' && (
        <div className="bg-[#0a1e27] border border-teal-800/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-teal-900/60 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-400" />
                <span>Usuários, Níveis de Acesso e Permissões</span>
              </h3>
              <p className="text-xs text-teal-300/80 mt-0.5">
                Controle quem pode abrir chamados, concluir, gerenciar setores e disparar relatórios
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAddUser}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer border border-teal-400/30"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ NOVO USUÁRIO</span>
              </button>
            )}
          </div>

          {/* Users List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user) => {
              const perms = user.permissoes || getDefaultPermissions(user.role);
              const isCurrentUser = user.id === currentUser.id;

              return (
                <div
                  key={user.id}
                  className={`bg-[#06151c] border rounded-2xl p-5 space-y-4 transition ${
                    user.ativo 
                      ? isCurrentUser ? 'border-teal-400/60 ring-1 ring-teal-500/20' : 'border-teal-900/80' 
                      : 'border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow shrink-0 mt-0.5 ${
                        user.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : user.role === 'coordenador'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      }`}>
                        {user.nome.substring(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white text-sm flex items-center gap-1.5 flex-wrap">
                          <span className="truncate">{user.nome}</span>
                          {isCurrentUser && (
                            <span className="text-[10px] bg-teal-950 text-teal-300 px-2 py-0.5 rounded-full border border-teal-800 font-bold shrink-0">
                              Você
                            </span>
                          )}
                        </div>
                        {/* Cargo / Função editável */}
                        {inlineEditingCargoUserId === user.id ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSaveInlineCargo(user.id);
                            }}
                            className="flex items-center gap-1.5 mt-1"
                          >
                            <input
                              type="text"
                              autoFocus
                              value={inlineCargoValue}
                              onChange={(e) => setInlineCargoValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') handleCancelInlineCargo();
                              }}
                              placeholder="Ex: Analista de risco Sênior"
                              className="bg-[#041117] border border-teal-400 text-teal-200 text-xs px-2.5 py-1 rounded-lg outline-none focus:ring-1 focus:ring-teal-300 w-full max-w-[240px] font-medium shadow-inner"
                            />
                            <button
                              type="submit"
                              className="p-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg cursor-pointer shadow transition"
                              title="Salvar Cargo (Enter)"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelInlineCargo}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer transition"
                              title="Cancelar (Esc)"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        ) : (
                          <div className="flex items-center gap-1.5 mt-0.5 group">
                            <span
                              onClick={() => isAdmin && handleStartInlineCargoEdit(user)}
                              className={`text-xs text-teal-300/90 font-medium truncate ${
                                isAdmin
                                  ? 'cursor-pointer hover:text-teal-200 hover:underline decoration-dashed decoration-teal-500/60 underline-offset-2'
                                  : ''
                              }`}
                              title={isAdmin ? 'Clique para editar o cargo/função diretamente' : undefined}
                            >
                              {user.cargo || 'Cargo não informado'}
                            </span>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleStartInlineCargoEdit(user)}
                                className="opacity-60 group-hover:opacity-100 p-0.5 text-teal-400 hover:text-white transition cursor-pointer"
                                title="Editar cargo/função"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                        {/* @usuario • email */}
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="text-teal-400 font-bold">@ {user.usuario || user.nome.split(' ')[0]}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-300 truncate">{user.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        user.role === 'admin'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : user.role === 'coordenador'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : user.role === 'operador'
                          ? 'bg-teal-950 text-teal-300 border border-teal-800'
                          : 'bg-slate-900 text-slate-400 border border-slate-700'
                      }`}>
                        {user.role === 'admin' ? 'ADMINISTRADOR' : user.role.toUpperCase()}
                      </span>
                      <span className={`text-[10px] flex items-center gap-1 ${user.ativo ? 'text-emerald-400 font-medium' : 'text-rose-400 font-semibold'}`}>
                        <span>{user.ativo ? '●' : '○'}</span>
                        <span>{user.ativo ? 'Ativo' : 'Inativo'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Permissions Summary Badges */}
                  <div className="pt-2 border-t border-teal-950/80">
                    <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider mb-2">
                      PERMISSÕES ATIVAS:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {perms.pode_criar_chamado && (
                        <span className="text-[10px] bg-[#09222c] text-teal-200 px-2 py-0.5 rounded border border-teal-900 font-medium">
                          Criar Chamado
                        </span>
                      )}
                      {perms.pode_editar_chamado && (
                        <span className="text-[10px] bg-[#09222c] text-teal-200 px-2 py-0.5 rounded border border-teal-900 font-medium">
                          Editar Chamado
                        </span>
                      )}
                      {perms.pode_concluir_chamado && (
                        <span className="text-[10px] bg-[#09222c] text-teal-200 px-2 py-0.5 rounded border border-teal-900 font-medium">
                          Concluir / Arquivar
                        </span>
                      )}
                      {perms.pode_reabrir_chamado && (
                        <span className="text-[10px] bg-[#09222c] text-teal-200 px-2 py-0.5 rounded border border-teal-900 font-medium">
                          Reabrir
                        </span>
                      )}
                      {perms.pode_gerenciar_usuarios && (
                        <span className="text-[10px] bg-amber-950/60 text-amber-300 px-2 py-0.5 rounded border border-amber-800/60 font-medium">
                          Gerenciar Usuários
                        </span>
                      )}
                      {perms.pode_gerenciar_areas && (
                        <span className="text-[10px] bg-cyan-950/60 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/60 font-medium">
                          Gerenciar Setores
                        </span>
                      )}
                      {perms.pode_disparar_email && (
                        <span className="text-[10px] bg-[#09222c] text-teal-200 px-2 py-0.5 rounded border border-teal-900 font-medium">
                          Disparar E-mail
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions for User (Admin Only) */}
                  {isAdmin ? (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-teal-950">
                      <button
                        onClick={() => handleOpenEditUser(user)}
                        className="flex items-center gap-1.5 text-xs bg-[#09222c] hover:bg-[#0c2e3b] text-teal-300 hover:text-white px-3 py-1.5 rounded-xl border border-teal-800/80 transition cursor-pointer font-semibold"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-teal-400" />
                        <span>Modificar acesso e permissões</span>
                      </button>

                      <button
                        onClick={() => setUserToDelete(user)}
                        disabled={users.length <= 1}
                        className="flex items-center gap-1.5 text-xs bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white px-3 py-1.5 rounded-xl border border-rose-900/60 transition cursor-pointer font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
                        title={users.length <= 1 ? 'Não é possível excluir o único usuário' : 'Excluir usuário'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-teal-950 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Lock className="w-3 h-3 text-amber-400/80" />
                        <span>Alterações restritas a Administradores</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ÁREAS & SETORES MANAGEMENT */}
      {activeTab === 'areas' && (
        <div className="bg-[#0a1e27] border border-teal-800/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-teal-900/60 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-400" />
                <span>Gerenciamento de Áreas, Setores & Postos</span>
              </h3>
              <p className="text-xs text-teal-300/80 mt-0.5">
                Cadastre, modifique, inative ou exclua os setores do Hospital Alemão Oswaldo Cruz
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenAddArea}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer border border-teal-400/30"
              >
                <Plus className="w-4 h-4" />
                <span>+ NOVO SETOR</span>
              </button>
            )}
          </div>

          {/* Areas Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {areas.map((area) => (
              <div
                key={area.id}
                className={`bg-[#06151c] border rounded-xl p-3.5 space-y-2.5 transition ${
                  area.ativo ? 'border-teal-900/80' : 'border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className={`font-bold text-sm ${area.ativo ? 'text-white' : 'text-slate-500 line-through'}`}>
                      {area.nome}
                    </div>
                    <div className="text-xs text-teal-300/80">
                      {area.descricao || 'Sem descrição cadastrada'}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    area.ativo ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-500'
                  }`}>
                    {area.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-teal-950">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => onToggleArea(area.id)}
                        className={`text-[11px] font-semibold transition cursor-pointer ${
                          area.ativo ? 'text-amber-400 hover:underline' : 'text-emerald-400 hover:underline'
                        }`}
                      >
                        {area.ativo ? 'Desativar' : 'Ativar'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditArea(area)}
                          className="p-1.5 bg-[#09222c] hover:bg-[#0c2e3b] text-teal-300 rounded-lg border border-teal-800/80 transition cursor-pointer"
                          title="Editar Setor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setAreaToDelete(area)}
                          className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg border border-rose-900/60 transition cursor-pointer"
                          title="Excluir Setor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">Somente leitura</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. RESPONSÁVEIS / PLANTONISTAS */}
      {activeTab === 'responsaveis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add Responsible Form (Admin Only) */}
          {isAdmin ? (
            <div className="lg:col-span-4 bg-[#0a1e27] border border-teal-800/80 rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-400" />
                <span>Cadastrar Novo Plantonista / Dupla</span>
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newRespNome.trim()) return;
                  onAddResponsible(newRespNome.trim(), newRespCargo.trim(), newRespEmail.trim());
                  setNewRespNome('');
                  setNewRespCargo('');
                  setNewRespEmail('');
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nome do Profissional / Dupla <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newRespNome}
                    onChange={(e) => setNewRespNome(e.target.value)}
                    placeholder="Ex: Wagner Marcelino ou Wagner/Elias"
                    className="w-full bg-[#06151c] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Cargo / Especialidade
                  </label>
                  <input
                    type="text"
                    value={newRespCargo}
                    onChange={(e) => setNewRespCargo(e.target.value)}
                    placeholder="Ex: Suporte N2, Redes, Hardware..."
                    className="w-full bg-[#06151c] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    E-mail Corporativo
                  </label>
                  <input
                    type="email"
                    value={newRespEmail}
                    onChange={(e) => setNewRespEmail(e.target.value)}
                    placeholder="nome@hospital.org.br"
                    className="w-full bg-[#06151c] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 mt-2 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar à Lista</span>
                </button>
              </form>
            </div>
          ) : null}

          {/* Responsibles List */}
          <div className={`${isAdmin ? 'lg:col-span-8' : 'lg:col-span-12'} bg-[#0a1e27] border border-teal-800/80 rounded-2xl p-5 shadow-lg space-y-3`}>
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Lista de Responsáveis para Atribuição</span>
              <span className="text-xs text-teal-300/80 font-normal">
                {responsibles.filter((r) => r.ativo).length} ativos de {responsibles.length} cadastrados
              </span>
            </h3>

            <div className="divide-y divide-teal-900/50">
              {responsibles.map((resp) => (
                <div key={resp.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      resp.ativo ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {resp.nome.substring(0, 2)}
                    </div>
                    <div>
                      <div className={`font-semibold ${resp.ativo ? 'text-white' : 'text-slate-500 line-through'}`}>
                        {resp.nome}
                      </div>
                      <div className="text-[11px] text-teal-300/80">{resp.cargo || 'Técnico de Suporte'}</div>
                    </div>
                  </div>

                  {isAdmin ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleResponsible(resp.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition cursor-pointer ${
                          resp.ativo
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/60 hover:bg-emerald-900/80'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {resp.ativo ? 'Ativo' : 'Inativo'}
                      </button>

                      {onDeleteResponsible && (
                        <button
                          onClick={() => onDeleteResponsible(resp.id)}
                          className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                          title="Excluir responsável"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className={`text-[11px] font-medium ${resp.ativo ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {resp.ativo ? '● Ativo' : '○ Inativo'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. ENVIO AUTOMÁTICO */}
      {activeTab === 'envio_auto' && (
        <form onSubmit={handleSaveSettings} className="bg-[#0a1e27] border border-teal-800/80 rounded-2xl p-6 shadow-lg space-y-5">
          <div className="border-b border-teal-900/60 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-amber-400" />
                <span>Envio Automático do Relatório de Plantão</span>
              </h3>
              <p className="text-xs text-teal-300/80 mt-0.5">
                Programe o disparo diário do resumo consolidado de chamados para as chefias
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.envio_automatico_ativo}
                onChange={(e) => setFormData({ ...formData, envio_automatico_ativo: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#06151c] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              <span className="ml-2 text-xs font-semibold text-slate-200">
                {formData.envio_automatico_ativo ? 'Ativado' : 'Desativado'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Horário Diário de Envio (Ex: 06:45 ou 18:45)
              </label>
              <input
                type="time"
                value={formData.horario_envio_automatico}
                onChange={(e) => setFormData({ ...formData, horario_envio_automatico: e.target.value })}
                className="w-full bg-[#06151c] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Condição de Disparo
              </label>
              <label className="flex items-center gap-2 text-slate-300 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enviar_somente_com_chamados}
                  onChange={(e) => setFormData({ ...formData, enviar_somente_com_chamados: e.target.checked })}
                  className="rounded bg-[#06151c] border-teal-800 text-teal-600 focus:ring-0"
                />
                <span>Enviar somente quando existirem chamados registrados no turno</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-2">
              Dias da Semana Programados
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => {
                const isSelected = formData.dias_envio?.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow'
                        : 'bg-[#06151c] text-slate-400 border border-teal-900 hover:bg-[#09222c]'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-teal-900/60 flex items-center justify-between">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-4 h-4" />
                Configurações salvas com sucesso!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white px-5 py-2 rounded-lg text-xs font-bold shadow transition cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Configurações de Envio</span>
            </button>
          </div>
        </form>
      )}

      {/* 5. GERAL & DADOS */}
      {activeTab === 'geral' && (
        <div className="bg-[#0a1e27] border border-teal-800/80 rounded-2xl p-6 shadow-lg space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Identificação da Unidade Hospitalar</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome do Sistema</label>
                <input
                  type="text"
                  value={formData.sistema_nome}
                  onChange={(e) => setFormData({ ...formData, sistema_nome: e.target.value })}
                  className="w-full bg-[#06151c] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Unidade / Setor Responsável</label>
                <input
                  type="text"
                  value={formData.unidade_hospitalar}
                  onChange={(e) => setFormData({ ...formData, unidade_hospitalar: e.target.value })}
                  className="w-full bg-[#06151c] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow transition cursor-pointer"
            >
              Salvar Dados da Unidade
            </button>
          </form>

          {/* Demo Reset */}
          <div className="pt-6 border-t border-teal-900/60 space-y-3">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              Zona de Restauração de Dados
            </h4>
            <p className="text-xs text-slate-400">
              Restaurar os chamados originais da planilha do Hospital Alemão Oswaldo Cruz e técnicos padrões.
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm('Deseja restaurar todos os dados para os padrões de fábrica?')) {
                  onResetData();
                }
              }}
              className="bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restaurar Chamados e Dados Padrões</span>
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT / CREATE USER & PERMISSIONS --- */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0a1e27] border border-teal-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-[#071922] px-6 py-4 border-b border-teal-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingUser ? 'Modificar Usuário, Acesso & Permissões' : 'Cadastrar Novo Usuário'}
                  </h3>
                  <p className="text-xs text-teal-300/80">
                    Defina o papel funcional e as permissões de acesso ao sistema
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* User Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nome Completo <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormData.nome}
                    onChange={(e) => setUserFormData({ ...userFormData, nome: e.target.value })}
                    placeholder="Ex: Wagner Marcelino"
                    className="w-full bg-[#06151c] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    E-mail Corporativo <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="nome@hospital.org.br"
                    className="w-full bg-[#06151c] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nome de Usuário (Login) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormData.usuario}
                    onChange={(e) => setUserFormData({ ...userFormData, usuario: e.target.value })}
                    placeholder="Ex: Wagner"
                    className="w-full bg-[#06151c] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Senha de Acesso <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormData.senha}
                    onChange={(e) => setUserFormData({ ...userFormData, senha: e.target.value })}
                    placeholder="Ex: 16763"
                    className="w-full bg-[#06151c] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Cargo / Função</span>
                    <span className="text-[10px] text-teal-400/80 font-normal">Exibido no perfil e nos chamados</span>
                  </label>
                  <input
                    type="text"
                    value={userFormData.cargo}
                    onChange={(e) => setUserFormData({ ...userFormData, cargo: e.target.value })}
                    placeholder="Ex: Analista de risco Sênior, Técnico de Suporte TI..."
                    className="w-full bg-[#06151c] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nível de Acesso (Role)
                  </label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full bg-[#06151c] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400 font-semibold"
                  >
                    <option value="admin">Administrador (Acesso Total)</option>
                    <option value="coordenador">Coordenador (Gestão de Turno & Equipe)</option>
                    <option value="operador">Operador de Plantão (Abertura & Conclusão)</option>
                    <option value="visualizador">Visualizador (Somente Leitura)</option>
                  </select>
                </div>
              </div>

              {/* Granular Permissions Section */}
              <div className="pt-3 border-t border-teal-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-teal-300">
                    Permissões Granulares de Acesso:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Clique para personalizar
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#06151c] p-3.5 rounded-xl border border-teal-900/80">
                  {[
                    { key: 'pode_criar_chamado', label: 'Cadastrar novos chamados' },
                    { key: 'pode_editar_chamado', label: 'Editar chamados e prioridades' },
                    { key: 'pode_concluir_chamado', label: 'Concluir e arquivar chamados' },
                    { key: 'pode_reabrir_chamado', label: 'Reabrir chamados arquivados' },
                    { key: 'pode_gerenciar_usuarios', label: 'Gerenciar usuários e acessos' },
                    { key: 'pode_gerenciar_areas', label: 'Gerenciar áreas e setores hospitalares' },
                    { key: 'pode_disparar_email', label: 'Disparar e-mail de passagem' },
                    { key: 'pode_configurar_sistema', label: 'Acessar configurações gerais e reset' },
                  ].map((perm) => {
                    const isChecked = userFormData.permissoes[perm.key as keyof UserPermissions];
                    return (
                      <label
                        key={perm.key}
                        onClick={() => handlePermissionToggle(perm.key as keyof UserPermissions)}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#09222c] cursor-pointer transition select-none"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-teal-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                        <span className={`text-xs ${isChecked ? 'text-slate-100 font-medium' : 'text-slate-400'}`}>
                          {perm.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Status active toggle */}
              <div className="flex items-center gap-2 pt-2">
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userFormData.ativo}
                    onChange={(e) => setUserFormData({ ...userFormData, ativo: e.target.checked })}
                    className="rounded bg-[#06151c] border-teal-800 text-teal-600 focus:ring-0"
                  />
                  <span className="font-semibold">Usuário ativo no sistema</span>
                </label>
              </div>

              {/* Footer Modal Actions */}
              <div className="pt-4 border-t border-teal-900/60 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 bg-[#09222c] hover:bg-[#0c2e3b] text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: DELETE USER CONFIRMATION --- */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0a1e27] border border-rose-800/80 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Confirmar Exclusão de Usuário</h3>
                <p className="text-xs text-rose-300">Ação permanente</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Você tem certeza que deseja excluir o usuário <strong className="text-white">{userToDelete.nome}</strong> ({userToDelete.email})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-[#09222c] hover:bg-[#0c2e3b] text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer"
              >
                Sim, Excluir Usuário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT / CREATE AREA --- */}
      {isAreaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0a1e27] border border-teal-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-[#071922] px-6 py-4 border-b border-teal-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">
                  {editingArea ? 'Editar Setor / Área' : 'Cadastrar Novo Setor'}
                </h3>
              </div>
              <button onClick={() => setIsAreaModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArea} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nome do Setor / Área <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={areaFormData.nome}
                  onChange={(e) => setAreaFormData({ ...areaFormData, nome: e.target.value })}
                  placeholder="Ex: Hemodiálise, Berçário, etc."
                  className="w-full bg-[#06151c] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Descrição / Localização
                </label>
                <input
                  type="text"
                  value={areaFormData.descricao}
                  onChange={(e) => setAreaFormData({ ...areaFormData, descricao: e.target.value })}
                  placeholder="Ex: Bloco B - 2º Andar"
                  className="w-full bg-[#06151c] border border-teal-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-teal-400"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-200 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={areaFormData.ativo}
                  onChange={(e) => setAreaFormData({ ...areaFormData, ativo: e.target.checked })}
                  className="rounded bg-[#06151c] border-teal-800 text-teal-600 focus:ring-0"
                />
                <span className="font-semibold">Setor ativo no sistema</span>
              </label>

              <div className="pt-4 border-t border-teal-900/60 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAreaModalOpen(false)}
                  className="px-4 py-2 bg-[#09222c] hover:bg-[#0c2e3b] text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Salvar Setor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: DELETE AREA CONFIRMATION --- */}
      {areaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0a1e27] border border-rose-800/80 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Confirmar Exclusão de Setor</h3>
                <p className="text-xs text-rose-300">Ação permanente</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Você tem certeza que deseja excluir o setor <strong className="text-white">{areaToDelete.nome}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setAreaToDelete(null)}
                className="px-4 py-2 bg-[#09222c] hover:bg-[#0c2e3b] text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteArea}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer"
              >
                Sim, Excluir Setor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
