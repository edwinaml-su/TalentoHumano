"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  UserMinus, 
  UserPlus, 
  PieChart,
  Loader2,
  Calendar,
  Download
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AnalyticsDashboard() {
  const [turnoverData, setTurnoverData] = useState<any[]>([]);
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [demoData, setDemoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [turnoverRes, budgetRes, demoRes] = await Promise.all([
          fetch("/api/admin/analytics/turnover"),
          fetch("/api/admin/analytics/payroll-vs-budget"),
          fetch("/api/admin/analytics/demographics")
        ]);
        setTurnoverData(await turnoverRes.json());
        setBudgetData(await budgetRes.json());
        setDemoData(await demoRes.json());
      } catch (err) {
        toast.error("Error al cargar analítica");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  const currentHeadcount = turnoverData[turnoverData.length - 1]?.headcount || 0;
  const avgTurnover = (turnoverData.reduce((acc, curr) => acc + curr.turnover, 0) / turnoverData.length).toFixed(2);
  const totalActual = budgetData.reduce((acc, curr) => acc + curr.actual, 0);
  const totalBudget = budgetData.reduce((acc, curr) => acc + curr.budget, 0);

  const GENDER_COLORS = ['#6366f1', '#ec4899', '#94a3b8'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <Toaster position="top-right" />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full">Fase 3: Talent Analytics & BI</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Estrategia de Talento</h1>
          <p className="text-slate-500 font-medium">Visualización 360° del capital humano, finanzas y demografía.</p>
        </div>

        <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700">
          <Download size={18} /> Exportar Reporte Ejecutivo
        </button>
      </header>

      {/* Strategic KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard icon={<Users className="text-indigo-600" />} label="Total Headcount" value={currentHeadcount.toString()} trend="+4.2%" trendColor="text-emerald-500" />
        <KPICard icon={<TrendingUp className="text-emerald-600" />} label="Tasa de Rotación" value={`${avgTurnover}%`} trend="-0.5%" trendColor="text-emerald-500" />
        <KPICard icon={<BarChart className="text-amber-600" />} label="Eficiencia Presupuesto" value={`${totalBudget > 0 ? ((totalActual / totalBudget) * 100).toFixed(1) : 0}%`} trend="Ejecución" trendColor="text-slate-400" />
        <KPICard icon={<PieChart className="text-indigo-600" />} label="Fuerza Laboral" value="Activa" trend="Análisis BI" trendColor="text-slate-400" />
      </div>

      {/* Section 1: Retention & Finance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Tendencia de Rotación</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={turnoverData}>
                <defs>
                  <linearGradient id="colorTurnover" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="turnover" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorTurnover)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Nómina vs Presupuesto</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} width={120} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="budget" fill="#f1f5f9" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="actual" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 2: Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Género</h2>
          <div className="h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChartRecharts>
                <Pie
                  data={demoData?.gender}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {demoData?.gender.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" />
              </PieChartRecharts>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Distribución por Edad</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demoData?.age}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Antigüedad</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demoData?.tenure}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 3: Cost Center Efficiency */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
          <h2 className="text-xl font-bold text-slate-900">Eficiencia por Centro de Costos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Centro de Costos</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Presupuesto</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gastado</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilización</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {budgetData.map((cc) => (
                <tr key={cc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-4">
                    <p className="font-bold text-slate-900">{cc.name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase">{cc.code}</p>
                  </td>
                  <td className="px-8 py-4 font-bold text-slate-600">${cc.budget.toLocaleString()}</td>
                  <td className="px-8 py-4 font-bold text-slate-900">${cc.actual.toLocaleString()}</td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${cc.utilization > 100 ? 'bg-rose-500' : cc.utilization > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(cc.utilization, 100)}%` }}></div>
                      </div>
                      <span className="text-xs font-black text-slate-500">{cc.utilization}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      cc.status === 'OVER_BUDGET' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      cc.status === 'WARNING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {cc.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Re-naming components to avoid conflict with standard HTML/React names
const PieChartRecharts = PieChart;
import { Pie, Cell } from "recharts";

function KPICard({ icon, label, value, trend, trendColor }: { icon: any, label: string, value: string, trend: string, trendColor: string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 mb-2">{value}</h3>
      <p className={`text-xs font-bold ${trendColor}`}>{trend}</p>
    </div>
  );
}

function InsightRow({ label, value, description }: { label: string, value: string, description: string }) {
  return (
    <div className="border-l-2 border-indigo-500/30 pl-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-bold text-emerald-400">{value}</span>
      </div>
      <p className="text-sm text-slate-400 font-medium leading-relaxed">{description}</p>
    </div>
  );
}
