import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  ArrowRightLeft, 
  History, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Plus, 
  Clock, 
  UserCheck, 
  Shield, 
  ChevronDown,
  Building2,
  Menu,
  X,
  Layers,
  Sparkles,
  Mail,
  Send,
  LogOut,
  Lock
} from 'lucide-react';
import { UserProfile, AppSettings } from '../types';
import { OswaldoCruzLogo } from './OswaldoCruzLogo';

interface NavbarProps {
  currentTab: 'painel' | 'passagem' | 'historico' | 'dashboard' | 'relatorios' | 'configuracoes';
  onSelectTab: (tab: 'painel' | 'passagem' | 'historico' | 'dashboard' | 'relatorios' | 'configuracoes') => void;
  activeCount: number;
  archivedCount: number;
  onOpenNewTicket: () => void;
  onOpenSendEmail: () => void;
  currentUser: UserProfile;
  users: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  onLogout?: () => void;
  settings: AppSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeCount,
  archivedCount,
  onOpenNewTicket,
  onOpenSendEmail,
  currentUser,
  users,
  onSwitchUser,
  onLogout,
  settings,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getShiftName = (d: Date) => {
    const hours = d.getHours();
    if (hours >= 7 && hours < 17) {
      return 'Diurno 07:00 16:48';
    } else if (hours >= 17 && hours < 20) {
      return 'Diurno 10:00 20:48';
    } else if (hours >= 20 || hours < 6) {
      return 'Noturno 20:12 06:00';
    }
    return 'Diurno 06:00 15:48';
  };

  interface NavItem {
    id: 'painel' | 'passagem' | 'historico' | 'dashboard' | 'relatorios' | 'configuracoes';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
    highlight?: boolean;
  }

  const isAdmin = currentUser.role === 'admin';

  const navItems: NavItem[] = [
    {
      id: 'painel',
      label: 'Painel Operacional',
      icon: ClipboardList,
      badge: activeCount,
      badgeColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    },
    {
      id: 'passagem',
      label: 'Passagem de Plantão',
      icon: ArrowRightLeft,
      highlight: true,
    },
    {
      id: 'historico',
      label: 'Histórico Completo',
      icon: History,
      badge: archivedCount,
      badgeColor: 'bg-[#09222c] text-teal-300/80 border border-teal-800/40',
    },
    {
      id: 'dashboard',
      label: 'Dashboard & Indicadores',
      icon: LayoutDashboard,
    },
    {
      id: 'relatorios',
      label: 'Relatórios & E-mail',
      icon: FileText,
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
      badge: !isAdmin ? '🔒 Admin' : undefined,
      badgeColor: 'bg-amber-950/90 text-amber-300 border border-amber-800/80',
    },
  ];

  return (
    <>
      {/* Left Sidebar for Desktop (Hospital Alemão Oswaldo Cruz Theme: w-64 bg-[#0a1e27] border-r border-teal-900/60) */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0a1e27] border-r border-teal-900/60 fixed inset-y-0 left-0 z-30 select-none">
        {/* Brand / Logo */}
        <div className="p-4 border-b border-teal-900/60 flex items-center justify-between">
          <OswaldoCruzLogo size="sm" textColor="text-white" subtitleColor="text-teal-400" />
        </div>

        {/* Live Shift Status Pill */}
        <div className="px-4 py-3 border-b border-teal-950 bg-[#06151c]/80">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-teal-300 font-bold tracking-wider text-[11px]">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-sm shadow-teal-400"></span>
              TI • EM OPERAÇÃO
            </span>
            <span className="text-[10px] text-teal-400/80 font-mono">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1 truncate font-medium">
            {settings.unidade_hospitalar}
          </div>
        </div>

        {/* Quick Email Dispatch Button in Sidebar */}
        <div className="p-3 border-b border-teal-900/50 bg-[#081d26]">
          <button
            onClick={onOpenSendEmail}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 active:from-teal-700 active:to-cyan-700 text-white p-2.5 rounded-xl font-bold text-xs shadow-lg shadow-teal-950/60 transition cursor-pointer border border-teal-400/30 group"
            title="Enviar relatório oficial de passagem por e-mail"
          >
            <Mail className="w-4 h-4 text-white group-hover:scale-110 transition" />
            <span>DISPARAR E-MAIL PLANTÃO</span>
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
          <div className="px-3 py-1.5 text-[10px] font-bold text-teal-400/70 uppercase tracking-wider">
            Navegação Principal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                  isActive
                    ? 'bg-teal-600/20 text-teal-300 border-l-2 border-teal-400 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-teal-950/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-teal-500/60'}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Operator Section */}
        <div className="p-3 border-t border-teal-900/60 bg-[#071922]">
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-[#09222c] hover:bg-[#0c2a38] border border-teal-800/60 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-xs font-bold text-white shrink-0 uppercase shadow-md border border-teal-300/40">
                  {currentUser.nome.substring(0, 2)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{currentUser.nome}</div>
                  <div className="text-[10px] text-teal-300/80 truncate">{currentUser.cargo}</div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-teal-400 shrink-0 ml-1" />
            </button>

            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#0a1e27] border border-teal-800 rounded-xl shadow-2xl z-50 p-2 text-slate-200">
                  <div className="px-2.5 py-1.5 text-[11px] font-bold text-teal-300 uppercase tracking-wider border-b border-teal-900">
                    Plantonista Ativo (TI)
                  </div>
                  <div className="max-h-56 overflow-y-auto mt-1 space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (u.id !== currentUser.id && onLogout) {
                            onLogout();
                          }
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition text-left cursor-pointer ${
                          u.id === currentUser.id
                            ? 'bg-teal-600/20 text-teal-300 border border-teal-500/40 font-bold'
                            : 'hover:bg-teal-950/60 text-slate-300'
                        }`}
                        title={u.id === currentUser.id ? 'Usuário conectado' : `Trocar para ${u.nome} (Requer Senha)`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-teal-900 border border-teal-700 flex items-center justify-center font-bold text-[10px] text-teal-200">
                            {u.nome.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium text-slate-200">{u.nome}</div>
                            <div className="text-[10px] text-teal-400/70">{u.cargo}</div>
                          </div>
                        </div>
                        {u.role === 'admin' ? (
                          <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Administrador" />
                        ) : u.id === currentUser.id ? (
                          <span className="text-[10px] text-teal-400 font-bold">Ativo</span>
                        ) : null}
                      </button>
                    ))}
                  </div>

                  {onLogout && (
                    <div className="pt-2 mt-2 border-t border-teal-900/80">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold border border-rose-900/60 transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>Sair / Bloquear Sessão</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Top Header Bar for Desktop & Mobile (h-16 bg-[#07171e]/95 backdrop-blur) */}
      <header className="sticky top-0 z-20 bg-[#07171e]/95 backdrop-blur-md border-b border-teal-900/60 px-4 sm:px-6 lg:pl-[272px] lg:pr-6 h-16 flex items-center justify-between">
        {/* Left: Mobile hamburger & current view title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-teal-300 hover:text-white bg-[#0a1e27] border border-teal-900 rounded-lg cursor-pointer"
            aria-label="Abrir Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm sm:text-base">
                {navItems.find((n) => n.id === currentTab)?.label || 'Painel Operacional'}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-teal-300 font-semibold bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                {getShiftName(currentTime)}
              </span>
            </div>
            <p className="text-[11px] text-teal-400/80 hidden sm:block">
              {settings.unidade_hospitalar} • TI Handover
            </p>
          </div>
        </div>

        {/* Right: Actions, Quick Email Button, Clock & New Ticket button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Clock */}
          <div className="hidden md:flex items-center gap-2 text-slate-300 font-mono text-xs bg-[#09222c] border border-teal-900/60 px-3 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>
              {currentTime.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
            </span>
            <span className="font-bold text-teal-200 bg-[#071922] px-1.5 py-0.5 rounded border border-teal-800/60">
              {currentTime.toLocaleTimeString('pt-BR')}
            </span>
          </div>

          {/* Primary Quick Email Dispatch Button */}
          <button
            onClick={onOpenSendEmail}
            className="flex items-center gap-1.5 bg-[#09222c] hover:bg-[#0d2f3d] text-teal-300 hover:text-white px-3 sm:px-3.5 py-2 rounded-xl font-bold text-xs border border-teal-700/60 transition cursor-pointer shadow-sm group"
            title="Abrir modal para envio de e-mail do plantão"
          >
            <Mail className="w-4 h-4 text-teal-400 group-hover:scale-110 transition" />
            <span className="hidden sm:inline">Enviar por E-mail</span>
            <span className="sm:hidden">E-mail</span>
          </button>

          {/* New Ticket Button */}
          <button
            onClick={onOpenNewTicket}
            className="flex items-center gap-1.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 active:from-teal-700 active:to-cyan-700 text-white px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-teal-950/60 border border-teal-400/40 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ NOVO CHAMADO</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-[#0a1e27] border-r border-teal-900 z-50 p-4 flex flex-col justify-between lg:hidden shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-teal-900">
                <OswaldoCruzLogo size="sm" textColor="text-white" subtitleColor="text-teal-400" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Quick Email Button */}
              <button
                onClick={() => {
                  onOpenSendEmail();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-2.5 rounded-xl font-bold text-xs shadow-md"
              >
                <Mail className="w-4 h-4" />
                <span>DISPARAR E-MAIL PLANTÃO</span>
              </button>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                        isActive
                          ? 'bg-teal-600/20 text-teal-300 border-l-2 border-teal-400 font-bold'
                          : 'text-slate-300 hover:bg-[#071922]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-teal-400" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-teal-900 space-y-3">
              <div className="flex items-center justify-between gap-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white uppercase">
                    {currentUser.nome.substring(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-white">{currentUser.nome}</div>
                    <div className="text-[10px] text-teal-400/80">{currentUser.cargo}</div>
                  </div>
                </div>
                {onLogout && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="p-2 bg-rose-950/60 text-rose-300 rounded-lg border border-rose-800"
                    title="Sair / Desconectar"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
