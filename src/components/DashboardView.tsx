import React, { useMemo } from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  AlertOctagon, 
  CheckCircle2, 
  PauseCircle, 
  TrendingUp, 
  Users, 
  Building2, 
  BarChart3, 
  PieChart, 
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { Ticket, AreaItem, ResponsibleItem } from '../types';

interface DashboardViewProps {
  allTickets: Ticket[];
  areas: AreaItem[];
  responsibles: ResponsibleItem[];
  onNavigateToTab: (tab: 'painel' | 'passagem' | 'historico' | 'relatorios') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  allTickets,
  areas,
  responsibles,
  onNavigateToTab,
}) => {
  const activeTickets = allTickets.filter((t) => !t.arquivado);
  const archivedTickets = allTickets.filter((t) => t.arquivado);

  // Metrics
  const totalPlantao = allTickets.length;
  const totalAtivos = activeTickets.length;
  const totalPendentes = activeTickets.filter((t) => t.status === 'Pendente').length;
  const totalEmAndamento = activeTickets.filter((t) => t.status.toLowerCase().includes('andamento') || t.status.toLowerCase().includes('atendimento')).length;
  const totalAguardando = activeTickets.filter((t) => t.status.toLowerCase().includes('aguard')).length;
  const totalResolvidos = allTickets.filter((t) => t.arquivado || t.status === 'Resolvido').length;

  // Distribution by Priority
  const priorityStats = useMemo(() => {
    const counts: Record<string, { total: number; active: number }> = {
      P1: { total: 0, active: 0 },
      P2: { total: 0, active: 0 },
      P3: { total: 0, active: 0 },
      P4: { total: 0, active: 0 },
    };
    allTickets.forEach((t) => {
      const p = t.prioridade || 'P4';
      if (!counts[p]) counts[p] = { total: 0, active: 0 };
      counts[p].total++;
      if (!t.arquivado) counts[p].active++;
    });
    return counts;
  }, [allTickets]);

  // Distribution by Area
  const areaStats = useMemo(() => {
    const map = new Map<string, { total: number; active: number }>();
    allTickets.forEach((t) => {
      const current = map.get(t.area) || { total: 0, active: 0 };
      current.total++;
      if (!t.arquivado) current.active++;
      map.set(t.area, current);
    });
    return Array.from(map.entries())
      .map(([area, data]) => ({ area, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [allTickets]);

  // Distribution by Responsible
  const respStats = useMemo(() => {
    const map = new Map<string, { total: number; active: number; resolved: number }>();
    allTickets.forEach((t) => {
      const current = map.get(t.responsavel) || { total: 0, active: 0, resolved: 0 };
      current.total++;
      if (!t.arquivado) current.active++;
      if (t.arquivado || t.status === 'Resolvido') current.resolved++;
      map.set(t.responsavel, current);
    });
    return Array.from(map.entries())
      .map(([responsavel, data]) => ({ responsavel, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [allTickets]);

  // Resolution Rate %
  const resolutionRate = totalPlantao > 0 ? Math.round((totalResolvidos / totalPlantao) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Dashboard Top Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-400" />
            <span>Dashboard & Indicadores Operacionais</span>
          </h2>
          <p className="text-xs text-slate-400">
            Métricas em tempo real da equipe de suporte e infraestrutura de TI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('relatorios')}
            className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-500/40 transition cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Gerar Relatório Consolidado</span>
          </button>
        </div>
      </div>

      {/* 6 Top Key KPI Metric Cards (from Section 10) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Ativos */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Chamados Ativos</span>
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          </div>
          <div className="text-2xl font-black text-white">{totalAtivos}</div>
          <div className="text-[10px] text-slate-400 mt-1">No painel operacional</div>
        </div>

        {/* 2. Pendentes */}
        <div className="bg-slate-900 border border-rose-500/30 rounded-xl p-4 shadow-sm hover:border-rose-500/60 transition">
          <div className="flex items-center justify-between text-rose-400 text-xs font-semibold mb-2">
            <span>Pendentes</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{totalPendentes}</div>
          <div className="text-[10px] text-slate-400 mt-1">Aguardam início</div>
        </div>

        {/* 3. Em Andamento */}
        <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-4 shadow-sm hover:border-blue-500/60 transition">
          <div className="flex items-center justify-between text-blue-400 text-xs font-semibold mb-2">
            <span>Em Andamento</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{totalEmAndamento}</div>
          <div className="text-[10px] text-slate-400 mt-1">Em atendimento</div>
        </div>

        {/* 4. Aguardando */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 shadow-sm hover:border-amber-500/60 transition">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold mb-2">
            <span>Aguardando</span>
            <PauseCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{totalAguardando}</div>
          <div className="text-[10px] text-slate-400 mt-1">Terceiros / Senha</div>
        </div>

        {/* 5. Resolvidos Hoje */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 shadow-sm hover:border-emerald-500/60 transition">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold mb-2">
            <span>Resolvidos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{totalResolvidos}</div>
          <div className="text-[10px] text-slate-400 mt-1">Concluídos com sucesso</div>
        </div>

        {/* 6. Total do Plantão */}
        <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-4 shadow-sm hover:border-indigo-500/60 transition">
          <div className="flex items-center justify-between text-indigo-300 text-xs font-semibold mb-2">
            <span>Total Plantão</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalPlantao}</div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">
            {resolutionRate}% taxa de resolução
          </div>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Chamados por Prioridade */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Distribuição por Prioridade</span>
            </h3>
            <span className="text-xs text-slate-400">Total: {totalPlantao}</span>
          </div>

          <div className="space-y-3">
            {(['P1', 'P2', 'P3', 'P4'] as const).map((p) => {
              const count = priorityStats[p]?.total || 0;
              const active = priorityStats[p]?.active || 0;
              const percent = totalPlantao > 0 ? Math.round((count / totalPlantao) * 100) : 0;

              return (
                <div key={p} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={p} size="sm" />
                      <span className="font-semibold text-slate-200">
                        {p === 'P1' ? 'Crítico (Urgência Imediata)' : p === 'P2' ? 'Alto (Setor Crítico)' : p === 'P3' ? 'Médio (Rotina)' : 'Normal (Sem Parada)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">
                        Ativos: <strong className="text-amber-400">{active}</strong>
                      </span>
                      <span className="font-bold text-white font-mono">{count} ({percent}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        p === 'P1' ? 'bg-red-500' : p === 'P2' ? 'bg-orange-500' : p === 'P3' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Chamados por Área / Setor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Volume por Área / Setor</span>
            </h3>
            <span className="text-xs text-slate-400">{areaStats.length} setores</span>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {areaStats.map((item) => {
              const percent = totalPlantao > 0 ? Math.round((item.total / totalPlantao) * 100) : 0;
              return (
                <div key={item.area} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{item.area}</span>
                    <span className="text-slate-400 font-mono">
                      <strong className="text-white">{item.total}</strong> chamados ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Atuação por Responsável */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Desempenho e Atribuição por Responsável</span>
            </h3>
            <span className="text-xs text-slate-400">{respStats.length} técnicos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {respStats.map((r) => (
              <div key={r.responsavel} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-100">{r.responsavel}</span>
                  <span className="font-mono font-bold text-xs text-blue-400">{r.total} total</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Ativos: <strong className="text-amber-400">{r.active}</strong></span>
                  <span>Concluídos: <strong className="text-emerald-400">{r.resolved}</strong></span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${r.total > 0 ? (r.resolved / r.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
