"use client";

import { useState, useEffect } from "react";
import { 
  UserMinus, 
  BarChart, 
  MessageCircle, 
  AlertTriangle,
  Loader2,
  ChevronRight,
  TrendingDown
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from "recharts";

const CAUSE_COLORS = ['#f43f5e', '#fbbf24', '#6366f1', '#10b981', '#94a3b8'];

export default function ExitAnalysisPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/analytics/exit-analysis");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const causeData = [
    { name: "Salario", value: 45 },
    { name: "Crecimiento", value: 25 },
    { name: "Ambiente", value: 15 },
    { name: "Liderazgo", value: 10 },
    { name: "Otros", value: 5 },
  ];

  if (loading) return <div className="flex items-center justify-center py-40"><Loader2 className="animate-spin text-rose-600" size={40} /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-widest rounded-full">Fase 3: Inteligencia de Retención</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Análisis de Salida</h1>
          <p className="text-slate-500 font-medium">Comprendiendo las causas raíz de la rotación para mejorar la retención.</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-rose-50 px-6 py-3 rounded-2xl border border-rose-100">
            <p className="text-[10px] font-black text-rose-400 uppercase mb-1">Impacto en Headcount</p>
            <p className="text-xl font-black text-rose-700 flex items-center gap-2"><TrendingDown size={20} /> -12% anual</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Causes Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Causas Principales</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={causeData} innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value">
                  {causeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CAUSE_COLORS[index % CAUSE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {causeData.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CAUSE_COLORS[i] }}></div>
                <span className="text-xs font-bold text-slate-600">{c.name}: {c.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <MessageCircle className="text-rose-500" /> Feedback Directo
          </h2>
          <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {data.length > 0 ? data.map((resp, i) => (
              <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-600 italic leading-relaxed">"{resp.comment || "Sin comentarios adicionales"}"</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] font-black text-rose-400 uppercase">Score de Salida: {resp.score}/10</span>
                  <AlertTriangle size={14} className="text-amber-500" />
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm italic">No hay feedback reciente disponible.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Retention Alerts */}
      <section className="bg-slate-900 p-10 rounded-[3rem] text-white">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
          <AlertTriangle className="text-amber-400" /> Alertas de Riesgo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AlertCard title="Fuga por Salario" description="El 45% de las bajas mencionan oferta económica competitiva." severity="High" />
          <AlertCard title="Estancamiento" description="Empleados de 2-3 años reportan falta de línea de carrera." severity="Medium" />
          <AlertCard title="Clima de Área" description="Departamento Comercial reporta eNPS negativo este mes." severity="Critical" />
        </div>
      </section>
    </div>
  );
}

function AlertCard({ title, description, severity }: { title: string, description: string, severity: string }) {
  const colors = {
    High: "text-orange-400",
    Medium: "text-amber-400",
    Critical: "text-rose-400"
  };
  return (
    <div className="border-l-2 border-slate-700 pl-6">
      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${colors[severity as keyof typeof colors]}`}>{severity}</p>
      <h4 className="font-bold mb-2">{title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
