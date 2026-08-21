import React, { useState } from 'react';
import { 
  Lock, 
  Shield, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff,
  User,
  Info,
  Clock,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Zap
} from 'lucide-react';
import { UserProfile } from '../types';
import { OswaldoCruzLogo } from './OswaldoCruzLogo';

interface LoginModalProps {
  users: UserProfile[];
  onLogin: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  // Quick fill helper
  const handleQuickFill = (user: UserProfile) => {
    setUsername(user.usuario || user.nome.split(' ')[0]);
    setPassword(user.senha || '16763');
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setErrorMsg('Por favor, informe o nome de usuário.');
      return;
    }

    if (!cleanPassword) {
      setErrorMsg('Por favor, informe a senha de acesso.');
      return;
    }

    // Match by usuario (e.g. 'Wagner'), or full name, or email
    const matchedUser = users.find((u) => 
      (u.usuario && u.usuario.toLowerCase() === cleanUsername) ||
      u.nome.toLowerCase() === cleanUsername ||
      u.email.toLowerCase() === cleanUsername ||
      u.nome.toLowerCase().split(' ')[0] === cleanUsername
    );

    if (!matchedUser) {
      setErrorMsg(`Usuário "${username}" não encontrado no sistema. Verifique o usuário ou consulte o modelo de acesso.`);
      return;
    }

    if (!matchedUser.ativo) {
      setErrorMsg(`O usuário "${matchedUser.nome}" está inativo. Contate o administrador de TI.`);
      return;
    }

    // Check password
    const expectedPassword = matchedUser.senha || '16763';
    if (cleanPassword !== expectedPassword) {
      setErrorMsg(`Senha incorreta para o usuário "${matchedUser.usuario || matchedUser.nome}".`);
      return;
    }

    // Success Authentication
    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      setIsLoading(false);
      onLogin(matchedUser);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Main Container */}
      <div className="bg-[#0a1e27] border border-teal-800/80 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Column: Institutional Branding */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#06151c] via-[#071d26] to-[#041117] p-8 border-b md:border-b-0 md:border-r border-teal-900/80 flex flex-col justify-between relative overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <OswaldoCruzLogo size="lg" textColor="text-white" subtitleColor="text-teal-400" />

            <div className="space-y-3 pt-4 border-t border-teal-900/60">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-700/60 text-teal-300 text-xs font-bold">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                <span>Autenticação Corporativa de TI</span>
              </div>
              <h2 className="text-xl font-bold text-white leading-snug">
                Portal de Passagem de Plantão
              </h2>
              <p className="text-xs text-teal-200/80 leading-relaxed">
                Acesso seguro e restrito a técnicos, operadores e gestores de Tecnologia da Informação do Hospital Alemão Oswaldo Cruz.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-teal-900/40 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-teal-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Plantão 24/7 Operacional</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Todas as ações de criação, edição e conclusão de chamados são auditadas e vinculadas ao seu usuário.
            </p>
          </div>
        </div>

        {/* Right Column: Login Form & Credentials */}
        <div className="md:col-span-7 p-8 flex flex-col justify-between bg-[#0a1e27]">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Login do Plantonista</h3>
                <p className="text-xs text-teal-300/80">
                  Informe suas credenciais corporativas para iniciar o turno
                </p>
              </div>
              <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
                <Lock className="w-5 h-5" />
              </div>
            </div>

            {/* Model & Quick Fill Card */}
            <div className="bg-gradient-to-r from-[#06151c] to-[#09222c] border border-teal-800/90 rounded-2xl p-4 mb-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Modelo de Acesso de Exemplo
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const wagner = users.find(u => u.usuario?.toLowerCase() === 'wagner' || u.nome.toLowerCase().includes('wagner')) || users[0];
                    if (wagner) handleQuickFill(wagner);
                  }}
                  className="flex items-center gap-1 text-[11px] bg-teal-600/30 hover:bg-teal-600 text-teal-300 hover:text-white px-2.5 py-1 rounded-lg border border-teal-500/50 transition cursor-pointer font-bold"
                  title="Preencher credenciais de Wagner"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Preencher Wagner</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-[#041117] p-2.5 rounded-xl border border-teal-950">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Usuário:</span>
                  <span className="text-white font-mono font-bold text-sm">Wagner</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Senha:</span>
                  <span className="text-teal-300 font-mono font-bold text-sm">16763</span>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Nome de Usuário</span>
                  <span className="text-[10px] text-teal-400/80 font-normal">Ex: Wagner, Elias, Fatima</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-teal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Digite seu usuário (Ex: Wagner)"
                    className="w-full bg-[#06151c] border border-teal-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Senha de Acesso</span>
                  <span className="text-[10px] text-teal-400/80 font-normal">Senha do modelo: 16763</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-teal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Digite sua senha (Ex: 16763)"
                    className="w-full bg-[#06151c] border border-teal-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Notification */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 active:from-teal-700 active:to-cyan-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-xl shadow-teal-950/70 transition cursor-pointer flex items-center justify-center gap-2 border border-teal-400/30 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar no Plantão</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Other Plantonistas Accordion */}
            <div className="mt-5 pt-4 border-t border-teal-900/60">
              <button
                type="button"
                onClick={() => setShowUserList(!showUserList)}
                className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-teal-300 transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Ver outros plantonistas cadastrados ({users.filter(u => u.ativo).length})</span>
                </div>
                {showUserList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showUserList && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 max-h-36 overflow-y-auto pr-1 no-scrollbar animate-in fade-in">
                  {users.filter(u => u.ativo).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickFill(u)}
                      className="p-2 rounded-xl bg-[#06151c] hover:bg-[#0c2e3b] border border-teal-900/70 text-left transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white group-hover:text-teal-300 truncate">
                          {u.nome}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                          <span className="text-teal-400 font-mono">@{u.usuario || u.nome.split(' ')[0]}</span>
                          <span>•</span>
                          <span>{u.cargo}</span>
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 shrink-0 ml-1.5 uppercase font-bold">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
