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
  BellRing
} from 'lucide-react';
import { AreaItem, ResponsibleItem, StatusItem, AppSettings, UserProfile } from '../types';

interface SettingsViewProps {
  areas: AreaItem[];
  responsibles: ResponsibleItem[];
  statuses: StatusItem[];
  settings: AppSettings;
  users: UserProfile[];
  currentUser: UserProfile;
  onAddArea: (nome: string, descricao?: string) => void;
  onUpdateArea: (id: string, updates: Partial<AreaItem>) => void;
  onToggleArea: (id: string) => void;
  onAddResponsible: (nome: string, cargo?: string, email?: string) => void;
  onUpdateResponsible: (id: string, updates: Partial<ResponsibleItem>) => void;
  onToggleResponsible: (id: string) => void;
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
  onToggleArea,
  onAddResponsible,
  onUpdateResponsible,
  onToggleResponsible,
  onUpdateSettings,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'responsaveis' | 'areas' | 'envio_auto' | 'geral'>('responsaveis');
  
  // Responsibles local state
  const [newRespNome, setNewRespNome] = useState('');
  const [newRespCargo, setNewRespCargo] = useState('');
  const [newRespEmail, setNewRespEmail] = useState('');

  // Area local state
  const [newAreaNome, setNewAreaNome] = useState('');
  const [newAreaDesc, setNewAreaDesc] = useState('');

  // Settings form state
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddResponsibleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRespNome.trim()) return;
    onAddResponsible(newRespNome.trim(), newRespCargo.trim(), newRespEmail.trim());
    setNewRespNome('');
    setNewRespCargo('');
    setNewRespEmail('');
  };

  const handleAddAreaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaNome.trim()) return;
    onAddArea(newAreaNome.trim(), newAreaDesc.trim());
    setNewAreaNome('');
    setNewAreaDesc('');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-800 text-blue-400 rounded-xl border border-slate-700">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Configurações & Cadastros do Sistema
            </h2>
            <p className="text-xs text-slate-400">
              Gerencie a equipe de responsáveis, setores hospitalares, envio automatizado e preferências
            </p>
          </div>
        </div>

        {currentUser.role === 'admin' && (
          <span className="bg-amber-950/60 text-amber-300 border border-amber-800/60 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Perfil: Administrador</span>
          </span>
        )}
      </div>

      {/* Settings Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('responsaveis')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'responsaveis'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Equipe & Responsáveis ({responsibles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('areas')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'areas'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Áreas & Setores ({areas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('envio_auto')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'envio_auto'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Envio Automático</span>
        </button>

        <button
          onClick={() => setActiveTab('geral')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === 'geral'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Geral & Dados</span>
        </button>
      </div>

      {/* 1. Responsibles Management (Section 3 Requirement) */}
      {activeTab === 'responsaveis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add Responsible Form */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Cadastrar Novo Responsável</span>
            </h3>

            <form onSubmit={handleAddResponsibleSubmit} className="space-y-3 text-xs">
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-blue-500"
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-blue-500"
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar à Lista</span>
              </button>
            </form>
          </div>

          {/* Responsibles List */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Lista de Responsáveis no Plantão</span>
              <span className="text-xs text-slate-400 font-normal">
                {responsibles.filter((r) => r.ativo).length} ativos de {responsibles.length} cadastrados
              </span>
            </h3>

            <div className="divide-y divide-slate-800">
              {responsibles.map((resp) => (
                <div key={resp.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      resp.ativo ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {resp.nome.substring(0, 2)}
                    </div>
                    <div>
                      <div className={`font-semibold ${resp.ativo ? 'text-white' : 'text-slate-500 line-through'}`}>
                        {resp.nome}
                      </div>
                      <div className="text-[11px] text-slate-400">{resp.cargo || 'Técnico de Suporte'}</div>
                    </div>
                  </div>

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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Areas Management */}
      {activeTab === 'areas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add Area Form */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Cadastrar Novo Setor / Área</span>
            </h3>

            <form onSubmit={handleAddAreaSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nome da Área / Setor <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newAreaNome}
                  onChange={(e) => setNewAreaNome(e.target.value)}
                  placeholder="Ex: Hemodiálise, Berçário, etc."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Descrição / Localização
                </label>
                <input
                  type="text"
                  value={newAreaDesc}
                  onChange={(e) => setNewAreaDesc(e.target.value)}
                  placeholder="Ex: Bloco B - 2º Andar"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Setor</span>
              </button>
            </form>
          </div>

          {/* Areas List */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Setores Cadastrados</span>
              <span className="text-xs text-slate-400 font-normal">
                {areas.filter((a) => a.ativo).length} ativos
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {areas.map((area) => (
                <div key={area.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div>
                    <div className={`font-semibold ${area.ativo ? 'text-slate-100' : 'text-slate-500 line-through'}`}>
                      {area.nome}
                    </div>
                    {area.descricao && <div className="text-[11px] text-slate-500">{area.descricao}</div>}
                  </div>
                  <button
                    onClick={() => onToggleArea(area.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer ${
                      area.ativo
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {area.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Automatic Email Dispatch Settings (Section 13 Requirement) */}
      {activeTab === 'envio_auto' && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-amber-400" />
                <span>Envio Automático do Relatório de Plantão</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
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
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
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
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none"
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
                  className="rounded bg-slate-950 border-slate-700 text-blue-600"
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
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-4 h-4" />
                Configurações salvas com sucesso!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-xs font-bold shadow transition cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Configurações de Envio</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. Geral & Dados */}
      {activeTab === 'geral' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Identificação da Unidade</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome do Sistema</label>
                <input
                  type="text"
                  value={formData.sistema_nome}
                  onChange={(e) => setFormData({ ...formData, sistema_nome: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Unidade / Setor Responsável</label>
                <input
                  type="text"
                  value={formData.unidade_hospitalar}
                  onChange={(e) => setFormData({ ...formData, unidade_hospitalar: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow transition cursor-pointer"
            >
              Salvar Dados da Unidade
            </button>
          </form>

          {/* Demo Reset */}
          <div className="pt-6 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              Zona de Restauração de Dados
            </h4>
            <p className="text-xs text-slate-400">
              Restaurar os 5 chamados de exemplo originais da planilha (T504757, T504673, R119018, T504443, R117620) e técnicos padrões.
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm('Deseja restaurar os dados de exemplo padrão?')) {
                  onResetData();
                }
              }}
              className="bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restaurar Chamados e Dados de Exemplo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
