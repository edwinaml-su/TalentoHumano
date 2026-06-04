"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Target, 
  TrendingUp, 
  Award, 
  Plus, 
  Calendar, 
  User,
  CheckCircle2,
  Clock,
  Loader2,
  ChevronRight,
  Trophy
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Goal {
  id: string;
  title: string;
  weight: number;
  status: string;
  endDate: string;
  employee: {
    id: string;
    firstName: string;
    firstSurname: string;
  };
}

export default function PerformancePage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [goalRes, statRes] = await Promise.all([
          fetch("/api/performance/goals"),
          fetch("/api/admin/performance/stats")
        ]);
        setGoals(await goalRes.json());
        setStats(await statRes.json());
      } catch (err) {
        toast.error("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Toaster position="top-right" />
      
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full">Fase 2: Gestión de Talento</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Desempeño & KPIs</h1>
          <p className="text-slate-500 font-medium">Panel estratégico para la toma de decisiones basada en talento.</p>
        </div>

        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">
          <Plus size={20} />
          Nueva Meta
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<Target className="text-indigo-600" />} label="Metas Totales" value={goals.length.toString()} trend="Global" />
        <StatCard icon={<TrendingUp className="text-emerald-600" />} label="Nota Promedio" value={stats?.averageScore || "0.0"} trend="Escala 1-5" />
        <StatCard icon={<CheckCircle2 className="text-blue-600" />} label="Evaluaciones" value={`${stats?.completionRate || 0}%`} trend="Completadas" />
        <StatCard icon={<Award className="text-amber-600" />} label="Talento Top" value={stats?.topPerformers?.length.toString() || "0"} trend="Puntuación > 4.5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Goals List */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h2 className="text-xl font-bold text-slate-900">Seguimiento de Objetivos</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {goals.map((goal) => (
                <div key={goal.id} className="p-6 hover:bg-slate-50/50 transition-all group flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
                      <Target size={24} className="text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{goal.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <User size={12} /> {goal.employee.firstName} {goal.employee.firstSurname}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-l pl-3">
                          <Calendar size={12} /> Vence: {new Date(goal.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peso</p>
                      <p className="font-bold text-slate-900">{goal.weight}%</p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => router.push(`/admin/performance/evaluate/${goal.employee.id}`)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        Evaluar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Performers Ranking */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Trophy className="text-amber-500" size={24} />
              <h2 className="text-xl font-bold text-slate-900">Ranking de Talento</h2>
            </div>
            
            <div className="space-y-6">
              {stats?.topPerformers?.map((perf: any, idx: number) => (
                <div key={perf.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                      idx === 0 ? 'bg-amber-100 text-amber-700' : 
                      idx === 1 ? 'bg-slate-100 text-slate-600' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{perf.employee.firstName} {perf.employee.firstSurname}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase">{perf.employee.position.title}</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-indigo-600">{Number(perf.score).toFixed(1)}</span>
                </div>
              ))}
              {!stats?.topPerformers?.length && <p className="text-center text-slate-400 text-sm italic">Pendiente de cierre de ciclo.</p>}
            </div>
          </section>

          <section className="bg-indigo-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
            <h3 className="text-lg font-bold mb-4">Próximo Hito</h3>
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl mb-4">
              <Calendar size={20} className="text-indigo-300" />
              <div>
                <p className="text-xs font-bold text-indigo-200">CIERRE Q1 2026</p>
                <p className="text-sm font-black">31 de Marzo</p>
              </div>
            </div>
            <p className="text-xs text-indigo-300 leading-relaxed">
              Recuerda que todas las evaluaciones deben estar completadas antes de la fecha de cierre para el cálculo de bonos por desempeño.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: any, label: string, value: string, trend: string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 mb-2">{value}</h3>
      <p className="text-xs font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-lg">{trend}</p>
    </div>
  );
}
